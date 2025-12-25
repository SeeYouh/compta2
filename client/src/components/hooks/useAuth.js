import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { config } from "../../config/env";

const API_URL = config.apiUrl;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Token invalide ou expiré
        logout();
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  return { user, loading, logout, getToken, isAuthenticated: !!user };
}
