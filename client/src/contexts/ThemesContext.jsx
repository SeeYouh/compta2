import { useCallback, useEffect, useState } from "react";

import { getThemes } from "../components/utils/themesApi";
import { ThemesContext } from "./createThemesContext";

export function ThemesProvider({ children }) {
  const [themesData, setThemesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadThemes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getThemes();
      setThemesData(data);
      setError(null);
    } catch (err) {
      console.error("Erreur chargement thèmes:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  /**
   * Force le rechargement des thèmes depuis le serveur
   */
  const refresh = useCallback(() => {
    loadThemes();
  }, [loadThemes]);

  /**
   * Récupère le nom d'un thème par son ID
   */
  const getThemeName = useCallback(
    (themeId) => {
      if (!themesData || !themeId) return null;
      return themesData[themeId]?.name || null;
    },
    [themesData]
  );

  /**
   * Récupère le nom d'un sous-thème par son ID
   */
  const getSubThemeName = useCallback(
    (themeId, subThemeId) => {
      if (!themesData || !themeId || !subThemeId) return null;
      return themesData[themeId]?.subThemes?.[subThemeId]?.name || null;
    },
    [themesData]
  );

  /**
   * Récupère un thème complet par son ID
   */
  const getThemeById = useCallback(
    (themeId) => {
      if (!themesData || !themeId) return null;
      return themesData[themeId] || null;
    },
    [themesData]
  );

  /**
   * Récupère un sous-thème complet par son ID
   */
  const getSubThemeById = useCallback(
    (themeId, subThemeId) => {
      if (!themesData || !themeId || !subThemeId) return null;
      return themesData[themeId]?.subThemes?.[subThemeId] || null;
    },
    [themesData]
  );

  /**
   * Récupère tous les thèmes sous forme de tableau
   */
  const getThemesArray = useCallback(() => {
    if (!themesData) return [];
    return Object.values(themesData).sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  }, [themesData]);

  /**
   * Récupère tous les sous-thèmes d'un thème sous forme de tableau
   */
  const getSubThemesArray = useCallback(
    (themeId) => {
      if (!themesData || !themeId) return [];
      const theme = themesData[themeId];
      if (!theme || !theme.subThemes) return [];
      return Object.values(theme.subThemes).sort((a, b) =>
        a.name.localeCompare(b.name, "fr")
      );
    },
    [themesData]
  );

  const value = {
    themes: themesData,
    getThemeName,
    getSubThemeName,
    getThemeById,
    getSubThemeById,
    getThemesArray,
    getSubThemesArray,
    loading,
    error,
    refresh,
  };

  return (
    <ThemesContext.Provider value={value}>{children}</ThemesContext.Provider>
  );
}
