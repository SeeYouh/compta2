import { useState } from "react";

import ColorPalette from "./ColorPalette";
import { DEFAULT_FOLDER_COLOR } from "../config/folderColors";

/**
 * Modal générique nom + couleur.
 * Props :
 *   title           — titre de la modal (ex: "Paramètres du dossier")
 *   nameLabel       — label au-dessus du champ nom
 *   namePlaceholder — placeholder du champ nom
 *   initialName     — valeur initiale du nom
 *   initialColor    — valeur initiale de la couleur (hex)
 *   onSave          — ({ name, color }) => void
 *   onCancel        — () => void
 */
const NameColorModal = ({
  title,
  nameLabel = "Nom",
  namePlaceholder = "",
  initialName = "",
  initialColor = DEFAULT_FOLDER_COLOR,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  return (
    <div className="folder-modal-overlay" onMouseDown={onCancel}>
      <div className="folder-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="folder-modal__close"
          onClick={onCancel}
          aria-label="Fermer"
        >
          ✕
        </button>

        <h3 className="folder-modal__title">{title}</h3>

        <label className="folder-modal__label">{nameLabel}</label>
        <input
          className="folder-modal__input"
          type="text"
          placeholder={namePlaceholder}
          value={name}
          maxLength={60}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />

        <label className="folder-modal__label">Couleur</label>
        <ColorPalette value={color} onChange={setColor} />

        <button
          className="folder-modal__confirm"
          onClick={() => onSave({ name: name.trim(), color })}
        >
          Terminé
        </button>
      </div>
    </div>
  );
};

export default NameColorModal;
