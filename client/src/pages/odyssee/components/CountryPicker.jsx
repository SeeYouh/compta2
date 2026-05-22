import { useEffect, useRef, useState } from "react";

import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

import { useClickOutside } from "../../../components/hooks/useClickOutside";

countries.registerLocale(fr);

const COLUMNS_COUNT = 6;

const ALL_COUNTRIES = Object.entries(
  countries.getNames("fr", { select: "official" }),
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

function FlagImg({ code }) {
  return (
    <img
      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
      alt={code}
      className="country-picker__flag"
    />
  );
}

const CountryPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredCode, setHoveredCode] = useState(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const selectedName = value
    ? countries.getName(value, "fr", { select: "official" })
    : null;

  const filtered = search.trim()
    ? ALL_COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : ALL_COUNTRIES;

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  useClickOutside(dropdownRef, () => setOpen(false));

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="country-picker" ref={dropdownRef}>
      <button
        type="button"
        className="country-picker__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        {value ? (
          <>
            <FlagImg code={value} />
            <span className="country-picker__trigger-name">{selectedName}</span>
          </>
        ) : (
          <span className="country-picker__trigger-placeholder">Pays</span>
        )}
        <span className="country-picker__chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="country-picker__dropdown">
          <input
            ref={searchRef}
            type="text"
            className="country-picker__search"
            placeholder="Rechercher un pays…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {hoveredCode && (
            <div className="country-picker__hovered-label">
              {countries.getName(hoveredCode, "fr", { select: "official" })}
            </div>
          )}

          <div
            className="country-picker__grid"
            style={{ gridTemplateColumns: `repeat(${COLUMNS_COUNT}, 1fr)` }}
          >
            {filtered.map(({ code }) => (
              <button
                key={code}
                type="button"
                className={`country-picker__item${value === code ? " country-picker__item--selected" : ""}`}
                onClick={() => handleSelect(code)}
                onMouseEnter={() => setHoveredCode(code)}
                onMouseLeave={() => setHoveredCode(null)}
              >
                <FlagImg code={code} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryPicker;
