/**
 * Service pour gérer les produits
 */

import { config } from "../../../config/env.js";

class ProductService {
  /**
   * Récupérer tous les produits de l'utilisateur organisés par dossier
   * @returns {Promise<Object>} Produits organisés par dossier
   */
  static async getAllUserProducts() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${config.apiUrl}/api/odyssee/products/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des produits",
        );
      }

      return {
        success: true,
        productsByFolder: data.productsByFolder,
        totalCount: data.totalCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Récupérer les produits d'un dossier spécifique
   * @param {string} folder - Le nom du dossier (dossier1, dossier2, etc.)
   * @returns {Promise<Object>} Produits du dossier
   */
  static async getProductsByFolder(folder) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${config.apiUrl}/api/odyssee/products/folder/${folder}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des produits",
        );
      }

      return {
        success: true,
        products: data.products,
        count: data.count,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Créer un nouveau produit
   * @param {Object} productData - Données du produit
   * @returns {Promise<Object>} Résultat de la création
   */
  static async createProduct(productData) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${config.apiUrl}/api/odyssee/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du produit");
      }

      return {
        success: true,
        product: data.product,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} True si authentifié
   */
  static isAuthenticated() {
    return !!localStorage.getItem("token");
  }
}

export default ProductService;
