import { config } from "../../../config/env.js";

const BASE = `${config.apiUrl}/api/odyssee/odyssey/blocks`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

export const odysseeBlockService = {
  async getAllBlocks() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, blocks: data.blocks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBlock(id) {
    try {
      const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, block: data.block };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createBlock(blockData) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(blockData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, block: data.block };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateBlock(id, blockData) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(blockData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, block: data.block };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteBlock(id) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
