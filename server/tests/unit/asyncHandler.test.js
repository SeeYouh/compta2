import { describe, expect, it, vi } from "vitest";

import { asyncHandler } from "../../src/utils/asyncHandler.js";

/**
 * asyncHandler enveloppe 27 handlers Express. S'il cesse de transmettre les rejets
 * à next(), la gestion d'erreur centralisée est désactivée EN SILENCE : les requêtes
 * restent pendantes et errorHandler n'est jamais atteint.
 *
 * C'est exactement le défaut corrigé par AUD-D-01. Ces tests existent pour qu'il ne
 * puisse pas revenir.
 */
describe("asyncHandler", () => {
  it("produit un middleware d'arité 3 — Express doit y voir un handler ordinaire, pas un gestionnaire d'erreurs (qui serait d'arité 4)", () => {
    const wrapped = asyncHandler(async () => {});
    expect(wrapped.length).toBe(3);
  });

  it("transmet les arguments req, res, next au handler enveloppé", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const req = { userId: "user-1" };
    const res = {};
    const next = vi.fn();

    await asyncHandler(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it("n'appelle pas next() quand le handler réussit", async () => {
    const next = vi.fn();

    await asyncHandler(async () => "ok")({}, {}, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("transmet à next() l'erreur d'une promesse rejetée — le cœur du dispositif", async () => {
    const boom = new Error("Timeout MongoDB");
    const next = vi.fn();

    await asyncHandler(async () => {
      throw boom;
    })({}, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(boom);
  });

  it("transmet aussi une erreur levée de façon synchrone", async () => {
    const boom = new Error("CastError sur un id malformé");
    const next = vi.fn();

    await asyncHandler(() => {
      throw boom;
    })({}, {}, next);

    expect(next).toHaveBeenCalledWith(boom);
  });

  it("préserve la cause exacte, sans l'envelopper ni la reformuler", async () => {
    const cause = new TypeError("Cannot read properties of undefined");
    const next = vi.fn();

    await asyncHandler(async () => {
      throw cause;
    })({}, {}, next);

    const transmitted = next.mock.calls[0][0];
    expect(transmitted).toBe(cause);
    expect(transmitted).toBeInstanceOf(TypeError);
    expect(transmitted.message).toBe("Cannot read properties of undefined");
  });

  it("gère un handler non-async qui retourne une promesse rejetée", async () => {
    const boom = new Error("rejet sans async");
    const next = vi.fn();

    await asyncHandler(() => Promise.reject(boom))({}, {}, next);

    expect(next).toHaveBeenCalledWith(boom);
  });
});
