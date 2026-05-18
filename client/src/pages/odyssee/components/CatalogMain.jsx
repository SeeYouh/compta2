import {
  useEffect,
  useRef,
  useState,
} from 'react';

import ProductCard from './ProductCard';
import ProductFolder from './ProductFolder';

const getTitleFontSize = (name) => {
  const len = (name ?? "").length;
  if (len <= 6) return "26px";
  if (len <= 12) return "20px";
  if (len <= 18) return "17px";
  if (len <= 25) return "14px";
  return "13px";
};

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
  onGroupProducts,
  onRenameFolder,
  onDeleteFolder,
  onMoveProductToFolder,
  onReorderFolders,
  onCategoryContextMenu,
  folderOpenStates,
  onToggleFolder,
  allFoldersClosed,
  onToggleAllFolders,
}) => {
  const allProducts = selectedCat?.products || [];
  const [productTooltip, setProductTooltip] = useState(null);
  const [folderDropInfo, setFolderDropInfo] = useState(null);
  const [productGapInfo, setProductGapInfo] = useState(null); // { folderId, zone } pour les gaps entre éléments
  const [addMenuPos, setAddMenuPos] = useState(null);
  const addMenuRef = useRef(null);

  useEffect(() => {
    if (!addMenuPos) return;
    const handleClickOutside = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setAddMenuPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [addMenuPos]);

  // Produits sans dossier (folderId === null ou undefined)
  const rootProducts = allProducts.filter((p) => !p.folderId);

  // Dossiers de niveau 0 triés par order
  const rootFolders = (productFolders || [])
    .filter(
      (f) => f.depth === 0 && String(f.categoryId) === String(selectedCat?._id),
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Liste fusionnée dossiers + produits racine, triée
  const rootItems = [
    ...rootFolders.map((f) => ({
      type: "folder",
      item: f,
      order: f.order ?? 0,
    })),
    ...rootProducts.map((p) => ({
      type: "product",
      item: p,
      order: p.rootOrder ?? Infinity,
    })),
  ].sort((a, b) => a.order - b.order);

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

  // Drop d'un produit sur un autre produit → crée un dossier groupé
  const handleProductDropOnProduct = (e, targetProductId) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("productId");
    if (!draggedId || draggedId === targetProductId) return;
    if (onGroupProducts) onGroupProducts(draggedId, targetProductId);
  };

  // Dépôt sur la zone racine (retire le produit d'un dossier)
  const handleRootDrop = (e) => {
    e.preventDefault();
    const productId = e.dataTransfer.getData("productId");
    const folderId = e.dataTransfer.getData("folderId");
    if (productId) {
      if (productGapInfo) {
        handleProductDropOnFolder(
          productId,
          productGapInfo.folderId,
          productGapInfo.zone,
        );
        setProductGapInfo(null);
      } else {
        setFolderDropInfo(null);
        if (onMoveProductToFolder) onMoveProductToFolder(productId, null, null);
      }
    } else if (folderId && folderDropInfo?.targetId) {
      handleFolderDrop(e, folderDropInfo.targetId);
    } else {
      setFolderDropInfo(null);
    }
  };

  // Gestion du drop produit sur dossier avec zone
  const handleProductDropOnFolder = (productId, folderId, zone) => {
    setProductGapInfo(null);
    if (zone === "inside") {
      if (onMoveProductToFolder)
        onMoveProductToFolder(productId, folderId, null);
      return;
    }
    // zone === 'before' ou 'after' : placer le produit à côté du dossier
    const targetFolder = rootFolders.find(
      (f) => String(f._id) === String(folderId),
    );
    if (!targetFolder) return;
    const targetOrder = targetFolder.order ?? 0;
    const newRootOrder =
      zone === "before" ? targetOrder - 0.5 : targetOrder + 0.5;
    if (onMoveProductToFolder)
      onMoveProductToFolder(productId, null, newRootOrder);
  };

  // D&D réordonnement dossiers
  const handleFolderDragOver = (e, targetFolderId) => {
    if (!Array.from(e.dataTransfer.types).includes("folderid")) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "before" : "after";

    const targetIdx = rootFolders.findIndex(
      (f) => String(f._id) === String(targetFolderId),
    );
    const isTargetClosed = folderOpenStates?.[String(targetFolderId)] === false;
    let indicatorType = "horizontal";
    if (position === "after") {
      const next = rootFolders[targetIdx + 1];
      if (
        isTargetClosed &&
        next &&
        folderOpenStates?.[String(next._id)] === false
      )
        indicatorType = "vertical";
    } else {
      const prev = rootFolders[targetIdx - 1];
      if (
        isTargetClosed &&
        prev &&
        folderOpenStates?.[String(prev._id)] === false
      )
        indicatorType = "vertical";
    }

    setFolderDropInfo({ targetId: targetFolderId, position, indicatorType });
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

  const isEmpty = rootItems.length === 0;

  return (
    <div
      className="catalog-main"
      onContextMenu={(e) => {
        if (!selectedCat || !onCategoryContextMenu) return;
        e.preventDefault();
        onCategoryContextMenu(e, selectedCat._id);
      }}
    >
      <div className="catalog-main__header">
        <h4 style={{ fontSize: getTitleFontSize(selectedCat?.name) }}>
          {selectedCat ? selectedCat.name : "Sélectionnez une librairie"}
        </h4>
        <div className="catalog-main__meta">
          {selectedCat && (
            <div className="catalog-main__add-wrapper" ref={addMenuRef}>
              <div
                className="catalog-main__add"
                onClick={(e) => {
                  if (addMenuPos) {
                    setAddMenuPos(null);
                    return;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  setAddMenuPos({ x: rect.right + 6, y: rect.top });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2.56 2.56"
                  width="22"
                  height="22"
                  fill="currentColor"
                >
                  <path d="M1.39,0s.09.01.14.02c1.04.21,1.39,1.54.58,2.23C1.41,2.87.26,2.51.04,1.6c-.02-.06-.02-.13-.04-.19,0-.08,0-.16,0-.24C.05.56.56.05,1.17,0h.23ZM1.36.61h-.17v.58h-.57v.17h.57v.58h.17v-.58h.59v-.17h-.59v-.58Z" />
                </svg>
              </div>
              {addMenuPos && (
                <div
                  className="ctx-menu"
                  style={{ left: addMenuPos.x, top: addMenuPos.y }}
                >
                  <div
                    className="ctx-menu__item"
                    onClick={() => {
                      onCreateFolder();
                      setAddMenuPos(null);
                    }}
                  >
                    Créer un dossier
                  </div>
                  <div
                    className="ctx-menu__item"
                    onClick={() => {
                      onAdd();
                      setAddMenuPos(null);
                    }}
                  >
                    Créer un produit
                  </div>
                </div>
              )}
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
            if (types.includes("folderid")) e.preventDefault();
            if (!types.includes("folderid")) setFolderDropInfo(null);
            if (!types.includes("productid")) return;
            e.preventDefault();
            // Détecter si le curseur est dans le gap entre deux éléments fermés
            let detected = false;
            for (const child of e.currentTarget.children) {
              if (!child.classList.contains("product-folder--closed")) continue;
              const rect = child.getBoundingClientRect();
              const fid = child.dataset.folderId;
              if (!fid) continue;
              if (e.clientX > rect.right && e.clientX <= rect.right + 12) {
                setProductGapInfo({ folderId: fid, zone: "after" });
                detected = true;
                break;
              }
              if (e.clientX < rect.left && e.clientX >= rect.left - 12) {
                setProductGapInfo({ folderId: fid, zone: "before" });
                detected = true;
                break;
              }
            }
            if (!detected) setProductGapInfo(null);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
              setProductGapInfo(null);
          }}
          onDrop={handleRootDrop}
        >
          {rootItems.map(({ type, item }) =>
            type === "folder" ? (
              <ProductFolder
                key={item._id}
                folder={item}
                products={productsByFolder[String(item._id)] || []}
                selectedProductId={selectedProductId}
                onSelectProduct={onSelect}
                onEditProduct={onEdit}
                onDeleteProduct={onDelete}
                onCreateProduct={onCreateProductInFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onDrop={handleProductDropOnFolder}
                onProductDropZone={() => {}}
                onFolderDragOver={handleFolderDragOver}
                onFolderDrop={handleFolderDrop}
                isDragOver={folderDropInfo?.targetId === item._id}
                dragPosition={
                  folderDropInfo?.targetId === item._id
                    ? folderDropInfo.position
                    : null
                }
                indicatorType={
                  folderDropInfo?.targetId === item._id
                    ? folderDropInfo.indicatorType
                    : null
                }
                productGapZone={
                  productGapInfo?.folderId === String(item._id)
                    ? productGapInfo.zone
                    : null
                }
                onHover={handleProductHover}
                onHoverLeave={handleProductHoverLeave}
                isOpen={folderOpenStates?.[String(item._id)] !== false}
                onToggle={() => onToggleFolder?.(item._id)}
                allFoldersClosed={allFoldersClosed}
                onToggleAllFolders={onToggleAllFolders}
              />
            ) : (
              <ProductCard
                key={item._id}
                product={item}
                isSelected={item._id === selectedProductId}
                onClick={() => onSelect(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                onHover={handleProductHover}
                onHoverLeave={handleProductHoverLeave}
                draggable
                onDragStart={(e) => handleProductDragStart(e, item._id)}
                onDragOver={(e) => {
                  if (Array.from(e.dataTransfer.types).includes("productid")) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onDrop={(e) => handleProductDropOnProduct(e, item._id)}
              />
            ),
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
