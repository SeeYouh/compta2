/**
 * Configuration des variables d'environnement
 * En production : utilise /api (même domaine)
 * En développement : utilise VITE_API_URL depuis .env
 */

const API_URL = import.meta.env.PROD ? "" : import.meta.env.VITE_API_URL;

if (!import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error(
    "❌ ERREUR CONFIGURATION : La variable VITE_API_URL n'est pas définie dans le fichier .env\n\n" +
      "Ajoutez la ligne : VITE_API_URL=http://<IP_OU_LOCALHOST>:5000",
  );
}

export const config = {
  apiUrl: API_URL,
};
