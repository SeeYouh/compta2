import { config } from "../../../config/env.js";

class AuthService {
  static getAccessToken() {
    return localStorage.getItem("token");
  }

  static isAuthenticated() {
    return localStorage.getItem("token") !== null;
  }

  static getCurrentUser() {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  static async verifyAuth() {
    try {
      const token = this.getAccessToken();
      if (token === null) throw new Error("Aucun token disponible");

      const response = await fetch(config.apiUrl + "/api/auth/me", {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await response.json();
      if (response.ok === false) throw new Error(data.error || "Token invalide");

      return { success: true, data: { user: data } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getAllUsers(params = {}) {
    try {
      const token = this.getAccessToken();
      if (token === null) throw new Error("Aucun token disponible");

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);

      const qs = queryParams.toString();
      const url = config.apiUrl + "/api/auth/users" + (qs ? "?" + qs : "");

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await response.json();
      if (response.ok === false) throw new Error(data.error || "Erreur lors de la recuperation");

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default AuthService;
