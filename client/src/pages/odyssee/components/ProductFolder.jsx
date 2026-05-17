import { useState } from "react";

import { darken } from "../utils/colorUtils";
import {
  DARKEN_BG,
  DARKEN_BORDER,
  DEFAULT_FOLDER_COLOR,
} from "../config/folderColors";
import ProductCard from "./ProductCard";
import ProductFolderContextMenu from "./ProductFolderContextMenu";

const ProductFolder = ({
  folder,
  products,
  selectedProductId,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onCreateProduct,
  onRenameFolder,
  onDeleteFolder,
  onDrop,
  onFolderDragOver,
  onFolderDrop,
  isDragOver,
  dragPosition,
  onHover,
  onHoverLeave,
  isOpen,
  onToggle,
  allFoldersClosed,
  onToggleAllFolders,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [isProductDragOver, setIsProductDragOver] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDragOver = (e) => {
    const types = Array.from(e.dataTransfer.types);
    if (types.includes("productid")) {
      e.preventDefault();
      e.stopPropagation();
      setIsProductDragOver(true);
    } else if (types.includes("folderid")) {
      if (onFolderDragOver) onFolderDragOver(e, folder._id);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsProductDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    setIsProductDragOver(false);
    const productId = e.dataTransfer.getData("productId");
    const folderId = e.dataTransfer.getData("folderId");
    if (productId) {
      e.preventDefault();
      if (onDrop) onDrop(productId, folder._id, null);
    } else if (folderId) {
      e.preventDefault();
      if (onFolderDrop) onFolderDrop(e, folder._id);
    }
  };

  const color = folder.color || DEFAULT_FOLDER_COLOR;

  const classNames = [
    "product-folder",
    isProductDragOver && "product-folder--product-over",
    isDragOver && dragPosition === "before" && "product-folder--drop-before",
    isDragOver && dragPosition === "after" && "product-folder--drop-after",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={classNames}
        style={{
          "--folder-color": color,
          "--folder-bg-color": darken(color, DARKEN_BG),
          "--folder-border-color": darken(color, DARKEN_BORDER),
        }}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className="product-folder__header"
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("folderId", folder._id);
          }}
          onClick={onToggle}
        >
          <span className="product-folder__arrow">{isOpen ? "▾" : "▸"}</span>
          <span className="product-folder__name">{folder.name}</span>
        </div>

        {isOpen && (
          <div className="product-folder__body">
            {products.length > 0 && (
              <div className="product-folder__grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isSelected={product._id === selectedProductId}
                    onClick={() => onSelectProduct(product)}
                    onEdit={() => onEditProduct(product)}
                    onDelete={() => onDeleteProduct(product)}
                    onHover={onHover}
                    onHoverLeave={onHoverLeave}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData("productId", product._id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {contextMenu && (
        <ProductFolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onCreateProduct={() => onCreateProduct(folder._id)}
          onSettings={() => onRenameFolder(folder._id)}
          onDelete={() => onDeleteFolder(folder._id)}
          allFoldersClosed={allFoldersClosed}
          onToggleAllFolders={onToggleAllFolders}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export default ProductFolder;
