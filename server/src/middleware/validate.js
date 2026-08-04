import { detail, detailFields } from "../utils/errorDetail.js";

/**
 * Validation déclarative des entrées.
 *
 * Deux rôles, indissociables :
 *
 * 1. **Rejeter tôt et clairement.** Sans schéma, une donnée malformée descend
 *    jusqu'à Mongoose et produit un 500 opaque là où un 400 explicite est attendu.
 *
 * 2. **Neutraliser l'affectation de masse.** `parse()` de Zod ne conserve QUE les
 *    champs déclarés : `req.body` est remplacé par la version validée. Un client
 *    qui glisse `accountId` dans la mise à jour d'une transaction voit ce champ
 *    disparaître avant d'atteindre le contrôleur — c'est ce qui rendait SEC-01
 *    exploitable au-delà du simple IDOR.
 *
 * @param {import("zod").ZodType} schema
 * @param {"body"|"params"|"query"} source
 */
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Chaque problème est nommé : chemin du champ + raison. Une erreur de
      // validation doit dire QUOI corriger, pas seulement qu'il y a une erreur.
      const problemes = result.error.issues.map((i) => ({
        champ: i.path.join(".") || "(racine)",
        probleme: i.message,
      }));

      console.warn(
        `[${req.id ?? "sans-id"}] Validation refusée sur ${req.method} ${req.originalUrl} :`,
        JSON.stringify(problemes),
      );

      return res.status(400).json({
        error: detail(
          `Données invalides : ${problemes.map((p) => `${p.champ} — ${p.probleme}`).join(" ; ")}`,
          "Données invalides",
        ),
        requestId: req.id ?? null,
        ...detailFields({ problemes }),
      });
    }

    // Remplacement par la version validée : les champs non déclarés sont perdus.
    req[source] = result.data;
    next();
  };
