import { useEffect, useState } from "react";

import { MODE_DOCUMENT, MODE_TEMPLATE } from "./OdysseeDocumentToggle";
import { odysseeBlockService } from "../services/odysseeBlockService";
import OdysseeProductService from "../../../services/odysseeProductService";
import { passengersItemService } from "../services/passengersServices";

const BlockCard = ({ block }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/odyssee-block",
      JSON.stringify({
        type: "block-def",
        blockId: block._id,
        name: block.name,
        sourceType: block.sourceType,
        columns: block.columns,
        rows: block.rows,
        defaultColSpan: 1,
        defaultRowSpan: 1,
      }),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="ody-sidebar-block-card"
    >
      {block.name}
      <div className="ody-sidebar-block-card__meta">
        {block.fields?.length ?? 0} champs · {block.columns}×{block.rows}
      </div>
    </div>
  );
};

const ItemCard = ({ item, sourceType, isBound }) => {
  const displayName =
    sourceType === "passenger"
      ? item.alias ||
        [item.firstName, item.lastName].filter(Boolean).join(" ") ||
        "Passager"
      : item.aliasName?.activate
        ? item.aliasName.name
        : item.productName || "Produit";

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/odyssee-block",
      JSON.stringify({
        type: "binding",
        sourceType,
        sourceId: item._id,
        displayName,
      }),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`ody-sidebar-item-card${isBound ? " ody-sidebar-item-card--bound" : ""}`}
    >
      {item.color && (
        <span
          className="ody-sidebar-item-card__dot"
          style={{ background: item.color }}
        />
      )}
      <span>{displayName}</span>
      {isBound && <span className="ody-sidebar-item-card__check">✓</span>}
    </div>
  );
};

const OdysseeDocumentSidebar = ({
  mode,
  categoryId,
  selectedBlockPlacement,
  onClearSelection,
  bindings,
}) => {
  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Charge les blocs en mode template
  useEffect(() => {
    if (mode !== MODE_TEMPLATE) return;
    setBlocksLoading(true);
    odysseeBlockService.getAllBlocks().then((result) => {
      if (result.success) setBlocks(result.blocks);
      setBlocksLoading(false);
    });
  }, [mode]);

  // Charge les items quand un placement est sélectionné (mode document)
  useEffect(() => {
    if (mode !== MODE_DOCUMENT || !selectedBlockPlacement || !categoryId) return;
    setItems([]);
    setItemsLoading(true);
    if (selectedBlockPlacement.sourceType === "passenger") {
      passengersItemService.getItemsByCategory(categoryId).then((result) => {
        if (result.success) setItems(result.products || []);
        setItemsLoading(false);
      });
    } else {
      OdysseeProductService.getProductsByCategory(categoryId).then((result) => {
        if (result.success) setItems(result.products || []);
        setItemsLoading(false);
      });
    }
  }, [mode, selectedBlockPlacement, categoryId]);

  const passengerBlocks = blocks.filter((b) => b.sourceType === "passenger");
  const productBlocks = blocks.filter((b) => b.sourceType === "product");

  const hasPassengerBinding = bindings.some((b) => b.sourceType === "passenger");
  const currentPlacementBinding = selectedBlockPlacement
    ? bindings.find(
        (b) =>
          b.pageIndex === selectedBlockPlacement.pageIndex &&
          b.blockPlacementIndex === selectedBlockPlacement.blockIndex,
      )
    : null;

  return (
    <div className="ody-doc-sidebar">
      {/* MODE TEMPLATE — liste des blocs */}
      {mode === MODE_TEMPLATE && (
        <>
          {blocksLoading && (
            <div className="ody-sidebar-loading-msg">Chargement…</div>
          )}

          {!blocksLoading && blocks.length === 0 && (
            <div className="ody-sidebar-empty-msg">Aucun bloc disponible.</div>
          )}

          {passengerBlocks.length > 0 && (
            <div className="ody-sidebar-section">
              <div className="ody-sidebar-section-title">Passagers</div>
              {passengerBlocks.map((block) => (
                <BlockCard key={block._id} block={block} />
              ))}
            </div>
          )}

          {productBlocks.length > 0 && (
            <div className="ody-sidebar-section">
              <div className="ody-sidebar-section-title">Catalogue</div>
              {productBlocks.map((block) => (
                <BlockCard key={block._id} block={block} />
              ))}
            </div>
          )}
        </>
      )}

      {/* MODE DOCUMENT — idle */}
      {mode === MODE_DOCUMENT && !selectedBlockPlacement && (
        <div className="ody-sidebar-idle-msg">
          Cliquez sur un bloc du canvas pour le remplir.
        </div>
      )}

      {/* MODE DOCUMENT — placement sélectionné */}
      {mode === MODE_DOCUMENT && selectedBlockPlacement && (
        <>
          <div className="ody-sidebar-selected-header">
            <div className="ody-sidebar-selected-name">
              {selectedBlockPlacement.name || "Bloc sélectionné"}
            </div>
            <button
              className="ody-sidebar-close-btn"
              onClick={onClearSelection}
              title="Fermer"
            >
              ×
            </button>
          </div>

          <div className="ody-sidebar-selected-type">
            {selectedBlockPlacement.sourceType === "passenger"
              ? "Passager"
              : "Produit catalogue"}
          </div>

          {selectedBlockPlacement.sourceType === "passenger" &&
            hasPassengerBinding &&
            !currentPlacementBinding && (
              <div className="ody-sidebar-warning">
                Un passager est déjà lié — le nouveau remplacera l'actuel.
              </div>
            )}

          {itemsLoading && (
            <div className="ody-sidebar-loading-msg">Chargement…</div>
          )}

          {!itemsLoading && items.length === 0 && (
            <div className="ody-sidebar-empty-msg">
              Aucun élément dans cette catégorie.
            </div>
          )}

          {items.map((item) => {
            const isBound = currentPlacementBinding?.sourceId === item._id;
            return (
              <ItemCard
                key={item._id}
                item={item}
                sourceType={selectedBlockPlacement.sourceType}
                isBound={isBound}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default OdysseeDocumentSidebar;
