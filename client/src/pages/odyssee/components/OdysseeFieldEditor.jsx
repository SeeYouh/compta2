import { useRef, useState } from "react";

import { FONT_DEFINITIONS } from "../config/fontDefinitions";
import { cssFromFormat, DEFAULT_FIELD_FORMAT } from "../utils/fieldFormat";

// Toolbar de formatage d'un champ de Rubrique (MODE_TEMPLATE).
// Les helpers de format (DEFAULT_FIELD_FORMAT, cssFromFormat, fieldFormatToHtml)
// vivent dans ../utils/fieldFormat.js.

const FONT_SIZES = ["8px", "10px", "12px", "14px", "16px", "18px", "24px"];

// ─── OdysseeFieldEditor ───────────────────────────────────────────────────────

const OdysseeFieldEditor = ({ fieldFormat, fallbackLabel, onChange }) => {
  const wrapperRef = useRef(null);
  const [active, setActive] = useState(false);
  const format = { ...DEFAULT_FIELD_FORMAT, ...fieldFormat };

  const toggle = (key) => onChange({ ...format, [key]: !format[key] });
  const set = (key, value) => onChange({ ...format, [key]: value });

  const Btn = ({ active: isActive, onClick, title, children }) => (
    <button
      type="button"
      className={`ody-field-toolbar__btn${isActive ? " ody-field-toolbar__btn--active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault(); // garde le focus sur le wrapper, pas sur le bouton
        onClick();
      }}
      title={title}
    >
      {children}
    </button>
  );

  const rect = wrapperRef.current?.getBoundingClientRect();
  const toolbarTop = rect
    ? rect.top - 30 > 0
      ? rect.top - 30
      : rect.bottom
    : 0;

  return (
    <div
      ref={wrapperRef}
      className="ody-field-editor"
      tabIndex={0}
      onClick={() => setActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(false);
      }}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {active && rect && (
        <div
          className="ody-field-toolbar"
          style={{ top: toolbarTop, left: rect.left }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Btn active={format.bold} onClick={() => toggle("bold")} title="Gras">
            <b>G</b>
          </Btn>
          <Btn active={format.italic} onClick={() => toggle("italic")} title="Italique">
            <i>I</i>
          </Btn>
          <Btn active={format.underline} onClick={() => toggle("underline")} title="Souligné">
            <u>S</u>
          </Btn>

          <span className="ody-field-toolbar__sep" />

          <Btn
            active={format.align === "left"}
            onClick={() => set("align", "left")}
            title="Gauche"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="2" rx="1" />
              <rect x="1" y="7" width="9" height="2" rx="1" />
              <rect x="1" y="12" width="12" height="2" rx="1" />
            </svg>
          </Btn>
          <Btn
            active={format.align === "center"}
            onClick={() => set("align", "center")}
            title="Centrer"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="2" rx="1" />
              <rect x="4" y="7" width="8" height="2" rx="1" />
              <rect x="2" y="12" width="12" height="2" rx="1" />
            </svg>
          </Btn>
          <Btn
            active={format.align === "right"}
            onClick={() => set("align", "right")}
            title="Droite"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="2" rx="1" />
              <rect x="6" y="7" width="9" height="2" rx="1" />
              <rect x="3" y="12" width="12" height="2" rx="1" />
            </svg>
          </Btn>

          <span className="ody-field-toolbar__sep" />

          <select
            className="ody-field-toolbar__select"
            value={format.fontFamily}
            onChange={(e) => set("fontFamily", e.target.value)}
            title="Police"
          >
            {FONT_DEFINITIONS.map((font) => (
              <option key={font.id} value={font.family}>
                {font.label}
              </option>
            ))}
          </select>
          <select
            className="ody-field-toolbar__select ody-field-toolbar__select--size"
            value={format.fontSize}
            onChange={(e) => set("fontSize", e.target.value)}
            title="Taille"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {parseInt(size, 10)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="ody-field-editor__preview" style={cssFromFormat(format)}>
        {fallbackLabel}
      </div>
    </div>
  );
};

export default OdysseeFieldEditor;
