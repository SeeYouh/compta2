import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import {
  auth,
  buildApp,
  startMemoryMongo,
  stopMemoryMongo,
  tokenFor,
} from "./harness.js";

/**
 * SUITE DE NON-RÉGRESSION SÉCURITÉ — isolation des données entre utilisateurs.
 *
 * Ces tests sont écrits AVANT les corrections d'AUDIT_2.md. Ils DOIVENT échouer
 * aujourd'hui : c'est ce qui prouve que les failles existent réellement, et non
 * qu'elles sont supposées. Ils passeront au vert une fois SEC-01 à SEC-05 corrigés,
 * et interdiront toute réintroduction.
 *
 * Scénario commun :
 *   - Alice possède le compte X, avec un thème et une transaction.
 *   - Bob est authentifié et n'a AUCUN accès au compte X.
 */
let app;
let Account, Theme, Transaction, User;

const ALICE = "user-alice";
const BOB = "user-bob";
const ACCOUNT_X = "account-alice-x";
const TX_ALICE = "tx-alice-1";

beforeAll(async () => {
  await startMemoryMongo();
  app = await buildApp();

  ({ Account } = await import("../../src/models/synapse/Account.js"));
  ({ Theme } = await import("../../src/models/synapse/Theme.js"));
  ({ Transaction } = await import("../../src/models/synapse/Transaction.js"));
  ({ User } = await import("../../src/models/User.js"));

  await User.create([
    { id: ALICE, email: "alice@test.fr", password: "motdepasse", name: "Alice" },
    { id: BOB, email: "bob@test.fr", password: "motdepasse", name: "Bob" },
  ]);

  await Account.create({
    id: ACCOUNT_X,
    userId: ALICE,
    name: "Compte d'Alice",
    isTemplate: false,
    sharedWith: [],
  });

  await Theme.create({
    id: "theme-alice",
    accountId: ACCOUNT_X,
    name: "Courses",
    slug: "courses",
  });

  await Transaction.create({
    id: TX_ALICE,
    accountId: ACCOUNT_X,
    date: "01/01/2026",
    themeId: "theme-alice",
    subThemeId: "sub-alice",
    payment: "Carte",
    designation: "Transaction privée d'Alice",
    depense: 42,
  });
}, 120000);

afterAll(async () => {
  await stopMemoryMongo();
});

describe("[SEC-01] Transactions — un tiers ne peut ni modifier ni supprimer", () => {
  it("refuse à Bob la modification d'une transaction du compte d'Alice", async () => {
    const res = await request(app)
      .patch(`/api/synapse/transactions/${TX_ALICE}`)
      .set(auth(tokenFor(BOB)))
      .send({ designation: "PIRATÉ PAR BOB" });

    expect(res.status).toBe(403);

    const after = await Transaction.findOne({ id: TX_ALICE });
    expect(after.designation).toBe("Transaction privée d'Alice");
  });

  it("refuse à Bob le déplacement d'une transaction vers son propre compte (affectation de masse)", async () => {
    await request(app)
      .patch(`/api/synapse/transactions/${TX_ALICE}`)
      .set(auth(tokenFor(BOB)))
      .send({ accountId: "account-bob" });

    const after = await Transaction.findOne({ id: TX_ALICE });
    expect(after.accountId).toBe(ACCOUNT_X);
  });

  it("refuse à Bob la suppression d'une transaction du compte d'Alice", async () => {
    const res = await request(app)
      .delete(`/api/synapse/transactions/${TX_ALICE}`)
      .set(auth(tokenFor(BOB)));

    expect(res.status).toBe(403);
    expect(await Transaction.findOne({ id: TX_ALICE })).not.toBeNull();
  });
});

describe("[SEC-02] Comptes — un tiers ne peut pas détruire le compte d'autrui", () => {
  it("refuse à Bob la suppression du compte d'Alice, et n'efface rien en cascade", async () => {
    const res = await request(app)
      .delete(`/api/synapse/accounts/${ACCOUNT_X}`)
      .set(auth(tokenFor(BOB)));

    expect(res.status).toBe(403);
    expect(await Account.findOne({ id: ACCOUNT_X })).not.toBeNull();
    expect(await Transaction.countDocuments({ accountId: ACCOUNT_X })).toBeGreaterThan(0);
    expect(await Theme.countDocuments({ accountId: ACCOUNT_X })).toBeGreaterThan(0);
  });
});

describe("[SEC-03] Thèmes — PUT /themes ne doit pas être une bombe globale", () => {
  it("ne détruit pas les thèmes d'Alice quand Bob remplace les siens", async () => {
    await request(app)
      .put("/api/synapse/themes")
      .set(auth(tokenFor(BOB)))
      .send({
        "theme-bob": {
          id: "theme-bob",
          accountId: "account-bob",
          name: "Thème de Bob",
          slug: "bob",
          subThemes: {},
        },
      });

    const themeAlice = await Theme.findOne({ id: "theme-alice" });
    expect(themeAlice).not.toBeNull();
    expect(themeAlice.accountId).toBe(ACCOUNT_X);
  });

  it("ne renvoie pas à Bob les thèmes des comptes auxquels il n'a pas accès", async () => {
    const res = await request(app)
      .put("/api/synapse/themes")
      .set(auth(tokenFor(BOB)))
      .send({});

    const renvoyes = JSON.stringify(res.body ?? {});
    expect(renvoyes).not.toContain(ACCOUNT_X);
  });
});

describe("[SEC-04] Permissions fines — un invité en lecture seule ne peut pas écrire", () => {
  it("refuse la création d'une transaction à un membre sans droit d'écriture", async () => {
    await Account.updateOne(
      { id: ACCOUNT_X },
      { $set: { sharedWith: [{ userId: BOB, permissions: { canViewTransactions: true } }] } },
    );

    const res = await request(app)
      .post("/api/synapse/transactions")
      .set(auth(tokenFor(BOB)))
      .send({
        accountId: ACCOUNT_X,
        date: "02/01/2026",
        themeId: "theme-alice",
        subThemeId: "sub-alice",
        payment: "Carte",
        designation: "Écriture interdite",
        depense: 10,
      });

    expect(res.status).toBe(403);
    expect(
      await Transaction.findOne({ designation: "Écriture interdite" }),
    ).toBeNull();

    await Account.updateOne({ id: ACCOUNT_X }, { $set: { sharedWith: [] } });
  });
});

describe("[SEC-05] Comptes de tiers — aucune fuite de nom entre utilisateurs", () => {
  it("ne fait jamais apparaître le compte d'Alice dans les comptes vus par Bob", async () => {
    const res = await request(app)
      .get("/api/synapse/accounts")
      .set(auth(tokenFor(BOB)));

    expect(JSON.stringify(res.body ?? {})).not.toContain("Compte d'Alice");
  });

  /**
   * Le vrai chemin de fuite : `syncAccountTransferThemes` s'exécute à la création
   * d'un compte et injectait un sous-thème par compte existant — TOUS utilisateurs
   * confondus. Bob créant un compte voyait donc apparaître « Compte d'Alice »
   * comme cible de virement.
   */
  it("ne fait pas fuiter le nom du compte d'Alice quand Bob crée un compte", async () => {
    const res = await request(app)
      .post("/api/synapse/accounts")
      .set(auth(tokenFor(BOB)))
      .send({ name: "Compte de Bob" });

    expect([200, 201]).toContain(res.status);

    const comptesDeBob = await Account.find({ userId: BOB }).select("id");
    const themesDeBob = await Theme.find({
      accountId: { $in: comptesDeBob.map((a) => a.id) },
    });

    expect(JSON.stringify(themesDeBob)).not.toContain("Compte d'Alice");

    // Et symétriquement : les thèmes d'Alice ne doivent pas parler du compte de Bob.
    const themesDAlice = await Theme.find({ accountId: ACCOUNT_X });
    expect(JSON.stringify(themesDAlice)).not.toContain("Compte de Bob");
  });
});

/**
 * Brèches de la même famille que SEC-01/03, trouvées par l'inventaire exhaustif
 * des 122 routes — et NON par l'audit initial, qui procédait par lecture ciblée.
 */
describe("[SEC-13] Thèmes ciblés — un tiers ne peut ni créer ni supprimer chez autrui", () => {
  it("refuse à Bob la modification d'un thème du compte d'Alice", async () => {
    const res = await request(app)
      .post("/api/synapse/themes/theme-alice")
      .set(auth(tokenFor(BOB)))
      .send({ name: "Détourné", slug: "detourne" });

    expect(res.status).toBe(403);
    expect((await Theme.findOne({ id: "theme-alice" })).name).toBe("Courses");
  });

  it("refuse à Bob la suppression d'un thème du compte d'Alice", async () => {
    const res = await request(app)
      .delete("/api/synapse/themes/theme-alice")
      .set(auth(tokenFor(BOB)));

    expect(res.status).toBe(403);
    expect(await Theme.findOne({ id: "theme-alice" })).not.toBeNull();
  });
});

describe("[SEC-14] Import CSV — un tiers ne peut pas injecter dans le compte d'autrui", () => {
  it("refuse à Bob l'insertion de transactions dans le compte d'Alice", async () => {
    const avant = await Transaction.countDocuments({ accountId: ACCOUNT_X });

    const res = await request(app)
      .post("/api/synapse/import/confirm")
      .set(auth(tokenFor(BOB)))
      .send({
        accountId: ACCOUNT_X,
        transactions: [
          {
            date: "03/01/2026",
            themeId: "theme-alice",
            subThemeId: "sub-alice",
            payment: "Carte",
            designation: "Injectée par Bob",
            depense: 99,
          },
        ],
      });

    expect(res.status).toBe(403);
    expect(await Transaction.countDocuments({ accountId: ACCOUNT_X })).toBe(avant);
    expect(await Transaction.findOne({ designation: "Injectée par Bob" })).toBeNull();
  });
});

describe("[SEC-06] Odyssée — lecture d'une entité d'autrui par identifiant", () => {
  it("refuse à Bob la lecture d'un item Odyssée appartenant à Alice", async () => {
    const { OdysseeItem } = await import(
      "../../src/models/odyssee/OdysseeItem.js"
    );
    const mongoose = (await import("mongoose")).default;

    const item = await OdysseeItem.create({
      userId: ALICE,
      categoryId: new mongoose.Types.ObjectId(),
      name: "Voyage privé d'Alice",
      isActive: true,
      contentFilesData: { productName: "Voyage privé d'Alice" },
    });

    const res = await request(app)
      .get(`/api/odyssee/odyssey/items/${item._id}`)
      .set(auth(tokenFor(BOB)));

    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body ?? {})).not.toContain("Voyage privé d'Alice");
  });
});
