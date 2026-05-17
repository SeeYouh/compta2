import { useState } from 'react';

import ContextMenu from './ContextMenu';
import Gear from '../assets/gear';
import IconTrash from '../assets/IconTrash';

/**
 * Menu contextuel d'un dossier de produits.
 * depth 0 = dossier (peut créer sous-dossier + produit)
 * depth 1 = sous-dossier (peut créer produit uniquement)
 */
const ProductFolderContextMenu = ({
  x,
  y,
  depth,
  onCreateSubFolder,
  onCreateProduct,
  onSettings,
  onDelete,
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
      {depth === 0 && (
        <button
          className="ctx-menu__item"
          onClick={() => {
            onCreateSubFolder();
            onClose();
          }}
        >
          Créer un sous-dossier
        </button>
      )}
      <button
        className="ctx-menu__item"
        onClick={() => {
          onCreateProduct();
          onClose();
        }}
      >
        Créer un produit
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

export default ProductFolderContextMenu;
