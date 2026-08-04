import { z } from "zod";

/**
 * Schémas d'entrée Synapse.
 *
 * Règle de conception : on déclare **exactement** ce qu'une route accepte, jamais
 * plus. Tout champ absent du schéma est supprimé du corps de requête — c'est la
 * défense contre l'affectation de masse.
 *
 * En particulier, `accountId` n'apparaît PAS dans les schémas de mise à jour :
 * le compte d'une transaction ne se change pas par requête. C'est précisément le
 * vecteur qui permettait de déplacer la transaction d'autrui dans son propre
 * compte (SEC-01).
 */

const texteNonVide = (champ, max = 200) =>
  z
    .string({ error: `${champ} est requis` })
    .trim()
    .min(1, `${champ} ne peut pas être vide`)
    .max(max, `${champ} ne peut pas dépasser ${max} caractères`);

const dateFr = z
  .string({ error: "date est requise" })
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "date doit être au format JJ/MM/AAAA");

const montant = z
  .number()
  .nonnegative("un montant ne peut pas être négatif")
  .nullable()
  .optional();

export const createTransactionSchema = z
  .object({
    accountId: texteNonVide("accountId"),
    date: dateFr,
    themeId: texteNonVide("themeId"),
    subThemeId: texteNonVide("subThemeId"),
    payment: texteNonVide("payment", 50),
    designation: texteNonVide("designation", 500),
    recette: montant,
    depense: montant,
    disabled: z.boolean().optional(),
  })
  .refine((t) => t.recette != null || t.depense != null, {
    message: "une transaction doit porter une recette ou une dépense",
  });

/**
 * Mise à jour : tous les champs sont facultatifs, mais `accountId`, `id`,
 * `transferId` et `linkedAccountId` sont VOLONTAIREMENT absents — ils ne doivent
 * jamais être modifiables par le client.
 */
export const updateTransactionSchema = z
  .object({
    date: dateFr.optional(),
    themeId: texteNonVide("themeId").optional(),
    subThemeId: texteNonVide("subThemeId").optional(),
    payment: texteNonVide("payment", 50).optional(),
    designation: texteNonVide("designation", 500).optional(),
    recette: montant,
    depense: montant,
    disabled: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "aucun champ modifiable fourni",
  });

export const createAccountSchema = z.object({
  name: texteNonVide("name", 100),
});

export const updateAccountSchema = z.object({
  name: texteNonVide("name", 100),
});
