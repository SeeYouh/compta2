import React, { useEffect, useRef, useState } from "react";

import styles from "../sass/components/ThemeSelector.module.scss";
import { useThemes } from "./hooks/useThemes";

const ThemeSelector = ({ value, onChange }) => {
  // value attendu : { theme: themeId, subTheme: subThemeId }
  const {
    themes,
    getThemeName,
    getSubThemeName,
    getThemesArray,
    getSubThemesArray,
    loading,
  } = useThemes();

  const [selectedTheme, setSelectedTheme] = useState(value?.theme || "");
  const [selectedSubTheme, setSelectedSubTheme] = useState(
    value?.subTheme || ""
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState(null);
  const [subMenuPosition, setSubMenuPosition] = useState({});
  const wrapperRef = useRef(null);
  const menuItemRefs = useRef({});
  const menuRef = useRef(null);

  // Sync externe -> interne
  useEffect(() => {
    setSelectedTheme(value?.theme || "");
    setSelectedSubTheme(value?.subTheme || "");
  }, [value?.theme, value?.subTheme]);

  // Calculer la position du sous-menu
  const handleMouseEnter = (themeId) => {
    setHoveredTheme(themeId);

    const menuItem = menuItemRefs.current[themeId];
    const menu = menuRef.current;

    if (!menuItem || !menu) return;

    const itemRect = menuItem.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const subThemesArray = getSubThemesArray(themeId);
    const subMenuHeight = subThemesArray.length * 40; // Estimation hauteur item ~40px

    const itemPositionInMenu = itemRect.top - menuRect.top;

    // Vérifier si ça dépasse en bas
    const wouldOverflowBottom =
      itemPositionInMenu + subMenuHeight > menuRect.height;

    // Vérifier si ça dépasserait en haut (si on aligne par le bas)
    const wouldOverflowTop = itemPositionInMenu - subMenuHeight < 0;

    // Si ça dépasse en bas ET que ça ne dépasserait pas en haut, aligner par le bas
    // Sinon, garder l'alignement par le haut (comportement par défaut)
    const shouldAlignBottom = wouldOverflowBottom && !wouldOverflowTop;

    setSubMenuPosition({
      [themeId]: shouldAlignBottom ? "bottom" : "top",
    });
  };

  const handleSelectSubTheme = (themeId, subThemeId) => {
    setSelectedTheme(themeId);
    setSelectedSubTheme(subThemeId);
    setMenuOpen(false);
    // Envoie les IDs au formulaire
    onChange?.({ theme: themeId, subTheme: subThemeId });
  };

  // Fermeture du menu au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.selector}>Chargement...</div>
      </div>
    );
  }

  const themesArray = getThemesArray();

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.selector} onClick={() => setMenuOpen((p) => !p)}>
        {getThemeName(selectedTheme) || "Catégories"}
      </div>

      <div className={`${styles.selector} ${styles.subThemeDisplay}`}>
        {getSubThemeName(selectedTheme, selectedSubTheme) || "Sous-catégories"}
      </div>

      {menuOpen && (
        <div className={styles.menu} ref={menuRef}>
          <ul className={styles.mainMenu}>
            {themesArray.map((theme) => (
              <li
                key={theme.id}
                ref={(el) => (menuItemRefs.current[theme.id] = el)}
                className={styles.menuItem}
                onMouseEnter={() => handleMouseEnter(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                {theme.name}
                {hoveredTheme === theme.id && (
                  <ul
                    className={styles.subMenu}
                    style={{
                      top:
                        subMenuPosition[theme.id] === "bottom" ? "auto" : "0",
                      bottom:
                        subMenuPosition[theme.id] === "bottom" ? "0" : "auto",
                    }}
                  >
                    {getSubThemesArray(theme.id).map((subTheme) => (
                      <li
                        key={subTheme.id}
                        className={styles.subMenuItem}
                        onClick={() =>
                          handleSelectSubTheme(theme.id, subTheme.id)
                        }
                      >
                        {subTheme.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
