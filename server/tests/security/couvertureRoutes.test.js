import fs from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

const SRC = path.resolve(import.meta.dirname, "../../src");

/**
 * Inventaire exhaustif du contrôle d'accès, exécuté à chaque passe.
 *
 * Un document figé aurait vieilli dès la route suivante. Ce test analyse les
 * fichiers de routes et de contrôleurs à chaque exécution : **toute route ajoutée
 * sans garde fera échouer la suite**, sans que personne ait à y penser.
 *
 * C'est la réponse à la vraie question — non pas « telle faille est-elle fermée »,
 * mais « reste-t-il une porte ouverte quelque part ».
 */

/** Seules routes légitimement publiques : on ne peut pas exiger d'être connecté pour se connecter. */
const PUBLIQUES_AUTORISEES = [
  "POST /register",
  "POST /login",
  "GET /verify-email/:token",
  "POST /resend-verification",
  "POST /forgot-password",
  "POST /reset-password/:token",
];

function fichiers(dir) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".js")) out.push(p);
    }
  })(dir);
  return out;
}

/** Handlers de contrôleur et les gardes qu'ils appliquent eux-mêmes. */
function gardesParHandler() {
  const map = new Map();
  for (const p of fichiers(path.join(SRC, "controllers"))) {
    const src = fs.readFileSync(p, "utf8");
    const re =
      /export (?:const (\w+) = (?:asyncHandler\()?async|async function (\w+))/g;
    const positions = [];
    let m;
    while ((m = re.exec(src))) positions.push([m[1] || m[2], m.index]);
    positions.forEach(([nom, debut], i) => {
      const fin = i + 1 < positions.length ? positions[i + 1][1] : src.length;
      const corps = src.slice(debut, fin);
      const gardes = [];
      if (/req\.userId/.test(corps)) gardes.push("req.userId");
      if (/checkAccountAccess/.test(corps)) gardes.push("checkAccountAccess");
      if (/getUserAccounts/.test(corps)) gardes.push("getUserAccounts");
      if (/req\.accountId/.test(corps)) gardes.push("req.accountId");
      map.set(nom, gardes);
    });
  }
  return map;
}

function routes() {
  const gardes = gardesParHandler();
  const out = [];
  for (const f of fichiers(path.join(SRC, "routes"))) {
    const src = fs.readFileSync(f, "utf8");
    const re =
      /router\.(get|post|put|patch|delete)\(\s*("[^"]*")([\s\S]*?)\n\);|router\.(get|post|put|patch|delete)\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(src))) {
      const verbe = (m[1] || m[4]).toUpperCase();
      const chemin = (m[2] || (m[5] || "").split(",")[0] || "")
        .replace(/"/g, "")
        .trim();
      const corps = m[3] ?? m[5] ?? "";
      const handler = (corps.match(/(\w+),?\s*$/) || [])[1] ?? "?";
      out.push({
        cle: `${verbe} ${chemin}`,
        fichier: path.relative(SRC, f).replace(/\\/g, "/"),
        adminAuth: /adminAuth/.test(corps),
        requirePermission: /requirePermission\(/.test(corps),
        gardeHandler: gardes.get(handler) ?? [],
      });
    }
  }
  return out;
}

describe("Couverture du contrôle d'accès — inventaire exhaustif", () => {
  const toutes = routes();

  it("analyse bien l'ensemble des routes du projet", () => {
    expect(toutes.length).toBeGreaterThan(100);
  });

  it("aucune route sans contrôle d'accès, hors les 6 routes publiques d'authentification", () => {
    const sansGarde = toutes.filter(
      (r) =>
        !r.requirePermission &&
        !r.adminAuth &&
        r.gardeHandler.length === 0 &&
        !PUBLIQUES_AUTORISEES.includes(r.cle),
    );

    // Message explicite : si ce test tombe, il dit QUELLE route et OÙ.
    const detail = sansGarde
      .map((r) => `${r.cle}  (${r.fichier})`)
      .join("\n  ");

    expect(
      sansGarde.length,
      `Routes sans aucun contrôle d'accès :\n  ${detail}\n` +
        `Ajoutez requirePermission, adminAuth, ou un filtre sur req.userId dans le contrôleur.`,
    ).toBe(0);
  });

  it("la liste des routes publiques n'a pas été élargie en douce", () => {
    expect(PUBLIQUES_AUTORISEES).toHaveLength(6);
    expect(PUBLIQUES_AUTORISEES.every((r) => /^(POST|GET) \//.test(r))).toBe(true);
  });
});
