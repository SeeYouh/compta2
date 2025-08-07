import React, { useEffect, useRef, useState } from "react";

import styles from "../sass/components/ThemeSelector.module.scss";
import themesData from "../data/labelCategory.json";

const ThemeSelector = ({ onChange }) => {
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedSubTheme, setSelectedSubTheme] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState(null);

  const wrapperRef = useRef(null);

  const handleSelectSubTheme = (theme, subTheme) => {
    setSelectedTheme(theme);
    setSelectedSubTheme(subTheme);
    setMenuOpen(false);

    if (onChange) onChange({ theme, subTheme });
  };

  // Fermeture du menu au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* Sélecteur principal de thème */}
      <div
        className={styles.selector}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {selectedTheme || "Choisir un thème"}
      </div>

      {/* Affichage sous-thème sélectionné (pas interactif) */}
      <div className={`${styles.selector} ${styles.subThemeDisplay}`}>
        {selectedSubTheme || "Sous-thème sélectionné"}
      </div>

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

// import React, { useMemo, useState } from "react";

// import Select from "./ui/Select";
// import styles from "../sass/components/ThemeSelector.module.scss";
// import themesData from "../data/labelCategory.json";

// const ThemeSelector = ({
//   onChange,
//   defaultTheme = "",
//   defaultSubTheme = "",
// }) => {
//   const [theme, setTheme] = useState(defaultTheme);
//   const [subTheme, setSubTheme] = useState(defaultSubTheme);

//   const themeOptions = useMemo(() => Object.keys(themesData), []);
//   const subThemeOptions = useMemo(
//     () => (theme ? themesData[theme] ?? [] : []),
//     [theme]
//   );

//   const commit = (t, st) => onChange?.({ theme: t, subTheme: st });

//   return (
//     <div className={styles.wrapperGroup}>
//       <Select
//         value={theme}
//         onChange={(t) => {
//           setTheme(t);
//           setSubTheme("");
//           commit(t, "");
//         }}
//         options={themeOptions}
//         placeholder="Choisir un thème"
//         getKey={(v) => v}
//         getLabel={(v) => v}
//         classNames={{
//           wrapper: styles.wrapper,
//           trigger: styles.selector,
//           menu: styles.menu,
//           menuItem: styles.menuItem,
//           active: styles.active,
//         }}
//       />

//       <Select
//         value={subTheme}
//         onChange={(st) => {
//           setSubTheme(st);
//           commit(theme, st);
//         }}
//         options={subThemeOptions}
//         placeholder="Sous-thème"
//         getKey={(v) => v}
//         getLabel={(v) => v}
//         classNames={{
//           wrapper: styles.wrapper,
//           trigger: styles.selector,
//           menu: styles.menu,
//           menuItem: styles.menuItem,
//           active: styles.active,
//         }}
//       />
//     </div>
//   );
// };

// export default ThemeSelector;
