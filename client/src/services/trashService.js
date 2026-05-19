import { config } from '../config/env.js';

const BASE = `${config.apiUrl}/api/odyssee/trash`;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

const TrashService = {
  async getTrash() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true, products: json.products, folders: json.folders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async restoreProduct(id) {
    try {
      const res = await fetch(`${BASE}/products/${id}/restore`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async restoreFolder(id) {
    try {
      const res = await fetch(`${BASE}/folders/${id}/restore`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async permanentDeleteProduct(id) {
    try {
      const res = await fetch(`${BASE}/products/${id}`, {
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

  async permanentDeleteFolder(id) {
    try {
      const res = await fetch(`${BASE}/folders/${id}`, {
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
};

export default TrashService;
