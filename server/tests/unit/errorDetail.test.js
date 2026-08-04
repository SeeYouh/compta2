import { afterEach, describe, expect, it, vi } from "vitest";

import { config } from "../../src/config/index.js";
import { detail, detailFields, isVerbose } from "../../src/utils/errorDetail.js";

/**
 * Ce module décide de ce qu'un client a le droit de savoir.
 *
 * Une régression ici a deux visages opposés, tous deux graves :
 * - en développement, perdre le diagnostic (on ne sait plus pourquoi ça échoue) ;
 * - en production, fuiter la structure interne (identifiants, permissions).
 */
const withEnv = (env, fn) => {
  const original = config.server.env;
  config.server.env = env;
  try {
    return fn();
  } finally {
    config.server.env = original;
  }
};

afterEach(() => vi.restoreAllMocks());

describe("isVerbose", () => {
  it("est verbeux en développement", () => {
    expect(withEnv("development", isVerbose)).toBe(true);
  });

  it("est verbeux en test — sinon le département de test ne verrait rien", () => {
    expect(withEnv("test", isVerbose)).toBe(true);
  });

  it("est muet en production, et uniquement là", () => {
    expect(withEnv("production", isVerbose)).toBe(false);
  });
});

describe("detail", () => {
  it("sert le message détaillé hors production", () => {
    expect(
      withEnv("development", () => detail("permission X requise", "Refusé")),
    ).toBe("permission X requise");
  });

  it("sert le message neutre en production", () => {
    expect(
      withEnv("production", () => detail("permission X requise", "Refusé")),
    ).toBe("Refusé");
  });
});

describe("detailFields", () => {
  it("expose les champs de diagnostic hors production", () => {
    const fields = withEnv("development", () =>
      detailFields({ accountId: "account-1", permissionRequise: "canEdit" }),
    );
    expect(fields).toEqual({
      accountId: "account-1",
      permissionRequise: "canEdit",
    });
  });

  it("retourne un objet vide en production — inoffensif dans un spread", () => {
    const fields = withEnv("production", () =>
      detailFields({ accountId: "account-1" }),
    );
    expect(fields).toEqual({});
    expect({ error: "Refusé", ...fields }).toEqual({ error: "Refusé" });
  });

  it("ne laisse fuiter aucun identifiant en production", () => {
    const payload = withEnv("production", () => ({
      error: detail("compte account-secret inaccessible", "Accès refusé"),
      ...detailFields({ accountId: "account-secret", userId: "user-42" }),
    }));

    const serialise = JSON.stringify(payload);
    expect(serialise).not.toContain("account-secret");
    expect(serialise).not.toContain("user-42");
  });
});
