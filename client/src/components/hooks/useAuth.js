import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { config } from "../../config/env";

const API_URL = config.apiUrl;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

        if (response.ok) {
          const userData = await response.json();
          if (!cancelled) {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } else {
          // Token invalide ou expiré
          if (!cancelled) logout();
        }
      } catch (error) {
        // Erreur réseau (extension, offline) — on ne déconnecte pas
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error,
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

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
