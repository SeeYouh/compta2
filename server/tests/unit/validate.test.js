import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { validate } from "../../src/middleware/validate.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../../src/schemas/synapse.js";

const run = (schema, body) => {
  const req = { body, method: "POST", originalUrl: "/x", id: "req-1" };
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  const next = vi.fn();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  validate(schema)(req, res, next);
  return { req, res, next };
};

describe("validate — rejet et diagnostic", () => {
  it("laisse passer une entrée conforme", () => {
    const { next, res } = run(z.object({ a: z.string() }), { a: "ok" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("répond 400 et non 500 — une entrée invalide n'est pas une panne serveur", () => {
    const { res, next } = run(z.object({ a: z.string() }), { a: 42 });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("nomme le champ fautif ET la raison", () => {
    const { res } = run(createTransactionSchema, { date: "2026-01-01" });
    const payload = res.json.mock.calls[0][0];

    expect(payload.error).toContain("date");
    expect(payload.error).toContain("JJ/MM/AAAA");
    expect(payload.problemes.some((p) => p.champ === "accountId")).toBe(true);
  });

  it("joint l'identifiant de corrélation", () => {
    const { res } = run(z.object({ a: z.string() }), {});
    expect(res.json.mock.calls[0][0].requestId).toBe("req-1");
  });
});

describe("validate — défense contre l'affectation de masse", () => {
  it("supprime les champs non déclarés du corps de requête", () => {
    const { req } = run(z.object({ a: z.string() }), {
      a: "ok",
      champInjecte: "malveillant",
    });
    expect(req.body).toEqual({ a: "ok" });
    expect(req.body.champInjecte).toBeUndefined();
  });

  it("refuse de laisser passer accountId dans une mise à jour de transaction — le vecteur de SEC-01", () => {
    const { req, next } = run(updateTransactionSchema, {
      designation: "Modifiée",
      accountId: "account-de-lattaquant",
    });

    expect(next).toHaveBeenCalled();
    expect(req.body.accountId).toBeUndefined();
    expect(req.body).toEqual({ designation: "Modifiée" });
  });

  it("refuse aussi transferId et linkedAccountId", () => {
    const { req } = run(updateTransactionSchema, {
      designation: "X",
      transferId: "forge",
      linkedAccountId: "account-cible",
    });
    expect(req.body.transferId).toBeUndefined();
    expect(req.body.linkedAccountId).toBeUndefined();
  });
});

describe("schémas Synapse — règles métier", () => {
  it("exige une recette ou une dépense à la création", () => {
    const { res } = run(createTransactionSchema, {
      accountId: "a",
      date: "01/01/2026",
      themeId: "t",
      subThemeId: "s",
      payment: "Carte",
      designation: "Sans montant",
    });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("refuse un montant négatif", () => {
    const { res } = run(createTransactionSchema, {
      accountId: "a",
      date: "01/01/2026",
      themeId: "t",
      subThemeId: "s",
      payment: "Carte",
      designation: "Négatif",
      depense: -10,
    });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("refuse une mise à jour vide", () => {
    const { res } = run(updateTransactionSchema, {});
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("nettoie les espaces superflus", () => {
    const { req } = run(updateTransactionSchema, {
      designation: "   Courses   ",
    });
    expect(req.body.designation).toBe("Courses");
  });
});
