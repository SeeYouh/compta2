import IconCreateDoc from "../../../assets/IconCreateDoc";
import IconEditionDoc from "../../../assets/IconEditionDoc";

// MODE_TEMPLATE = création/édition de modèle
// MODE_DOCUMENT = création de document à partir d'un modèle
export const MODE_TEMPLATE = "template";
export const MODE_DOCUMENT = "document";

const OdysseeDocumentToggle = ({ mode, onChange }) => {
  return (
    <div className="ody-doc-toggle">
      <input
        className="input-dysplay-none"
        type="checkbox"
        id="ody-mode-toggle"
        checked={mode === MODE_DOCUMENT}
        onChange={(e) => onChange(e.target.checked ? MODE_DOCUMENT : MODE_TEMPLATE)}
      />
      <label
        htmlFor="ody-mode-toggle"
        title={
          mode === MODE_DOCUMENT
            ? "Mode Document — remplir avec des données"
            : "Mode Modèle — concevoir la structure"
        }
      >
        <p><IconCreateDoc size={16} /></p>
        <p><IconEditionDoc size={16} /></p>
      </label>
    </div>
  );
};

export default OdysseeDocumentToggle;
