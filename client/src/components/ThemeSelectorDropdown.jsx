import React, { useRef, useState } from "react";

import themesData from "./utils/labelCategory.json";
import { useClickOutside } from "./hooks/useClickOutside";

const ThemeSelectorDropdown = ({ value, onChange }) => {
  // value attendu : { theme: string, subTheme: string }
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const currentLabel =
    value?.theme && value?.subTheme
      ? `${value.theme} - ${value.subTheme}`
      : "Sélectionner";

  const handleSelect = (theme, subTheme) => {
    onChange?.({ theme, subTheme });
    setOpen(false);
  };

  const onHeaderKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const onOptionKey = (theme, subTheme) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(theme, subTheme);
    }
  };

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
        {Object.entries(themesData).map(([theme, subThemes]) => (
          <div key={theme} className="month-tabs__col">
            <div className="month-tabs__theme-title">{theme}</div>
            {subThemes.map((subTheme) => (
              <button
                key={subTheme}
                type="button"
                role="option"
                aria-selected={
                  value?.theme === theme && value?.subTheme === subTheme
                }
                className={`month-tabs__item ${
                  value?.theme === theme && value?.subTheme === subTheme
                    ? "is-active"
                    : ""
                }`}
                onClick={() => handleSelect(theme, subTheme)}
                onKeyDown={onOptionKey(theme, subTheme)}
              >
                {subTheme}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelectorDropdown;
