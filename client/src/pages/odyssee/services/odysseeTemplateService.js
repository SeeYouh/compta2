import { config } from "../../../config/env.js";

const BASE = `${config.apiUrl}/api/odyssee/odyssey/templates`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

export const odysseeTemplateService = {
  async getUserTemplates() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, templates: data.templates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getTemplatesByCategory(categoryId) {
    try {
      const res = await fetch(`${BASE}/category/${categoryId}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, templates: data.templates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getTemplate(id) {
    try {
      const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, template: data.template };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createTemplate(templateData) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(templateData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, template: data.template };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateTemplate(id, templateData) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(templateData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, template: data.template };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteTemplate(id) {
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

  async searchTemplates(q) {
    try {
      const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, templates: data.templates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
