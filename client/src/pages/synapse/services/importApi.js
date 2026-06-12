import { config } from "../../../config/env";

const API_BASE_URL = config.apiUrl;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function handleUnauthorized(response) {
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expirée");
  }
}

/**
 * Envoie un fichier CSV au serveur et retourne
 * { separator, headers, preview, savedMapping }.
 */
export async function parseCSV(file) {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/import/parse`, {
    method: "POST",
    headers: getAuthHeaders(),
    body,
  });

  handleUnauthorized(res);
  if (!res.ok) throw new Error("Échec de l'analyse du fichier CSV.");
  return res.json();
}

/**
 * Envoie le fichier CSV + le mapping et retourne { rows } avec
 * statut doublon/suggestion pour chaque ligne.
 */
export async function previewCSV(file, mapping, accountId) {
  const body = new FormData();
  body.append("file", file);
  body.append("mapping", JSON.stringify(mapping));
  body.append("accountId", accountId);

  const res = await fetch(`${API_BASE_URL}/api/import/preview`, {
    method: "POST",
    headers: getAuthHeaders(),
    body,
  });

  handleUnauthorized(res);
  if (!res.ok) throw new Error("Échec de la prévisualisation.");
  return res.json();
}

/**
 * Confirme l'import des transactions enrichies.
 * Envoie par lots de 250 pour ne pas saturer le serveur.
 * Retourne { imported: number }.
 */
export async function confirmImport(transactions, accountId) {
  const CHUNK_SIZE = 250;
  let totalImported = 0;

  for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
    const chunk = transactions.slice(i, i + CHUNK_SIZE);
    const res = await fetch(`${API_BASE_URL}/api/import/confirm`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactions: chunk, accountId }),
    });

    handleUnauthorized(res);
    if (!res.ok) throw new Error("Échec de l'import.");
    const data = await res.json();
    totalImported += data.imported;
  }

  return { imported: totalImported };
}

/**
 * Récupère le mapping CSV mémorisé pour l'utilisateur.
 */
export async function getMapping() {
  const res = await fetch(`${API_BASE_URL}/api/import/mapping`, {
    headers: getAuthHeaders(),
  });

  handleUnauthorized(res);
  if (!res.ok) throw new Error("Échec du chargement du mapping.");
  return res.json();
}

/**
 * Sauvegarde le mapping CSV de l'utilisateur.
 */
export async function saveMapping(mapping) {
  const res = await fetch(`${API_BASE_URL}/api/import/mapping`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapping),
  });

  handleUnauthorized(res);
  if (!res.ok) throw new Error("Échec de la sauvegarde du mapping.");
  return res.json();
}
