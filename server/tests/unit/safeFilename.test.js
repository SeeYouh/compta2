import path from "path";

import { describe, expect, it } from "vitest";

import { safeFilename } from "../../src/utils/safeFilename.js";

/**
 * Multer joint le résultat au dossier de destination sans le vérifier. Un nom
 * mal assaini permet donc d'écrire hors du dossier prévu (SEC-07).
 *
 * Le test décisif est le dernier : on recompose le chemin réel et on vérifie
 * qu'il reste sous la destination. Vérifier l'absence de « .. » dans la chaîne
 * ne suffirait pas — c'est le chemin résolu qui compte.
 */
describe("safeFilename", () => {
  it("conserve un nom simple", () => {
    expect(safeFilename("photo.png")).toBe("photo");
  });

  it("remplace espaces et caractères accentués par des underscores", () => {
    // Les accents tombent hors de la liste blanche : « été » → « _t_ ».
    // Compromis assumé — la lisibilité du nom stocké cède devant la sûreté du
    // chemin. L'extension est réimposée et un horodatage garantit l'unicité.
    expect(safeFilename("ma photo été.jpg")).toBe("ma_photo__t_");
  });

  it("neutralise une traversée POSIX", () => {
    expect(safeFilename("../../../etc/passwd.png")).toBe("passwd");
  });

  it("neutralise une traversée Windows", () => {
    expect(safeFilename("..\\..\\Windows\\System32\\evil.png")).toBe("evil");
  });

  it("neutralise un chemin absolu", () => {
    expect(safeFilename("/var/www/html/shell.png")).toBe("shell");
  });

  it("refuse un nom entièrement composé de séparateurs", () => {
    expect(safeFilename("../../..")).toBe("fichier");
  });

  it("refuse un nom vide ou non textuel", () => {
    expect(safeFilename("")).toBe("fichier");
    expect(safeFilename(undefined)).toBe("fichier");
    expect(safeFilename(null)).toBe("fichier");
  });

  it("interdit les noms cachés commençant par un point", () => {
    expect(safeFilename(".htaccess")).toBe("fichier");
    expect(safeFilename("..evil.png")).toBe("evil");
  });

  it("borne la longueur", () => {
    expect(safeFilename("a".repeat(500) + ".png").length).toBeLessThanOrEqual(100);
  });

  it("le chemin résolu reste sous le dossier de destination — test décisif", () => {
    const destination = "/srv/app/odyssee-images";

    for (const hostile of [
      "../../../etc/passwd.png",
      "..\\..\\Windows\\evil.png",
      "/etc/shadow.png",
      "....//....//escape.png",
    ]) {
      const resolu = path.resolve(
        destination,
        `${safeFilename(hostile)}-123.png`,
      );
      expect(resolu.startsWith(path.resolve(destination))).toBe(true);
    }
  });
});
