import { describe, expect, it, vi } from "vitest";

import { errorHandler, notFound } from "../../src/middleware/errorHandler.js";

/**
 * errorHandler DOIT avoir une arité de 4. Express reconnaît un gestionnaire
 * d'erreurs à ce seul critère : avec 3 paramètres, il serait monté comme middleware
 * ordinaire et ne recevrait jamais d'erreur — la gestion centralisée serait
 * désactivée en silence.
 *
 * Un nettoyage bien intentionné du paramètre `_next` inutilisé suffirait à casser
 * toute la chaîne. Ce test l'empêche. Voir journal [7-1-006].
 */
describe("errorHandler", () => {
  it("a une arité de 4 — condition pour qu'Express le reconnaisse", () => {
    expect(errorHandler.length).toBe(4);
  });

  it("répond avec le statut porté par l'erreur", () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const err = Object.assign(new Error("Introuvable"), { status: 404 });
    vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("retombe sur 500 quand l'erreur ne porte pas de statut", () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("boum"), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("journalise l'erreur — elle ne doit jamais disparaître en silence", () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("trace attendue"), {}, res, () => {});

    expect(spy).toHaveBeenCalled();
  });
});

describe("notFound", () => {
  it("répond 404 en nommant la route manquante hors production", () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    notFound({ method: "GET", originalUrl: "/api/inconnue", id: "req-1" }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const payload = res.json.mock.calls[0][0];
    expect(payload.error).toContain("/api/inconnue");
    expect(payload.error).toContain("GET");
  });

  it("renvoie l'identifiant de corrélation — sans lui une erreur n'est pas remontable", () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    notFound({ method: "GET", originalUrl: "/x", id: "req-42" }, res);

    expect(res.json.mock.calls[0][0].requestId).toBe("req-42");
  });
});
