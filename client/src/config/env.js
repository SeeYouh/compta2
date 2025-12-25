/**
 * Configuration des variables d'environnement avec validation
 * Retourne une erreur claire si VITE_API_URL n'est pas définie
 */

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "❌ ERREUR CONFIGURATION : La variable VITE_API_URL n'est pas définie dans le fichier .env\n\n" +
      "Pour corriger ce problème :\n" +
      "1. Créez un fichier .env à la racine du dossier client/\n" +
      "2. Ajoutez la ligne : VITE_API_URL=http://localhost:5000\n" +
      "3. Redémarrez le serveur de développement"
  );
}

export const config = {
  apiUrl: API_URL,
};
