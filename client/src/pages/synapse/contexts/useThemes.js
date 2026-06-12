import { useContext } from "react";

import { ThemesContext } from "./createThemesContext";

/**
 * Hook pour accéder au contexte des thèmes
 * @returns {Object} { themes, getThemeName, getSubThemeName, getThemeById, getSubThemeById, getThemesArray, getSubThemesArray, loading, error, refresh }
 */
export function useThemes() {
  const context = useContext(ThemesContext);
  if (!context) {
    throw new Error("useThemes doit être utilisé dans un ThemesProvider");
  }
  return context;
}
