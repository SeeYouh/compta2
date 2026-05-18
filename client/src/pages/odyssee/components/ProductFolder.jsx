import { useState } from 'react';

import { darken } from '../utils/colorUtils';
import {
  DARKEN_BG,
  DARKEN_BORDER,
  DEFAULT_FOLDER_COLOR,
} from '../config/folderColors';
import IconDossierFull from '../assets/IconDossierFull';
import ProductCard from './ProductCard';
import ProductFolderContextMenu from './ProductFolderContextMenu';

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
  onProductDropZone,
  onFolderDragOver,
  onFolderDrop,
  isDragOver,
  dragPosition,
  indicatorType,
  onHover,
  onHoverLeave,
  isOpen,
  onToggle,
  allFoldersClosed,
  onToggleAllFolders,
  productGapZone,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [productDropZone, setProductDropZone] = useState(null); // 'before' | 'inside' | 'after' | null
  const [folderTooltip, setFolderTooltip] = useState(null);

  const getProductZone = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const pct = relX / rect.width;
    if (pct < 0.3) return "before";
    if (pct > 0.7) return "after";
    return "inside";
  };

  const handleTooltipEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFolderTooltip({ x: rect.right + 8, y: rect.top + rect.height / 2 });
  };

  const handleTooltipLeave = () => setFolderTooltip(null);

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
      const zone = getProductZone(e);
      setProductDropZone(zone);
      if (onProductDropZone) onProductDropZone(folder._id, zone);
    } else if (types.includes("folderid")) {
      if (onFolderDragOver) onFolderDragOver(e, folder._id);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setProductDropZone(null);
      if (onProductDropZone) onProductDropZone(null, null);
    }
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    const zone = productDropZone;
    setProductDropZone(null);
    const productId = e.dataTransfer.getData("productId");
    const folderId = e.dataTransfer.getData("folderId");
    if (productId) {
      e.preventDefault();
      if (onDrop) onDrop(productId, folder._id, zone);
    } else if (folderId) {
      e.preventDefault();
      if (onFolderDrop) onFolderDrop(e, folder._id);
    }
  };

  const color = folder.color || DEFAULT_FOLDER_COLOR;

  const classNames = [
    "product-folder",
    !isOpen && "product-folder--closed",
    productDropZone === "inside" && "product-folder--product-over",
    productDropZone === "before" && "product-folder--product-before",
    productDropZone === "after" && "product-folder--product-after",
    !productDropZone &&
      productGapZone === "before" &&
      "product-folder--product-before",
    !productDropZone &&
      productGapZone === "after" &&
      "product-folder--product-after",
    isDragOver &&
      dragPosition === "before" &&
      indicatorType !== "vertical" &&
      "product-folder--drop-before",
    isDragOver &&
      dragPosition === "after" &&
      indicatorType !== "vertical" &&
      "product-folder--drop-after",
    isDragOver &&
      dragPosition === "before" &&
      indicatorType === "vertical" &&
      "product-folder--drop-left",
    isDragOver &&
      dragPosition === "after" &&
      indicatorType === "vertical" &&
      "product-folder--drop-right",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={classNames}
        data-folder-id={folder._id}
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
        {isOpen ? (
          <>
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
              <IconDossierFull color={color} size={16} />
              {folder.name && (
                <span className="product-folder__name">{folder.name}</span>
              )}
            </div>

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
          </>
        ) : (
          <div
            className="product-folder__icon"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("folderId", folder._id);
            }}
            onClick={() => {
              handleTooltipLeave();
              onToggle();
            }}
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
          >
            <IconDossierFull color={color} size={26} />
          </div>
        )}
      </div>

      {folderTooltip && (
        <div
          className="product-folder__tooltip"
          style={{ left: folderTooltip.x, top: folderTooltip.y }}
        >
          {folder.name ? (
            <span>{folder.name}</span>
          ) : (
            <ul>
              {products.slice(0, 5).map((p, i) => (
                <li key={i}>
                  {p.contentFilesData?.productName || p.name || "Produit"}
                </li>
              ))}
              {products.length > 5 && <li>…</li>}
            </ul>
          )}
        </div>
      )}

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
