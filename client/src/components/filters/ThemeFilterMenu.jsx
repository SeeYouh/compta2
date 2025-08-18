import React, { useMemo, useRef, useState } from "react";

import { useClickOutside } from "../hooks/useClickOutside";

const ThemeFilterMenu = ({
  transactions,
  value,
  onChange,
  label = "Thèmes",
}) => {
  // value: string | null (null = Tous)
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const themes = useMemo(() => {
    const set = new Set();
    for (const t of transactions) if (t?.theme) set.add(t.theme);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [transactions]);

  const currentLabel = value ?? "Tous";

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="filter-menu" ref={ref}>
      <button
        type="button"
        className="filter-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        <span className="filter-label">{label}</span>
        <span className="filter-value">{currentLabel}</span>
      </button>

      {open && (
        <div className="filter-popover" role="menu">
          <button
            className="menu-item active"
            onClick={() => handleSelect(null)}
          >
            Tous
          </button>
          <div className="menu-grid">
            {themes.map((th) => (
              <button
                key={th}
                className="menu-item"
                onClick={() => handleSelect(th)}
              >
                {th}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeFilterMenu;
