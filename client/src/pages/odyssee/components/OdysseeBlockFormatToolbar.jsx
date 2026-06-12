import { FONT_DEFINITIONS } from "../config/fontDefinitions";

// Mini-toolbar de formatage d'un champ de Rubrique (MODE_TEMPLATE).
// Positionnée en fixed au-dessus de la cellule survolée (échappe aux
// overflow: hidden du renderer et du bloc canvas).
// Props :
//   anchorRect : DOMRect de la cellule survolée
//   style      : objet style courant du fieldPlacement
//   onChange   : (prop, value) => void
const TOOLBAR_HEIGHT = 30;

const OdysseeBlockFormatToolbar = ({ anchorRect, style, onChange }) => {
  // Au-dessus de la cellule, ou en dessous si trop près du haut du viewport.
  // Collée à la cellule (sans écart) : un espace ferait sortir le pointeur de
  // la cellule pendant le trajet → mouseleave → la toolbar disparaîtrait.
  const top =
    anchorRect.top - TOOLBAR_HEIGHT > 0
      ? anchorRect.top - TOOLBAR_HEIGHT
      : anchorRect.bottom;

  const toggle = (prop, onValue, offValue) =>
    onChange(prop, style?.[prop] === onValue ? offValue : onValue);

  return (
    <div
      className="ody-format-toolbar"
      style={{ top, left: anchorRect.left }}
      // Empêche le drag du bloc parent et la sélection du bloc au clic
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        className={`ody-format-toolbar__btn${style?.fontWeight === "bold" ? " ody-format-toolbar__btn--active" : ""}`}
        title="Gras"
        onClick={() => toggle("fontWeight", "bold", "normal")}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className={`ody-format-toolbar__btn${style?.textDecoration === "underline" ? " ody-format-toolbar__btn--active" : ""}`}
        title="Souligné"
        onClick={() => toggle("textDecoration", "underline", "none")}
      >
        <u>U</u>
      </button>

      <span className="ody-format-toolbar__sep" />

      {[
        { value: "left", glyph: "⫷", title: "Aligner à gauche" },
        { value: "center", glyph: "☰", title: "Centrer" },
        { value: "right", glyph: "⫸", title: "Aligner à droite" },
      ].map(({ value, glyph, title }) => (
        <button
          key={value}
          type="button"
          className={`ody-format-toolbar__btn${style?.textAlign === value ? " ody-format-toolbar__btn--active" : ""}`}
          title={title}
          onClick={() => onChange("textAlign", value)}
        >
          {glyph}
        </button>
      ))}

      <span className="ody-format-toolbar__sep" />

      <select
        className="ody-format-toolbar__select"
        title="Police"
        value={style.fontFamily}
        onChange={(e) => onChange("fontFamily", e.target.value)}
      >
        {FONT_DEFINITIONS.map((font) => (
          <option key={font.id} value={font.id}>
            {font.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OdysseeBlockFormatToolbar;
