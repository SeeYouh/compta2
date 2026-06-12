import { authFetch } from "./authFetch.js";

// GET /api/synapse/color-preferences
// Retourne { history, variables, defaults }
export const getColorPreferences = async () => {
  const res = await authFetch("/api/synapse/color-preferences");
  if (!res.ok)
    throw new Error("Erreur lors du chargement des préférences de couleur.");
  return res.json();
};

// PATCH /api/synapse/color-preferences/variable
// Met à jour la valeur d'une variable CSS persistée
export const updateColorVariable = async (cssVar, value) => {
  const res = await authFetch("/api/synapse/color-preferences/variable", {
    method: "PATCH",
    body: JSON.stringify({ cssVar, value }),
  });
  if (!res.ok)
    throw new Error("Erreur lors de la mise à jour de la variable de couleur.");
  return res.json();
};

// PATCH /api/synapse/color-preferences/history
// Ajoute une couleur à l'historique (FIFO, sans doublon, max 30)
export const addColorToHistory = async (color) => {
  const res = await authFetch("/api/synapse/color-preferences/history", {
    method: "PATCH",
    body: JSON.stringify({ color }),
  });
  if (!res.ok)
    throw new Error(
      "Erreur lors de la mise à jour de l'historique des couleurs.",
    );
  return res.json();
};

// PATCH /api/synapse/color-preferences/default/:contextKey
// Sauvegarde la couleur par défaut d'un contexte donné
export const setDefaultColor = async (contextKey, color) => {
  const res = await authFetch(`/api/synapse/color-preferences/default/${contextKey}`, {
    method: "PATCH",
    body: JSON.stringify({ color }),
  });
  if (!res.ok)
    throw new Error("Erreur lors de la mise à jour de la couleur par défaut.");
  return res.json();
};
