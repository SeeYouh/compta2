import { useState } from 'react';

import { darken } from '../utils/colorUtils';
import {
  DARKEN_BG,
  DARKEN_BORDER,
  DEFAULT_FOLDER_COLOR,
} from '../config/folderColors';
import ProductCard from './ProductCard';
import ProductFolderContextMenu from './ProductFolderContextMenu';

/**
 * Dossier de produits de niveau 0 — affichage en carte.
 */
const ProductFolder = ({
  folder,
  subFolders,
  products,
  selectedProductId,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onCreateSubFolder,
  onCreateProduct,
  onRenameFolder,
  onDeleteFolder,
  onDrop,
  onFolderDragOver,
  onFolderDrop,
  isDragOver,
  dragPosition,
}) => {
  const [isOpen, setIsOpen] = useState(true);
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
          onClick={() => setIsOpen((o) => !o)}
        >
          <span className="product-folder__arrow">{isOpen ? "▾" : "▸"}</span>
          <span className="product-folder__name">{folder.name}</span>
        </div>

        {isOpen && (
          <div className="product-folder__body">
            {subFolders.map((sub) => (
              <SubFolderInline
                key={sub._id}
                folder={sub}
                products={sub.products || []}
                selectedProductId={selectedProductId}
                onSelectProduct={onSelectProduct}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
                onCreateProduct={onCreateProduct}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onDrop={onDrop}
              />
            ))}
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
          depth={0}
          onCreateSubFolder={() => onCreateSubFolder(folder._id)}
          onCreateProduct={() => onCreateProduct(folder._id)}
          onSettings={() => onRenameFolder(folder._id)}
          onDelete={() => onDeleteFolder(folder._id)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

/**
 * Sous-dossier (depth=1) — carte imbriquée dans un ProductFolder.
 */
const SubFolderInline = ({
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
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [isProductDragOver, setIsProductDragOver] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDragOver = (e) => {
    if (Array.from(e.dataTransfer.types).includes("productid")) {
      e.preventDefault();
      e.stopPropagation();
      setIsProductDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsProductDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductDragOver(false);
    const productId = e.dataTransfer.getData("productId");
    if (productId && onDrop)
      onDrop(productId, folder._id, folder.parentFolderId);
  };

  const subColor = folder.color || DEFAULT_FOLDER_COLOR;

  return (
    <>
      <div
        className={`product-subfolder${isProductDragOver ? " product-subfolder--product-over" : ""}`}
        style={{
          "--folder-color": subColor,
          "--folder-bg-color": darken(subColor, DARKEN_BG),
          "--folder-border-color": darken(subColor, DARKEN_BORDER),
        }}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className="product-subfolder__header"
          onClick={() => setIsOpen((o) => !o)}
        >
          <span className="product-subfolder__arrow">{isOpen ? "▾" : "▸"}</span>
          <span className="product-subfolder__name">{folder.name}</span>
        </div>

        {isOpen && (
          <div className="product-subfolder__body">
            {products.length > 0 && (
              <div className="product-subfolder__grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isSelected={product._id === selectedProductId}
                    onClick={() => onSelectProduct(product)}
                    onEdit={() => onEditProduct(product)}
                    onDelete={() => onDeleteProduct(product)}
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
          depth={1}
          onCreateSubFolder={() => {}}
          onCreateProduct={() => onCreateProduct(folder._id)}
          onSettings={() => onRenameFolder(folder._id)}
          onDelete={() => onDeleteFolder(folder._id)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export default ProductFolder;
