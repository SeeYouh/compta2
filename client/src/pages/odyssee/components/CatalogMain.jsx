import { useState } from 'react';

import ProductCard from './ProductCard';
import ProductFolder from './ProductFolder';

const CatalogMain = ({
  selectedCat,
  productFolders,
  selectedProductId,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
  onCreateFolder,
  onCreateProductInFolder,
  onCreateSubFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveProductToFolder,
  onReorderFolders,
  onCategoryContextMenu,
}) => {
  const allProducts = selectedCat?.products || [];
  const [productTooltip, setProductTooltip] = useState(null);
  const [folderDropInfo, setFolderDropInfo] = useState(null);

  // Produits sans dossier (folderId === null ou undefined)
  const rootProducts = allProducts.filter((p) => !p.folderId);

  // Dossiers de niveau 0 triés par order
  const rootFolders = (productFolders || [])
    .filter(
      (f) => f.depth === 0 && String(f.categoryId) === String(selectedCat?._id),
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Sous-dossiers par parentFolderId
  const subFoldersByParent = (productFolders || [])
    .filter((f) => f.depth === 1)
    .reduce((acc, sf) => {
      const parentId = String(sf.parentFolderId);
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(sf);
      return acc;
    }, {});

  // Produits par folderId
  const productsByFolder = allProducts
    .filter((p) => p.folderId)
    .reduce((acc, p) => {
      const fid = String(p.folderId);
      if (!acc[fid]) acc[fid] = [];
      acc[fid].push(p);
      return acc;
    }, {});

  const handleProductHover = (e, label) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setProductTooltip({
      label,
      x: rect.right + 10,
      y: rect.top + rect.height / 2,
    });
  };

  const handleProductHoverLeave = () => setProductTooltip(null);

  const handleProductDragStart = (e, productId) => {
    e.dataTransfer.setData("productId", productId);
  };

  // Dépôt sur la zone racine (retire le produit d'un dossier)
  const handleRootDrop = (e) => {
    e.preventDefault();
    setFolderDropInfo(null);
    const productId = e.dataTransfer.getData("productId");
    if (productId && onMoveProductToFolder)
      onMoveProductToFolder(productId, null);
  };

  // D&D réordonnement dossiers
  const handleFolderDragOver = (e, targetFolderId) => {
    if (!Array.from(e.dataTransfer.types).includes("folderid")) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setFolderDropInfo({
      targetId: targetFolderId,
      position: e.clientY < midY ? "before" : "after",
    });
  };

  const handleFolderDrop = (e, targetFolderId) => {
    if (!Array.from(e.dataTransfer.types).includes("folderid")) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("folderId");
    if (!draggedId || draggedId === targetFolderId) {
      setFolderDropInfo(null);
      return;
    }
    const position = folderDropInfo?.position ?? "after";
    setFolderDropInfo(null);

    const list = [...rootFolders];
    const dIdx = list.findIndex((f) => String(f._id) === String(draggedId));
    const tIdx = list.findIndex(
      (f) => String(f._id) === String(targetFolderId),
    );
    if (dIdx === -1 || tIdx === -1) return;
    const [removed] = list.splice(dIdx, 1);
    const newTIdx = list.findIndex(
      (f) => String(f._id) === String(targetFolderId),
    );
    list.splice(position === "after" ? newTIdx + 1 : newTIdx, 0, removed);

    if (onReorderFolders) onReorderFolders(list.map((f) => f._id));
  };

  const isEmpty = rootProducts.length === 0 && rootFolders.length === 0;

  return (
    <div className="catalog-main">
      <div className="catalog-main__header">
        <h4
          onContextMenu={(e) => {
            if (!selectedCat || !onCategoryContextMenu) return;
            e.preventDefault();
            onCategoryContextMenu(e, selectedCat._id);
          }}
        >
          {selectedCat ? selectedCat.name : "Sélectionnez une librairie"}
        </h4>
        <div className="catalog-main__meta">
          {selectedCat && (
            <div
              className="catalog-main__add"
              title="Nouveau produit"
              onClick={onAdd}
            >
              +
            </div>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="catalog-empty">
          <div className="catalog-empty__icon">📦</div>
          <div className="catalog-empty__title">
            Aucun produit dans cette librairie
          </div>
          <div className="catalog-empty__hint">
            Cliquez sur le bouton + pour créer votre premier produit
          </div>
        </div>
      ) : (
        <div
          className="catalog-content"
          onDragOver={(e) => {
            const types = Array.from(e.dataTransfer.types);
            if (types.includes("productid")) e.preventDefault();
            if (!types.includes("folderid")) setFolderDropInfo(null);
          }}
          onDrop={handleRootDrop}
        >
          {rootFolders.map((folder) => (
            <ProductFolder
              key={folder._id}
              folder={folder}
              subFolders={(subFoldersByParent[String(folder._id)] || []).map(
                (sf) => ({
                  ...sf,
                  products: productsByFolder[String(sf._id)] || [],
                }),
              )}
              products={productsByFolder[String(folder._id)] || []}
              selectedProductId={selectedProductId}
              onSelectProduct={onSelect}
              onEditProduct={onEdit}
              onDeleteProduct={onDelete}
              onCreateSubFolder={onCreateSubFolder}
              onCreateProduct={onCreateProductInFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              onDrop={onMoveProductToFolder}
              onFolderDragOver={handleFolderDragOver}
              onFolderDrop={handleFolderDrop}
              isDragOver={folderDropInfo?.targetId === folder._id}
              dragPosition={
                folderDropInfo?.targetId === folder._id
                  ? folderDropInfo.position
                  : null
              }
            />
          ))}
          {rootProducts.length > 0 && (
            <div className="catalog-grid">
              {rootProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isSelected={product._id === selectedProductId}
                  onClick={() => onSelect(product)}
                  onEdit={() => onEdit(product)}
                  onDelete={() => onDelete(product)}
                  onHover={handleProductHover}
                  onHoverLeave={handleProductHoverLeave}
                  draggable
                  onDragStart={(e) => handleProductDragStart(e, product._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {productTooltip && (
        <div
          className="catalog-card-tooltip"
          style={{ left: productTooltip.x, top: productTooltip.y }}
        >
          {productTooltip.label}
        </div>
      )}
    </div>
  );
};

export default CatalogMain;
