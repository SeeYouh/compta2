import { config } from '../config/env.js';

const BASE = `${config.apiUrl}/api/odyssee/product-folders`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

const ProductFolderService = {
  async createFolder(data) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true, folder: json.folder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateFolder(id, data) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true, folder: json.folder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteFolder(id) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async reorderFolders(folderIds) {
    try {
      const res = await fetch(`${BASE}/reorder`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ folderIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default ProductFolderService;
