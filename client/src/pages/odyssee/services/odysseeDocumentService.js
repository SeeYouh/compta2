import { config } from "../../../config/env.js";

const BASE = `${config.apiUrl}/api/odyssee/odyssey/documents`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

export const odysseeDocumentService = {
  async getUserDocuments() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, documents: data.documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getDocumentsByCategory(categoryId) {
    try {
      const res = await fetch(`${BASE}/category/${categoryId}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, documents: data.documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getDocumentByTemplateId(templateId) {
    try {
      const res = await fetch(`${BASE}/by-template/${templateId}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, document: data.document, template: data.template, bindingEntities: data.bindingEntities };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getDocument(id) {
    try {
      const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, document: data.document, template: data.template };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createDocument(documentData) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(documentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, document: data.document };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateDocument(id, documentData) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(documentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, document: data.document };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteDocument(id) {
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

  async searchDocuments(q) {
    try {
      const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, documents: data.documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
