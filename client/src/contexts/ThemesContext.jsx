import { useCallback, useEffect, useMemo, useState } from "react";

import { getThemes } from "../components/utils/themesApi";
import { ThemesContext } from "./createThemesContext";
import { useAccounts } from "./useAccounts";

export function ThemesProvider({ children }) {
  const [allThemesData, setAllThemesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeAccountId } = useAccounts();

  const loadThemes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getThemes();
      // L'API retourne maintenant un tableau de thèmes
      setAllThemesData(Array.isArray(data) ? data : []);
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

  // Écouter les changements de comptes pour recharger les thèmes
  useEffect(() => {
    const handleAccountsUpdate = () => {
      loadThemes();
    };

    window.addEventListener("accounts-updated", handleAccountsUpdate);
    return () => {
      window.removeEventListener("accounts-updated", handleAccountsUpdate);
    };
  }, [loadThemes]);

  // Filtrer les thèmes selon le compte actif et convertir en objet
  const themesData = useMemo(() => {
    if (!allThemesData) return null;
    if (!activeAccountId) return null;

    // Filtrer par compte actif et convertir en objet indexé par ID
    const filteredThemes = allThemesData.filter(
      (theme) => theme.accountId === activeAccountId
    );

    return Object.fromEntries(filteredThemes.map((theme) => [theme.id, theme]));
  }, [allThemesData, activeAccountId]);

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
