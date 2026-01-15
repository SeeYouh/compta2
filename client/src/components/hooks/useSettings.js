import { useCallback, useEffect, useState } from "react";

import { API_ERRORS } from "../utils";
import { authFetch } from "../utils/authFetch";

const SETTINGS_ID = "user-preferences";

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les paramètres au montage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await authFetch(
          `/api/settings/${SETTINGS_ID}`
        );
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else if (response.status === 404) {
          // Créer les paramètres par défaut si ils n'existent pas
          const defaultSettings = {
            id: SETTINGS_ID,
            periodFilter: "all",
          };
          const createResponse = await authFetch(`/api/settings`, {
            method: "POST",
            body: JSON.stringify(defaultSettings),
          });
          const created = await createResponse.json();
          setSettings(created);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        // Paramètres par défaut en cas d'erreur
        setSettings({
          id: SETTINGS_ID,
          periodFilter: "all",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Mettre à jour le filtre de période
  const updatePeriodFilter = useCallback(
    async (periodFilter) => {
      try {
        const updatedSettings = { ...settings, periodFilter };
        const response = await authFetch(
          `/api/settings/${SETTINGS_ID}`,
          {
            method: "PATCH",
            body: JSON.stringify({ periodFilter }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error(API_ERRORS.updatePeriodFilter, error);
      }
    },
    [settings]
  );

  return {
    settings,
    loading,
    updatePeriodFilter,
  };
};
