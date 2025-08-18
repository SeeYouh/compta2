import React, { useRef, useState } from "react";

import { MONTHS } from "../utils";
import { useClickOutside } from "../hooks/useClickOutside";

const MonthFilterMenu = ({ value, onChange, label = "Mois" }) => {
  // value: number | null (0..11 ou null = Tous)
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const currentLabel = value === null ? "Tous" : MONTHS[value];

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
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                className="menu-item"
                onClick={() => handleSelect(idx)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthFilterMenu;
