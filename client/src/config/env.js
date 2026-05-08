/**
 * Configuration des variables d'environnement avec détection automatique
 * En production : utilise /api (même domaine)
 * En développement : utilise VITE_API_URL depuis .env
 */

const API_URL = import.meta.env.PROD ? "" : import.meta.env.VITE_API_URL;

// Validation uniquement en développement
if (!import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error(
    "❌ ERREUR CONFIGURATION : La variable VITE_API_URL n'est pas définie dans le fichier .env\n\n" +
      "Pour corriger ce problème :\n" +
      "1. Créez un fichier .env à la racine du dossier client/\n" +
      "2. Ajoutez la ligne : VITE_API_URL=http://localhost:5000\n" +
      "3. Redémarrez le serveur de développement",
  );
}

export const config = {
  apiUrl: API_URL,
};
