import { config } from '../config/env.js';

const BASE = `${config.apiUrl}/api/odyssee/categories`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

function authHeadersMultipart() {
  return { Authorization: `Bearer ${getToken()}` };
}

const OdysseeCategoryService = {
  async getUserCategories() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, categories: data.categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createCategory(categoryData) {
    try {
      const formData = new FormData();
      formData.append("name", categoryData.name);
      if (categoryData.description)
        formData.append("description", categoryData.description);
      if (categoryData.imageFile)
        formData.append("image", categoryData.imageFile);

      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeadersMultipart(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data.error || "Erreur serveur");
      return { success: true, category: data.category, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const formData = new FormData();
      if (categoryData.name) formData.append("name", categoryData.name);
      if (categoryData.description)
        formData.append("description", categoryData.description);
      if (categoryData.imageFile)
        formData.append("image", categoryData.imageFile);

      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: authHeadersMultipart(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data.error || "Erreur serveur");
      return { success: true, category: data.category, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteCategory(id) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default OdysseeCategoryService;
