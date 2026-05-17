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
  onCreateProduct,
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
      <button
        className="ctx-menu__item"
        onClick={() => {
          onCreateFolder();
          onClose();
        }}
      >
        Créer un dossier
      </button>
      <button
        className="ctx-menu__item"
        onClick={() => {
          onCreateProduct();
          onClose();
        }}
      >
        Créer un produit
      </button>
      <button
        className="ctx-menu__item"
        onClick={() => {
          onToggleAllFolders?.();
          onClose();
        }}
      >
        {allFoldersClosed
          ? "Ouvrir tous les dossiers"
          : "Fermer tous les dossiers"}
      </button>
      <div className="ctx-menu__separator" />
      <div className="ctx-menu__actions">
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
      </div>
    </ContextMenu>
  );
};

export default CategoryContextMenu;
