import React, { useRef, useState } from "react";

import { useClickOutside } from "./hooks/useClickOutside";
import { useThemes } from "./hooks/useThemes";

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
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const themeName = getThemeName(value?.theme);
  const subThemeName = getSubThemeName(value?.theme, value?.subTheme);
  const currentLabel =
    themeName && subThemeName
      ? `${themeName} - ${subThemeName}`
      : "Sélectionner";

  if (loading) {
    return <div className="month-tabs__current">Chargement...</div>;
  }

  const handleSelect = (themeId, subThemeId) => {
    onChange?.({ theme: themeId, subTheme: subThemeId });
    setOpen(false);
  };

  const onHeaderKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const onOptionKey = (themeId, subThemeId) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(themeId, subThemeId);
    }
  };

  const themesArray = getThemesArray();

  return (
    <div ref={ref} className="month-tabs">
      <div
        className="month-tabs__header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="theme-selector-panel"
        id="theme-selector-trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onHeaderKey}
      >
        <div className="month-tabs__current">{currentLabel}</div>
      </div>

      <div
        id="theme-selector-panel"
        className="month-tabs__grid month-tabs__grid--themes"
        role="listbox"
        aria-labelledby="theme-selector-trigger"
        hidden={!open}
      >
        {themesArray.map((theme) => {
          const subThemesArray = getSubThemesArray(theme.id);
          return (
            <div key={theme.id} className="month-tabs__col">
              <div className="month-tabs__theme-title">{theme.name}</div>
              {subThemesArray.map((subTheme) => (
                <button
                  key={subTheme.id}
                  type="button"
                  role="option"
                  aria-selected={
                    value?.theme === theme.id && value?.subTheme === subTheme.id
                  }
                  className={`month-tabs__item ${
                    value?.theme === theme.id && value?.subTheme === subTheme.id
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() => handleSelect(theme.id, subTheme.id)}
                  onKeyDown={onOptionKey(theme.id, subTheme.id)}
                >
                  {subTheme.name}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelectorDropdown;
