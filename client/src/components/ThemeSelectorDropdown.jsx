import React, { useRef, useState } from "react";

import { useClickOutside } from "./hooks/useClickOutside";
import { useThemes } from "../contexts/useThemes";

const ThemeSelectorDropdown = ({ value, onChange }) => {
  // value attendu : { theme: themeId, subTheme: subThemeId }
  const {
    getThemeName,
    getSubThemeName,
    getThemesArray,
    getSubThemesArray,
    loading,
  } = useThemes();
  const [open, setOpen] = useState(false);
  const [expandedTheme, setExpandedTheme] = useState(null);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const themeName = getThemeName(value?.theme);
  const subThemeName = getSubThemeName(value?.theme, value?.subTheme);
  const currentLabel =
    themeName && subThemeName
      ? `${themeName} — ${subThemeName}`
      : "Sélectionner";

  if (loading) {
    return <div className="month-tabs__current">Chargement...</div>;
  }

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setExpandedTheme(value?.theme ?? null);
    }
  };

  const handleSelect = (themeId, subThemeId) => {
    onChange?.({ theme: themeId, subTheme: subThemeId });
    setOpen(false);
  };

  const toggleTheme = (themeId) => {
    setExpandedTheme((prev) => (prev === themeId ? null : themeId));
  };

  const themesArray = getThemesArray();

  return (
    <div ref={ref} className="month-tabs theme-selector">
      <div
        className="month-tabs__header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="theme-selector-panel"
        id="theme-selector-trigger"
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
      >
        <div className="month-tabs__current">{currentLabel}</div>
      </div>

      <div
        id="theme-selector-panel"
        className="theme-selector__panel"
        role="listbox"
        aria-labelledby="theme-selector-trigger"
        hidden={!open}
      >
        {themesArray.map((theme) => {
          const isExpanded = expandedTheme === theme.id;
          const subThemesArray = getSubThemesArray(theme.id);
          return (
            <div key={theme.id} className="theme-selector__group">
              <button
                type="button"
                className={`theme-selector__theme-btn${isExpanded ? " is-open" : ""}`}
                onClick={() => toggleTheme(theme.id)}
                aria-expanded={isExpanded}
              >
                <span>{theme.name}</span>
                <span className="theme-selector__chevron" aria-hidden="true">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>
              {isExpanded && (
                <div className="theme-selector__subthemes">
                  {subThemesArray.map((subTheme) => {
                    const isActive =
                      value?.theme === theme.id &&
                      value?.subTheme === subTheme.id;
                    return (
                      <button
                        key={subTheme.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`theme-selector__subtheme-btn${isActive ? " is-active" : ""}`}
                        onClick={() => handleSelect(theme.id, subTheme.id)}
                      >
                        {subTheme.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelectorDropdown;
