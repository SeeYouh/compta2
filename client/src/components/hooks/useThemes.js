import { useEffect, useState } from "react";

/**
 * Hook pour charger et gérer les thèmes/sous-thèmes
 * @returns {Object} { themes, getThemeName, getSubThemeName, getThemeById, getSubThemeById, loading, error }
 */
export function useThemes() {
  const [themesData, setThemesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger themes.json comme fichier statique
    fetch("/themes.json")
      .then((res) => res.json())
      .then((data) => {
        setThemesData(data.themes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement thèmes:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  /**
   * Récupère le nom d'un thème par son ID
   */
  const getThemeName = (themeId) => {
    if (!themesData || !themeId) return null;
    return themesData[themeId]?.name || null;
  };

  /**
   * Récupère le nom d'un sous-thème par son ID
   */
  const getSubThemeName = (themeId, subThemeId) => {
    if (!themesData || !themeId || !subThemeId) return null;
    return themesData[themeId]?.subThemes?.[subThemeId]?.name || null;
  };

  /**
   * Récupère un thème complet par son ID
   */
  const getThemeById = (themeId) => {
    if (!themesData || !themeId) return null;
    return themesData[themeId] || null;
  };

  /**
   * Récupère un sous-thème complet par son ID
   */
  const getSubThemeById = (themeId, subThemeId) => {
    if (!themesData || !themeId || !subThemeId) return null;
    return themesData[themeId]?.subThemes?.[subThemeId] || null;
  };

  /**
   * Récupère tous les thèmes sous forme de tableau
   */
  const getThemesArray = () => {
    if (!themesData) return [];
    return Object.values(themesData).sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  };

  /**
   * Récupère tous les sous-thèmes d'un thème sous forme de tableau
   */
  const getSubThemesArray = (themeId) => {
    if (!themesData || !themeId) return [];
    const theme = themesData[themeId];
    if (!theme || !theme.subThemes) return [];
    return Object.values(theme.subThemes).sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  };

  return {
    themes: themesData,
    getThemeName,
    getSubThemeName,
    getThemeById,
    getSubThemeById,
    getThemesArray,
    getSubThemesArray,
    loading,
    error,
  };
}
