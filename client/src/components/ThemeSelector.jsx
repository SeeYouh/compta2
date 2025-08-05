// import React, { useState } from "react";

// import styles from "../sass/components/ThemeSelector.module.scss";
// import themesData from "../data/labelCategory.json";

// const ThemeSelector = ({ onChange }) => {
//   const [selectedTheme, setSelectedTheme] = useState("");
//   const [selectedSubTheme, setSelectedSubTheme] = useState("");
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [hoveredTheme, setHoveredTheme] = useState(null);

//   const handleSelectSubTheme = (theme, subTheme) => {
//     setSelectedTheme(theme);
//     setSelectedSubTheme(subTheme);
//     setMenuOpen(false);

//     if (onChange) onChange({ theme, subTheme });
//   };

//   return (
//     <div className={styles.wrapper}>
//       {/* Input Thème : clic pour ouvrir menu */}
//       <input
//         type="text"
//         value={selectedTheme}
//         placeholder="Choisir un thème"
//         readOnly
//         onClick={() => setMenuOpen((prev) => !prev)}
//       />

//       {/* Affichage sous-thème sélectionné */}
//       <input
//         type="text"
//         value={selectedSubTheme}
//         placeholder="Sous-thème sélectionné"
//         readOnly
//       />

//       {/* Menu contextuel */}
//       {menuOpen && (
//         <div className={styles.menu}>
//           <ul className={styles.mainMenu}>
//             {Object.keys(themesData).map((theme) => (
//               <li
//                 key={theme}
//                 className={styles.menuItem}
//                 onMouseEnter={() => setHoveredTheme(theme)}
//                 onMouseLeave={() => setHoveredTheme(null)}
//               >
//                 {theme}
//                 {hoveredTheme === theme && (
//                   <ul className={styles.subMenu}>
//                     {themesData[theme].map((subTheme) => (
//                       <li
//                         key={subTheme}
//                         className={styles.subMenuItem}
//                         onClick={() => handleSelectSubTheme(theme, subTheme)}
//                       >
//                         {subTheme}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ThemeSelector;

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
