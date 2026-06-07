import { useState } from "react";

import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  DOCUMENT_GRID_COLUMNS_MAX,
  DOCUMENT_GRID_COLUMNS_MIN,
  DOCUMENT_GRID_ROWS_MAX,
  DOCUMENT_GRID_ROWS_MIN,
  DOCUMENT_PAGE_DEFAULT,
} from "../config/documentGrid";
import { MODE_DOCUMENT, MODE_TEMPLATE } from "./OdysseeDocumentToggle";

const PX_PER_MM = 3.7795275591;
const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * PX_PER_MM);
const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * PX_PER_MM);

const OdysseeCanvasPage = ({
  page,
  pageIndex,
  margins,
  mode,
  onBlockDrop,
  onBlockMove,
  onBlockClick,
  onBlockRemove,
  onBindingDrop,
  selectedBlockPlacement,
  bindings,
}) => {
  const innerWidth = A4_WIDTH_PX - (margins.left + margins.right) * PX_PER_MM;
  const innerHeight = A4_HEIGHT_PX - (margins.top + margins.bottom) * PX_PER_MM;

  const { columns, rows, blocks } = page;

  const [draggingBlockIndex, setDraggingBlockIndex] = useState(null);

  // Occupied set — exclut le bloc en cours de déplacement pour que ses cellules restent des cibles valides
  const occupied = new Set();
  blocks.forEach(({ colStart, rowStart, colSpan, rowSpan }, idx) => {
    if (idx === draggingBlockIndex) return;
    for (let r = rowStart; r < rowStart + rowSpan; r++) {
      for (let c = colStart; c < colStart + colSpan; c++) {
        occupied.add(`${r}-${c}`);
      }
    }
  });

  const isZoneFree = (colStart, rowStart, colSpan, rowSpan, excludeIdx = -1) => {
    if (colStart < 1 || rowStart < 1) return false;
    if (colStart + colSpan - 1 > columns) return false;
    if (rowStart + rowSpan - 1 > rows) return false;
    return blocks.every((b, idx) => {
      if (idx === excludeIdx) return true;
      const overlapCol =
        colStart < b.colStart + b.colSpan && colStart + colSpan > b.colStart;
      const overlapRow =
        rowStart < b.rowStart + b.rowSpan && rowStart + rowSpan > b.rowStart;
      return !(overlapCol && overlapRow);
    });
  };

  const handleCellDragOver = (e) => {
    e.preventDefault();
  };

  const handleCellDrop = (e, colStart, rowStart) => {
    e.preventDefault();
    if (mode !== MODE_TEMPLATE) return;
    const raw = e.dataTransfer.getData("application/odyssee-block");
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.type === "block-def") {
      const colSpan = data.defaultColSpan ?? 1;
      const rowSpan = data.defaultRowSpan ?? 1;
      if (!isZoneFree(colStart, rowStart, colSpan, rowSpan)) return;
      onBlockDrop?.({ pageIndex, colStart, rowStart, blockDef: data });
    } else if (data.type === "block-move" && data.sourcePageIndex === pageIndex) {
      const { colSpan, rowSpan, sourceBlockIndex, blockDef } = data;
      if (!isZoneFree(colStart, rowStart, colSpan, rowSpan, sourceBlockIndex)) return;
      onBlockMove?.({
        pageIndex,
        sourceBlockIndex,
        colStart,
        rowStart,
        colSpan,
        rowSpan,
        blockDef,
      });
    }
  };

  return (
    <div
      className="ody-canvas-page"
      style={{
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        position: "relative",
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        margin: "0 auto",
        flexShrink: 0,
      }}
    >
      <div
        className="ody-canvas-page__inner"
        style={{
          position: "absolute",
          top: margins.top * PX_PER_MM,
          left: margins.left * PX_PER_MM,
          width: innerWidth,
          height: innerHeight,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {/* Cellules de la grille — drop targets (mode template uniquement) */}
        {mode === MODE_TEMPLATE &&
          Array.from({ length: rows }, (_, r) =>
            Array.from({ length: columns }, (_, c) => {
              const key = `${r + 1}-${c + 1}`;
              const isFree = !occupied.has(key);
              return (
                <div
                  key={key}
                  className={`ody-canvas-cell${isFree ? " ody-canvas-cell--free" : " ody-canvas-cell--occupied"}`}
                  style={{ gridColumn: c + 1, gridRow: r + 1 }}
                  onDragOver={isFree ? handleCellDragOver : undefined}
                  onDrop={isFree ? (e) => handleCellDrop(e, c + 1, r + 1) : undefined}
                />
              );
            }),
          )}

        {/* Blocs posés */}
        {blocks.map((block, i) => {
          const isSelected =
            selectedBlockPlacement?.pageIndex === pageIndex &&
            selectedBlockPlacement?.blockIndex === i;

          const binding = bindings?.find(
            (b) => b.pageIndex === pageIndex && b.blockPlacementIndex === i,
          );

          return (
            <div
              key={i}
              className={[
                "ody-canvas-block",
                isSelected ? "ody-canvas-block--selected" : "",
                binding ? "ody-canvas-block--bound" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                gridColumn: `${block.colStart} / span ${block.colSpan}`,
                gridRow: `${block.rowStart} / span ${block.rowSpan}`,
                cursor: mode === MODE_DOCUMENT ? "pointer" : "grab",
              }}
              draggable={mode === MODE_TEMPLATE}
              onDragStart={
                mode === MODE_TEMPLATE
                  ? (e) => {
                      e.dataTransfer.setData(
                        "application/odyssee-block",
                        JSON.stringify({
                          type: "block-move",
                          sourcePageIndex: pageIndex,
                          sourceBlockIndex: i,
                          colSpan: block.colSpan,
                          rowSpan: block.rowSpan,
                          blockDef: block.blockDef,
                        }),
                      );
                      setDraggingBlockIndex(i);
                    }
                  : undefined
              }
              onDragEnd={
                mode === MODE_TEMPLATE ? () => setDraggingBlockIndex(null) : undefined
              }
              onClick={
                mode === MODE_DOCUMENT
                  ? (e) => {
                      e.stopPropagation();
                      onBlockClick?.(pageIndex, i, block);
                    }
                  : undefined
              }
              onDragOver={mode === MODE_DOCUMENT ? (e) => e.preventDefault() : undefined}
              onDrop={
                mode === MODE_DOCUMENT
                  ? (e) => {
                      e.preventDefault();
                      const raw = e.dataTransfer.getData("application/odyssee-block");
                      if (!raw) return;
                      const data = JSON.parse(raw);
                      if (data.type === "binding")
                        onBindingDrop?.({ pageIndex, blockIndex: i, bindingData: data });
                    }
                  : undefined
              }
            >
              {binding ? binding.displayName : (block.blockDef?.name ?? `Bloc ${i + 1}`)}

              {mode === MODE_TEMPLATE && (
                <button
                  className="ody-canvas-block__delete"
                  title="Supprimer ce bloc"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBlockRemove?.(pageIndex, i);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OdysseeCanvas = ({
  pages,
  margins,
  mode,
  onPagesChange,
  onBlockDrop,
  onBlockMove,
  onBlockClick,
  onBlockRemove,
  onBindingDrop,
  selectedBlockPlacement,
  bindings,
}) => {
  const addPage = () => {
    onPagesChange?.([...pages, { ...DOCUMENT_PAGE_DEFAULT, blocks: [] }]);
  };

  const removePage = (pageIndex) => {
    onPagesChange?.(pages.filter((_, i) => i !== pageIndex));
  };

  const updatePageGrid = (pageIndex, field, value) => {
    const clamped =
      field === "columns"
        ? Math.min(DOCUMENT_GRID_COLUMNS_MAX, Math.max(DOCUMENT_GRID_COLUMNS_MIN, value))
        : Math.min(DOCUMENT_GRID_ROWS_MAX, Math.max(DOCUMENT_GRID_ROWS_MIN, value));

    const next = pages.map((p, i) => (i === pageIndex ? { ...p, [field]: clamped } : p));
    onPagesChange?.(next);
  };

  return (
    <div
      className="ody-canvas"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        padding: "24px 16px 48px",
        overflowY: "auto",
        flex: 1,
      }}
    >
      {pages.map((page, i) => (
        <div
          key={i}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          {mode === MODE_TEMPLATE && (
            <div className="ody-canvas-page__controls">
              <label>
                Colonnes&nbsp;
                <input
                  type="number"
                  min={DOCUMENT_GRID_COLUMNS_MIN}
                  max={DOCUMENT_GRID_COLUMNS_MAX}
                  value={page.columns}
                  onChange={(e) => updatePageGrid(i, "columns", Number(e.target.value))}
                  style={{ width: 48 }}
                />
              </label>
              <label>
                Lignes&nbsp;
                <input
                  type="number"
                  min={DOCUMENT_GRID_ROWS_MIN}
                  max={DOCUMENT_GRID_ROWS_MAX}
                  value={page.rows}
                  onChange={(e) => updatePageGrid(i, "rows", Number(e.target.value))}
                  style={{ width: 48 }}
                />
              </label>
              <span>Page {i + 1}</span>
              {pages.length > 1 && (
                <button
                  type="button"
                  className="ody-canvas-page__delete"
                  onClick={() => removePage(i)}
                  title="Supprimer cette page"
                >
                  ×
                </button>
              )}
            </div>
          )}
          <OdysseeCanvasPage
            page={page}
            pageIndex={i}
            margins={margins}
            mode={mode}
            onBlockDrop={onBlockDrop}
            onBlockMove={onBlockMove}
            onBlockClick={onBlockClick}
            onBlockRemove={onBlockRemove}
            onBindingDrop={onBindingDrop}
            selectedBlockPlacement={selectedBlockPlacement}
            bindings={bindings}
          />
        </div>
      ))}

      {mode === MODE_TEMPLATE && (
        <button
          type="button"
          className="ody-canvas__add-page"
          onClick={addPage}
          style={{ fontSize: 22, padding: "8px 24px", cursor: "pointer" }}
          title="Ajouter une page"
        >
          +
        </button>
      )}
    </div>
  );
};

export default OdysseeCanvas;
