import { authFetch } from "./authFetch.js";

/**
 * Lance le calcul des projections pour un compte.
 * @param {string} accountId
 * @param {string} horizon - "3m"|"6m"|"1y"|"2y"|"5y"|"10y"
 */
export const computeProjections = async (accountId, horizon = "1y") => {
  const res = await authFetch("/api/projections/compute", {
    method: "POST",
    body: JSON.stringify({ accountId, horizon }),
  });
  if (!res.ok) throw new Error("Erreur lors du calcul des projections");
  return res.json();
};

/**
 * Récupère tous les patterns de projection d'un compte.
 * @param {string} accountId
 */
export const getProjections = async (accountId) => {
  const res = await authFetch(
    `/api/projections?accountId=${encodeURIComponent(accountId)}`,
  );
  if (!res.ok)
    throw new Error("Erreur lors de la récupération des projections");
  return res.json();
};

/**
 * Met à jour les paramètres d'une projection.
 * @param {string} id
 * @param {object} updates - { horizonMonths?, loop?, active?, designation? }
 */
export const updateProjection = async (id, updates) => {
  const res = await authFetch(`/api/projections/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!res.ok)
    throw new Error("Erreur lors de la mise à jour de la projection");
  return res.json();
};

/**
 * Supprime une projection et toutes ses occurrences.
 * @param {string} id
 */
export const deleteProjection = async (id) => {
  const res = await authFetch(`/api/projections/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok)
    throw new Error("Erreur lors de la suppression de la projection");
  return true;
};

/**
 * Récupère les occurrences actives à afficher dans la liste des mouvements.
 * @param {string} accountId
 * @param {number} displayMonths - Nombre de mois à afficher
 */
export const getProjectionOccurrences = async (
  accountId,
  displayMonths = 12,
) => {
  const params = new URLSearchParams({
    accountId,
    displayMonths: String(displayMonths),
  });
  const res = await authFetch(`/api/projections/occurrences?${params}`);
  if (!res.ok)
    throw new Error("Erreur lors de la récupération des occurrences");
  return res.json();
};
