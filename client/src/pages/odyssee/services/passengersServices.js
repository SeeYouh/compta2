import { config } from '../../../config/env.js';

const TYPE = "passengers";
const BASE_CAT = `${config.apiUrl}/api/odyssee/${TYPE}/categories`;
const BASE_SIDEBAR = `${config.apiUrl}/api/odyssee/${TYPE}/sidebar`;
const BASE_ITEMS = `${config.apiUrl}/api/odyssee/${TYPE}/items`;
const BASE_FOLDERS = `${config.apiUrl}/api/odyssee/${TYPE}/item-folders`;

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

export const passengersCategoryService = {
  async getUserCategories() {
    try {
      const res = await fetch(BASE_CAT, { headers: authHeaders() });
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
      const res = await fetch(BASE_CAT, {
        method: "POST",
        headers: authHeadersMultipart(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data.error || "Erreur serveur");
      return { success: true, category: data.category };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteCategory(id) {
    try {
      const res = await fetch(`${BASE_CAT}/${id}`, {
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

export const passengersSidebarService = {
  async getSidebar() {
    try {
      const res = await fetch(BASE_SIDEBAR, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true, layout: data.layout, folders: data.folders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateLayout(items) {
    try {
      const res = await fetch(`${BASE_SIDEBAR}/layout`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createFolder(categoryIds) {
    try {
      const res = await fetch(`${BASE_SIDEBAR}/folders`, {
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
      const res = await fetch(`${BASE_SIDEBAR}/folders/${id}`, {
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
      const res = await fetch(`${BASE_SIDEBAR}/folders/${id}`, {
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

export const passengersItemService = {
  async getItemsByCategory(categoryId) {
    try {
      const res = await fetch(`${BASE_ITEMS}/category/${categoryId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, products: data.items || [], folders: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateItem(id, itemData) {
    try {
      const res = await fetch(`${BASE_ITEMS}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, product: data.item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export const passengersItemDeleteService = {
  async deleteItem(id) {
    try {
      const res = await fetch(`${BASE_ITEMS}/${id}`, {
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

export const passengersItemFolderService = {
  async createFolder(data) {
    try {
      const res = await fetch(BASE_FOLDERS, {
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
      const res = await fetch(`${BASE_FOLDERS}/${id}`, {
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
      const res = await fetch(`${BASE_FOLDERS}/${id}`, {
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
      const res = await fetch(`${BASE_FOLDERS}/reorder`, {
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
