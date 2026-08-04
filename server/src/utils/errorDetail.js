import { config } from "../config/index.js";

/**
 * Module de détail des erreurs selon l'environnement.
 *
 * En développement et en test, on veut le **maximum d'information** : nom de la
 * permission manquante, identifiants refusés, cause exacte. C'est ce qui rend une
 * erreur exploitable.
 *
 * En production, la même erreur doit rester diagnosticable côté serveur sans
 * exposer la structure interne au client. Le message générique part au client,
 * le détail reste dans les journaux.
 *
 * Ce n'est PAS un arbitrage entre les deux : c'est le même diagnostic, servi à
 * deux publics différents.
 */
export const isVerbose = () => config.server.env !== "production";

/**
 * @param {string} verbose  message détaillé (développement / test)
 * @param {string} generic  message neutre (production)
 * @returns {string}
 */
export function detail(verbose, generic) {
  return isVerbose() ? verbose : generic;
}

/**
 * Champs supplémentaires à joindre à une réponse d'erreur — uniquement hors
 * production. Retourne un objet vide en production, ce qui le rend inoffensif
 * dans un spread.
 *
 * @param {object} fields
 * @returns {object}
 */
export function detailFields(fields) {
  return isVerbose() ? fields : {};
}
