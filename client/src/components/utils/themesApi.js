/**
 * API pour gérer les thèmes via le backend Express/MongoDB
 */

import { authFetch } from "./authFetch.js";

/**
 * Récupère tous les thèmes depuis l'API
 */
export async function getThemes() {
  const response = await authFetch("/api/themes");
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
  const response = await authFetch("/api/themes", {
    method: "PUT",
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
  const response = await authFetch(`/api/themes/${themeId}`, {
    method: "POST",
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
  const response = await authFetch(`/api/themes/${themeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
