import { useEffect, useId, useRef, useState } from "react";

import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

import CategoryContextMenu from "./CategoryContextMenu";
import countryPreferencesService from "../services/countryPreferencesService";
import SidebarTooltip from "./SidebarTooltip";
import { useClickOutside } from "../../../components/hooks/useClickOutside";

countries.registerLocale(fr);

const COLUMNS_COUNT = 6;

const CONTINENTS = [
  { id: null, label: "Tous" },
  { id: "EU", label: "Europe" },
  { id: "ASIA", label: "Asie" },
  { id: "AFRICA", label: "Afrique" },
  { id: "AM", label: "Amériques" },
  { id: "OC", label: "Océanie" },
];

// Mapping code ISO alpha-2 → continent
const COUNTRY_CONTINENT = {
  // Europe
  AD: "EU",
  AL: "EU",
  AT: "EU",
  AX: "EU",
  BA: "EU",
  BE: "EU",
  BG: "EU",
  BY: "EU",
  CH: "EU",
  CY: "EU",
  CZ: "EU",
  DE: "EU",
  DK: "EU",
  EE: "EU",
  ES: "EU",
  FI: "EU",
  FO: "EU",
  FR: "EU",
  GB: "EU",
  GG: "EU",
  GI: "EU",
  GR: "EU",
  HR: "EU",
  HU: "EU",
  IE: "EU",
  IM: "EU",
  IS: "EU",
  IT: "EU",
  JE: "EU",
  LI: "EU",
  LT: "EU",
  LU: "EU",
  LV: "EU",
  MC: "EU",
  MD: "EU",
  ME: "EU",
  MK: "EU",
  MT: "EU",
  NL: "EU",
  NO: "EU",
  PL: "EU",
  PT: "EU",
  RO: "EU",
  RS: "EU",
  RU: "EU",
  SE: "EU",
  SI: "EU",
  SJ: "EU",
  SK: "EU",
  SM: "EU",
  TR: "EU",
  UA: "EU",
  VA: "EU",
  XK: "EU",
  // Asie
  AE: "ASIA",
  AF: "ASIA",
  AM: "ASIA",
  AZ: "ASIA",
  BD: "ASIA",
  BH: "ASIA",
  BN: "ASIA",
  BT: "ASIA",
  CC: "ASIA",
  CN: "ASIA",
  CX: "ASIA",
  GE: "ASIA",
  HK: "ASIA",
  ID: "ASIA",
  IL: "ASIA",
  IN: "ASIA",
  IO: "ASIA",
  IQ: "ASIA",
  IR: "ASIA",
  JP: "ASIA",
  JO: "ASIA",
  KG: "ASIA",
  KH: "ASIA",
  KP: "ASIA",
  KR: "ASIA",
  KW: "ASIA",
  KZ: "ASIA",
  LA: "ASIA",
  LB: "ASIA",
  LK: "ASIA",
  MM: "ASIA",
  MN: "ASIA",
  MO: "ASIA",
  MV: "ASIA",
  MY: "ASIA",
  NP: "ASIA",
  OM: "ASIA",
  PH: "ASIA",
  PK: "ASIA",
  PS: "ASIA",
  QA: "ASIA",
  SA: "ASIA",
  SG: "ASIA",
  SY: "ASIA",
  TH: "ASIA",
  TJ: "ASIA",
  TL: "ASIA",
  TM: "ASIA",
  TW: "ASIA",
  UZ: "ASIA",
  VN: "ASIA",
  YE: "ASIA",
  // Afrique
  AO: "AFRICA",
  BF: "AFRICA",
  BI: "AFRICA",
  BJ: "AFRICA",
  BW: "AFRICA",
  CD: "AFRICA",
  CF: "AFRICA",
  CG: "AFRICA",
  CI: "AFRICA",
  CM: "AFRICA",
  CV: "AFRICA",
  DJ: "AFRICA",
  DZ: "AFRICA",
  EG: "AFRICA",
  EH: "AFRICA",
  ER: "AFRICA",
  ET: "AFRICA",
  GA: "AFRICA",
  GH: "AFRICA",
  GM: "AFRICA",
  GN: "AFRICA",
  GQ: "AFRICA",
  GW: "AFRICA",
  KE: "AFRICA",
  KM: "AFRICA",
  LR: "AFRICA",
  LS: "AFRICA",
  LY: "AFRICA",
  MA: "AFRICA",
  MG: "AFRICA",
  ML: "AFRICA",
  MR: "AFRICA",
  MU: "AFRICA",
  MW: "AFRICA",
  MZ: "AFRICA",
  NA: "AFRICA",
  NE: "AFRICA",
  NG: "AFRICA",
  RE: "AFRICA",
  RW: "AFRICA",
  SC: "AFRICA",
  SD: "AFRICA",
  SH: "AFRICA",
  SL: "AFRICA",
  SN: "AFRICA",
  SO: "AFRICA",
  SS: "AFRICA",
  ST: "AFRICA",
  SZ: "AFRICA",
  TD: "AFRICA",
  TG: "AFRICA",
  TN: "AFRICA",
  TZ: "AFRICA",
  UG: "AFRICA",
  YT: "AFRICA",
  ZA: "AFRICA",
  ZM: "AFRICA",
  ZW: "AFRICA",
  // Amériques
  AG: "AM",
  AI: "AM",
  AR: "AM",
  AW: "AM",
  BB: "AM",
  BL: "AM",
  BM: "AM",
  BO: "AM",
  BR: "AM",
  BS: "AM",
  BZ: "AM",
  CA: "AM",
  CL: "AM",
  CO: "AM",
  CR: "AM",
  CU: "AM",
  CW: "AM",
  DM: "AM",
  DO: "AM",
  EC: "AM",
  FK: "AM",
  GD: "AM",
  GF: "AM",
  GL: "AM",
  GP: "AM",
  GT: "AM",
  GY: "AM",
  HN: "AM",
  HT: "AM",
  JM: "AM",
  KN: "AM",
  KY: "AM",
  LC: "AM",
  MF: "AM",
  MQ: "AM",
  MS: "AM",
  MX: "AM",
  NI: "AM",
  PA: "AM",
  PE: "AM",
  PM: "AM",
  PR: "AM",
  PY: "AM",
  SR: "AM",
  SV: "AM",
  SX: "AM",
  TC: "AM",
  TT: "AM",
  US: "AM",
  UY: "AM",
  VC: "AM",
  VE: "AM",
  VG: "AM",
  VI: "AM",
  // Océanie
  AS: "OC",
  AU: "OC",
  CK: "OC",
  FJ: "OC",
  FM: "OC",
  GU: "OC",
  KI: "OC",
  MH: "OC",
  MP: "OC",
  NC: "OC",
  NF: "OC",
  NR: "OC",
  NU: "OC",
  NZ: "OC",
  PF: "OC",
  PG: "OC",
  PN: "OC",
  PW: "OC",
  SB: "OC",
  TK: "OC",
  TO: "OC",
  TV: "OC",
  UM: "OC",
  VU: "OC",
  WF: "OC",
  WS: "OC",
};

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
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [frequentCodes, setFrequentCodes] = useState([]);
  const [contextMenu, setContextMenu] = useState(null); // { code, x, y }
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const fetchedRef = useRef(false);

  const selectedName = value
    ? countries.getName(value, "fr", { select: "official" })
    : null;

  const byContinent = selectedContinent
    ? ALL_COUNTRIES.filter(
        (c) => COUNTRY_CONTINENT[c.code] === selectedContinent,
      )
    : ALL_COUNTRIES;

  const filtered = search.trim()
    ? byContinent.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : byContinent;

  useEffect(() => {
    if (open && !fetchedRef.current) {
      fetchedRef.current = true;
      countryPreferencesService.getFrequent().then((res) => {
        if (res.success) setFrequentCodes(res.countries);
      });
    }
  }, [open]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useClickOutside(dropdownRef, () => {
    setOpen(false);
    setContextMenu(null);
    setSearch("");
    setSearchOpen(false);
  });

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    setSearch("");
    setSearchOpen(false);
    setTooltip(null);
    // Ajout optimiste
    setFrequentCodes((prev) =>
      [code, ...prev.filter((c) => c !== code)].slice(0, 12),
    );
    countryPreferencesService.addFrequent(code);
  };

  const handleRemoveFrequent = (code) => {
    setFrequentCodes((prev) => prev.filter((c) => c !== code));
    countryPreferencesService.removeFrequent(code);
    setContextMenu(null);
  };

  const handleFlagMouseEnter = (e, name) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      type: "text",
      text: name,
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  };

  const frequentItems = frequentCodes
    .map((code) => ALL_COUNTRIES.find((c) => c.code === code))
    .filter(Boolean);

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
          {/* Barre : continents ou recherche */}
          <div className="country-picker__nav">
            {searchOpen ? (
              <>
                <input
                  ref={searchRef}
                  type="text"
                  className="country-picker__search"
                  placeholder="Rechercher un pays…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearch("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="country-picker__search-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchOpen(false);
                    setSearch("");
                  }}
                  title="Fermer la recherche"
                >
                  ×
                </button>
              </>
            ) : (
              <>
                <ul className="country-picker__continents">
                  {CONTINENTS.map(({ id, label }) => {
                    const inputId = `${uid}-cont-${id ?? "all"}`;
                    return (
                      <li key={id ?? "all"}>
                        <input
                          type="radio"
                          name={`${uid}-continent`}
                          id={inputId}
                          checked={selectedContinent === id}
                          onChange={() => setSelectedContinent(id)}
                        />
                        <label htmlFor={inputId}>{label}</label>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  className="country-picker__search-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchOpen(true);
                  }}
                  title="Rechercher un pays"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="5.5"
                      cy="5.5"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="8.8"
                      y1="8.8"
                      x2="12"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {frequentItems.length > 0 && (
            <>
              <div
                className="country-picker__grid country-picker__grid--frequent"
                style={{ gridTemplateColumns: `repeat(${COLUMNS_COUNT}, 1fr)` }}
              >
                {frequentItems.map(({ code, name }) => (
                  <button
                    key={code}
                    type="button"
                    className={`country-picker__item${value === code ? " country-picker__item--selected" : ""}`}
                    onClick={() => handleSelect(code)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setTooltip(null);
                      setContextMenu({ code, x: e.clientX, y: e.clientY });
                    }}
                    onMouseEnter={(e) => handleFlagMouseEnter(e, name)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <FlagImg code={code} />
                  </button>
                ))}
              </div>
              <div className="country-picker__separator" />
            </>
          )}

          <div
            className={`country-picker__grid${selectedContinent ? " country-picker__grid--no-scroll" : ""}`}
            style={{ gridTemplateColumns: `repeat(${COLUMNS_COUNT}, 1fr)` }}
          >
            {filtered.map(({ code, name }) => (
              <button
                key={code}
                type="button"
                className={`country-picker__item${value === code ? " country-picker__item--selected" : ""}`}
                onClick={() => handleSelect(code)}
                onMouseEnter={(e) => handleFlagMouseEnter(e, name)}
                onMouseLeave={() => setTooltip(null)}
              >
                <FlagImg code={code} />
              </button>
            ))}
          </div>
          <SidebarTooltip tooltip={tooltip} />
        </div>
      )}

      {contextMenu && (
        <CategoryContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => handleRemoveFrequent(contextMenu.code)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default CountryPicker;
