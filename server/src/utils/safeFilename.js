import path from "path";

/**
 * Assainit un nom de fichier fourni par le client.
 *
 * Multer joint le résultat du callback `filename` au dossier de destination sans
 * le vérifier : un `originalname` contenant `../` permettait d'écrire HORS du
 * dossier prévu (SEC-07). La précédente implémentation ne remplaçait que les
 * espaces.
 *
 * Trois barrières successives :
 *   1. `path.basename` — retire toute composante de chemin (`../`, `/`, `C:\`) ;
 *   2. liste blanche stricte de caractères ;
 *   3. repli sur "fichier" si le nettoyage ne laisse rien.
 *
 * @param {string} originalname nom brut fourni par le client
 * @returns {string} base de nom sûre, sans extension imposée
 */
export function safeFilename(originalname) {
  if (typeof originalname !== "string" || originalname.trim() === "") {
    return "fichier";
  }

  // basename ne connaît pas les séparateurs Windows sur POSIX : on normalise avant.
  const sansChemin = path.basename(originalname.replace(/\\/g, "/"));

  const nettoye = sansChemin
    .replace(/\.[^.]*$/, "") // l'extension est réimposée par l'appelant
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^[._-]+/, "") // pas de nom caché ni de tiret initial
    .slice(0, 100);

  return nettoye === "" ? "fichier" : nettoye;
}
