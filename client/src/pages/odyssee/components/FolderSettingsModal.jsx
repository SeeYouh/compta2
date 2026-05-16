import { useState } from "react";

import { darken } from "../utils/colorUtils";
import { DARKEN_BORDER, FOLDER_PALETTE } from "../config/folderColors";

const FolderSettingsModal = ({ folder, onSave, onCancel }) => {
  const [name, setName] = useState(folder.name || "");
  const [color, setColor] = useState(folder.color || "#969696");

  const handleSave = () => {
    onSave({ name: name.trim(), color });
  };

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

        <h3 className="folder-modal__title">Paramètres du dossier</h3>

        <label className="folder-modal__label">Nom du dossier</label>
        <input
          className="folder-modal__input"
          type="text"
          placeholder="Nom du dossier (optionnel)"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="folder-modal__label">Couleur du dossier</label>
        <div className="folder-modal__palette">
          {FOLDER_PALETTE.map((c) => (
            <button
              key={c}
              className={`folder-modal__swatch${color === c ? " selected" : ""}`}
              style={{
                backgroundColor: darken(c, DARKEN_BORDER),
                borderColor: c,
              }}
              onClick={() => setColor(c)}
              aria-label={`Couleur ${c}`}
            >
              {color === c && (
                <span className="folder-modal__swatch-check">✓</span>
              )}
            </button>
          ))}
        </div>

        <button className="folder-modal__confirm" onClick={handleSave}>
          Terminé
        </button>
      </div>
    </div>
  );
};

export default FolderSettingsModal;
