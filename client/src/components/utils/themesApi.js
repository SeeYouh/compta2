/**
 * API pour gérer les thèmes via le backend Express/MongoDB
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Récupère tous les thèmes depuis l'API
 */
export async function getThemes() {
  const response = await fetch(`${API_BASE_URL}/themes`);
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Sauvegarde tous les thèmes
 * Utilise PUT pour remplacer l'objet complet
 */
export async function saveThemes(themes) {
  const response = await fetch(`${API_BASE_URL}/themes`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(themes),
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Ajoute ou met à jour un thème spécifique
 */
export async function upsertTheme(themeId, themeData) {
  const response = await fetch(`${API_BASE_URL}/themes/${themeId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(themeData),
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Supprime un thème
 */
export async function deleteTheme(themeId) {
  const response = await fetch(`${API_BASE_URL}/themes/${themeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
