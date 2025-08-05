import React, { useState } from "react";

import styles from "./ThemeSelector.module.scss";
import themesData from "../data/labelCategory.json";

const ThemeSelector = ({ onChange }) => {
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedSubTheme, setSelectedSubTheme] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState(null);

  const handleSelectSubTheme = (theme, subTheme) => {
    setSelectedTheme(theme);
    setSelectedSubTheme(subTheme);
    setMenuOpen(false);

    if (onChange) onChange({ theme, subTheme });
  };

  return (
    <div className={styles.wrapper}>
      {/* Input Thème : clic pour ouvrir menu */}
      <input
        type="text"
        value={selectedTheme}
        placeholder="Choisir un thème"
        readOnly
        onClick={() => setMenuOpen((prev) => !prev)}
      />

      {/* Affichage sous-thème sélectionné */}
      <input
        type="text"
        value={selectedSubTheme}
        placeholder="Sous-thème sélectionné"
        readOnly
      />

      {/* Menu contextuel */}
      {menuOpen && (
        <div className={styles.menu}>
          <ul className={styles.mainMenu}>
            {Object.keys(themesData).map((theme) => (
              <li
                key={theme}
                className={styles.menuItem}
                onMouseEnter={() => setHoveredTheme(theme)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                {theme}
                {hoveredTheme === theme && (
                  <ul className={styles.subMenu}>
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
