import { config } from "../../../config/env.js";

const BASE = `${config.apiUrl}/api/odyssee/sidebar`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

const FolderService = {
  async getSidebar() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true, layout: data.layout, folders: data.folders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateLayout(items) {
    try {
      const res = await fetch(`${BASE}/layout`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true, layout: data.layout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createFolder(categoryIds) {
    try {
      const res = await fetch(`${BASE}/folders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ categoryIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true, folder: data.folder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateFolder(id, updates) {
    try {
      const res = await fetch(`${BASE}/folders/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true, folder: data.folder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteFolder(id) {
    try {
      const res = await fetch(`${BASE}/folders/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default FolderService;
