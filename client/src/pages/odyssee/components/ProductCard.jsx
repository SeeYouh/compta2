import { useEffect, useRef, useState } from "react";

import IconPicture from "../assets/IconPicture";
import IconTrash from "../assets/IconTrash";

const ProductCard = ({ product, isSelected, onClick, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const menuRef = useRef(null);

  const hasImage = product.img?.[0] && !imgError;

  const displayName =
    product.contentFilesData?.aliasName?.activate &&
    product.contentFilesData?.aliasName?.name
      ? product.contentFilesData.aliasName.name
      : product.contentFilesData?.productName || product.name || "Produit";

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handleClose = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setContextMenu(null);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  return (
    <>
      <div
        className={`catalog-card${isSelected ? " catalog-card--selected" : ""}`}
        onClick={onClick}
        onContextMenu={handleContextMenu}
        title={displayName}
      >
        <div className="catalog-card__image">
          {hasImage ? (
            <img
              src={product.img[0]}
              alt={product.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <IconPicture size={40} />
          )}
        </div>
      </div>
      {contextMenu && (
        <div
          ref={menuRef}
          className="category-ctx-menu"
          style={{ top: contextMenu.y, left: contextMenu.x, position: "fixed" }}
        >
          <button
            className="category-ctx-menu__item"
            onClick={() => {
              onEdit();
              setContextMenu(null);
            }}
          >
            Modifier
          </button>
          <div className="category-ctx-menu__separator" />
          <div className="category-ctx-menu__actions">
            <button
              className="category-ctx-menu__action category-ctx-menu__action--danger"
              onClick={() => {
                onDelete();
                setContextMenu(null);
              }}
              title="Supprimer"
            >
              <IconTrash size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
