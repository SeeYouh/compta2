import { config } from "../../../config/env.js";

const BASE = `${config.apiUrl}/api/auth/frequent-countries`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

const countryPreferencesService = {
  async getFrequent() {
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, countries: data.countries };
    } catch (error) {
      return { success: false, countries: [] };
    }
  },

  async addFrequent(code) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, countries: data.countries };
    } catch (error) {
      return { success: false };
    }
  },

  async removeFrequent(code) {
    try {
      const res = await fetch(`${BASE}/${code}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      return { success: true, countries: data.countries };
    } catch (error) {
      return { success: false };
    }
  },
};

export default countryPreferencesService;
