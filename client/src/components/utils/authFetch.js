/**
 * Helper pour faire des requêtes API avec authentification JWT
 */

import { config } from "../../config/env";

const API_BASE_URL = config.apiUrl;

/**
 * Récupère le token JWT du localStorage
 */
function getAuthToken() {
  return localStorage.getItem("token");
}

/**
 * Headers par défaut avec authentification
 */
function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Effectue une requête fetch avec authentification
 */
export async function authFetch(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Si 401 (non autorisé), déconnecter l'utilisateur
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expirée");
  }

  return response;
}
