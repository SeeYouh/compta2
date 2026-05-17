import { config } from '../config/env.js';

const BASE = `${config.apiUrl}/api/odyssee/products`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

const OdysseeProductService = {
  isAuthenticated() {
    return !!getToken();
  },

  async getAllUserProducts() {
    try {
      const res = await fetch(`${BASE}/user`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return {
        success: true,
        productsByFolder: data.productsByFolder,
        totalCount: data.totalCount,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const res = await fetch(`${BASE}/category/${categoryId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return {
        success: true,
        products: data.products,
        folders: data.folders || [],
        count: data.count,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createProduct(productData) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, product: data.product, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateProduct(id, productData) {
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, product: data.product, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(id) {
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

  async searchProducts(q) {
    try {
      const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, products: data.products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default OdysseeProductService;
