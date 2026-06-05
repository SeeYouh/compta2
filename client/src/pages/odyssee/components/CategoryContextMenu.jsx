import { useState } from "react";

import ContextMenu from "./ContextMenu";
import Gear from "../assets/gear";
import IconTrash from "../assets/IconTrash";

const CategoryContextMenu = ({
  x,
  y,
  onSettings,
  onDelete,
  onCreateFolder,
  createFolderLabel = "Créer un dossier",
  onCreateProduct,
  createProductLabel = "Créer un produit",
  allFoldersClosed,
  onToggleAllFolders,
  onClose,
}) => {
  const [dataTimeRotateGear, setDataTimeRotateGear] = useState({
    timeRotateGear: 15,
    numberTeethGear: 7,
    numberTeethGear2: 9,
    numberTeethGear3: 10,
  });

  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      {onCreateFolder && (
        <button
          className="ctx-menu__item"
          onClick={() => {
            onCreateFolder();
            onClose();
          }}
        >
          {createFolderLabel}
        </button>
      )}
      {onCreateProduct && (
        <button
          className="ctx-menu__item"
          onClick={() => {
            onCreateProduct();
            onClose();
          }}
        >
          {createProductLabel}
        </button>
      )}
      {onToggleAllFolders && (
        <button
          className="ctx-menu__item"
          onClick={() => {
            onToggleAllFolders();
            onClose();
          }}
        >
          {allFoldersClosed
            ? "Ouvrir tous les dossiers"
            : "Fermer tous les dossiers"}
        </button>
      )}
      <div className="ctx-menu__separator" />
      <div className="ctx-menu__actions">
        {onSettings && (
          <button
            className="ctx-menu__action"
            onClick={() => {
              onSettings();
              onClose();
            }}
            title="Paramètres"
          >
            <Gear
              dataTimeRotateGear={dataTimeRotateGear}
              setDataTimeRotateGear={setDataTimeRotateGear}
            />
          </button>
        )}
        {onDelete && (
          <button
            className="ctx-menu__action ctx-menu__action--danger"
            onClick={() => {
              onDelete();
              onClose();
            }}
            title="Supprimer"
          >
            <IconTrash size={18} />
          </button>
        )}
      </div>
    </ContextMenu>
  );
};

export default CategoryContextMenu;
