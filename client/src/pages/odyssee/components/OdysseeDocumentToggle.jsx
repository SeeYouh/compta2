import IconComponent from "../../../assets/IconComponent";
import IconCreateDoc from "../../../assets/IconCreateDoc";
import IconEditionDoc from "../../../assets/IconEditionDoc";

// MODE_RUBRIQUE = construction de rubriques composites (champs → rubrique)
// MODE_TEMPLATE = conception de la structure (rubriques → template)
// MODE_DOCUMENT = création d'un document avec données réelles
export const MODE_RUBRIQUE = "rubrique";
export const MODE_TEMPLATE = "template";
export const MODE_DOCUMENT = "document";

const TITLES = {
  [MODE_RUBRIQUE]: "Mode Rubrique — construire des blocs composites",
  [MODE_TEMPLATE]: "Mode Modèle — concevoir la structure",
  [MODE_DOCUMENT]: "Mode Document — remplir avec des données",
};

const OdysseeDocumentToggle = ({ mode, onChange }) => {
  return (
    <div className="ody-doc-toggle" title={TITLES[mode]}>
      <div className="ody-doc-toggle__pill">
        <p
          className={mode === MODE_RUBRIQUE ? "ody-doc-toggle__btn--active" : ""}
          onClick={() => onChange(MODE_RUBRIQUE)}
        >
          <IconComponent size={16} />
        </p>
        <p
          className={mode === MODE_TEMPLATE ? "ody-doc-toggle__btn--active" : ""}
          onClick={() => onChange(MODE_TEMPLATE)}
        >
          <IconCreateDoc size={16} />
        </p>
        <p
          className={mode === MODE_DOCUMENT ? "ody-doc-toggle__btn--active" : ""}
          onClick={() => onChange(MODE_DOCUMENT)}
        >
          <IconEditionDoc size={16} />
        </p>
      </div>
    </div>
  );
};

export default OdysseeDocumentToggle;
