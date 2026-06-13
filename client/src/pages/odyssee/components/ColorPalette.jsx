import { darken } from '../../../utils/colorUtils';
import { DARKEN_BORDER, FOLDER_PALETTE } from "../config/folderColors";

/**
 * Palette de swatches de couleur réutilisable.
 * Props :
 *   value    — couleur sélectionnée (hex)
 *   onChange — (color: string) => void
 *   disabled — désactive les interactions
 */
const ColorPalette = ({ value, onChange, disabled = false }) => (
  <div className="folder-modal__palette">
    {FOLDER_PALETTE.map((c) => (
      <button
        key={c}
        type="button"
        className={`folder-modal__swatch${value === c ? " selected" : ""}`}
        style={{
          backgroundColor: darken(c, DARKEN_BORDER),
          borderColor: c,
        }}
        onClick={() => !disabled && onChange(c)}
        aria-label={`Couleur ${c}`}
        disabled={disabled}
      >
        {value === c && <span className="folder-modal__swatch-check">✓</span>}
      </button>
    ))}
  </div>
);

export default ColorPalette;
