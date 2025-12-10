import React, { useEffect, useRef, useState } from "react";

import styles from "../sass/components/ThemeSelector.module.scss";
import themesData from "./utils/labelCategory.json";

const ThemeSelector = ({ value, onChange }) => {
  // value attendu : { theme: string, subTheme: string }
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
  const handleMouseEnter = (theme) => {
    setHoveredTheme(theme);

    const menuItem = menuItemRefs.current[theme];
    const menu = menuRef.current;

    if (!menuItem || !menu) return;

    const itemRect = menuItem.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const subMenuHeight = themesData[theme].length * 40; // Estimation hauteur item ~40px

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
      [theme]: shouldAlignBottom ? "bottom" : "top",
    });
  };

  const handleSelectSubTheme = (theme, subTheme) => {
    setSelectedTheme(theme);
    setSelectedSubTheme(subTheme);
    setMenuOpen(false);
    onChange?.({ theme, subTheme });
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

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.selector} onClick={() => setMenuOpen((p) => !p)}>
        {selectedTheme || "Catégories"}
      </div>

      <div className={`${styles.selector} ${styles.subThemeDisplay}`}>
        {selectedSubTheme || "Sous-catégories"}
      </div>

      {menuOpen && (
        <div className={styles.menu} ref={menuRef}>
          <ul className={styles.mainMenu}>
            {Object.keys(themesData).map((theme) => (
              <li
                key={theme}
                ref={(el) => (menuItemRefs.current[theme] = el)}
                className={styles.menuItem}
                onMouseEnter={() => handleMouseEnter(theme)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                {theme}
                {hoveredTheme === theme && (
                  <ul
                    className={styles.subMenu}
                    style={{
                      top: subMenuPosition[theme] === "bottom" ? "auto" : "0",
                      bottom:
                        subMenuPosition[theme] === "bottom" ? "0" : "auto",
                    }}
                  >
                    {themesData[theme].map((subTheme) => (
                      <li
                        key={subTheme}
                        className={styles.subMenuItem}
                        onClick={() => handleSelectSubTheme(theme, subTheme)}
                      >
                        {subTheme}
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
