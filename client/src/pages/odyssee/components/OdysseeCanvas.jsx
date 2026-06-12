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
import OdysseeBlockRenderer from "./OdysseeBlockRenderer";

const Stepper = ({ label, value, min, max, onChange }) => (
  <div className="ody-rubrique-canvas__stepper">
    <span>{label}</span>
    <button
      type="button"
      className="ody-rubrique-canvas__stepper-btn"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
    >
      ‹
    </button>
    <span className="ody-rubrique-canvas__stepper-value">{value}</span>
    <button
      type="button"
      className="ody-rubrique-canvas__stepper-btn"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
    >
      ›
    </button>
  </div>
);

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
  onFieldStyleChange,
  selectedBlockPlacement,
  bindings,
}) => {
  const innerWidth = A4_WIDTH_PX - (margins.left + margins.right) * PX_PER_MM;
  const innerHeight = A4_HEIGHT_PX - (margins.top + margins.bottom) * PX_PER_MM;

  const { columns, rows, blocks } = page;

  const [draggingBlockIndex, setDraggingBlockIndex] = useState(null);
  const [previewZone, setPreviewZone] = useState(null);

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

  const getSpanFromDrag = (e) => {
    const spanType = [...e.dataTransfer.types].find((t) =>
      t.startsWith("application/odyssee-span-"),
    );
    if (!spanType) return { colSpan: 1, rowSpan: 1 };
    const [cs, rs] = spanType.replace("application/odyssee-span-", "").split("x").map(Number);
    return { colSpan: cs || 1, rowSpan: rs || 1 };
  };

  const handleCellDragOver = (e, colStart, rowStart) => {
    e.preventDefault();
    const { colSpan, rowSpan } = getSpanFromDrag(e);
    if (isZoneFree(colStart, rowStart, colSpan, rowSpan, draggingBlockIndex ?? -1)) {
      setPreviewZone({ colStart, rowStart, colSpan, rowSpan });
    } else {
      setPreviewZone(null);
    }
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
      className={`ody-canvas-page${mode === MODE_TEMPLATE ? " ody-canvas-page--template" : ""}`}
      style={{
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        position: "relative",
        boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        margin: "0 auto",
        flexShrink: 0,
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPreviewZone(null);
      }}
      onDrop={() => setPreviewZone(null)}
    >
      <div
        className={`ody-canvas-page__inner${mode === MODE_TEMPLATE ? " ody-canvas-page__inner--template" : ""}`}
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
              const col = c + 1;
              const row = r + 1;
              const key = `${row}-${col}`;
              const isFree = !occupied.has(key);
              const inPreview =
                previewZone &&
                col >= previewZone.colStart &&
                col < previewZone.colStart + previewZone.colSpan &&
                row >= previewZone.rowStart &&
                row < previewZone.rowStart + previewZone.rowSpan;
              return (
                <div
                  key={key}
                  className={[
                    "ody-canvas-cell",
                    isFree ? "ody-canvas-cell--free" : "ody-canvas-cell--occupied",
                    inPreview ? "ody-canvas-cell--preview" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ gridColumn: col, gridRow: row }}
                  onDragOver={isFree ? (e) => handleCellDragOver(e, col, row) : undefined}
                  onDrop={isFree ? (e) => handleCellDrop(e, col, row) : undefined}
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
                      e.dataTransfer.setData(
                        `application/odyssee-span-${block.colSpan}x${block.rowSpan}`,
                        "",
                      );
                      setDraggingBlockIndex(i);
                    }
                  : undefined
              }
              onDragEnd={
                mode === MODE_TEMPLATE
                  ? () => {
                      setDraggingBlockIndex(null);
                      setPreviewZone(null);
                    }
                  : undefined
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
              {block.blockDef?.fieldPlacements?.length > 0 ? (
                <OdysseeBlockRenderer
                  blockDef={block.blockDef}
                  contentFilesData={mode === MODE_DOCUMENT ? (binding?.contentFilesData ?? null) : null}
                  sourceType={block.blockDef.sourceType}
                  editable={mode === MODE_TEMPLATE}
                  onFieldStyleChange={(fieldId, prop, value) =>
                    onFieldStyleChange?.({ pageIndex, blockIndex: i, fieldId, prop, value })
                  }
                />
              ) : (
                binding ? binding.displayName : (block.blockDef?.name ?? `Bloc ${i + 1}`)
              )}

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
  onFieldStyleChange,
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
    const page = pages[pageIndex];
    const absMin = field === "columns" ? DOCUMENT_GRID_COLUMNS_MIN : DOCUMENT_GRID_ROWS_MIN;
    const absMax = field === "columns" ? DOCUMENT_GRID_COLUMNS_MAX : DOCUMENT_GRID_ROWS_MAX;

    // Le minimum réel = le plus grand footprint de bloc posé sur cette dimension
    const blockMin =
      page.blocks.length > 0
        ? Math.max(
            ...page.blocks.map((b) =>
              field === "columns"
                ? b.colStart + b.colSpan - 1
                : b.rowStart + b.rowSpan - 1,
            ),
          )
        : absMin;

    const clamped = Math.min(absMax, Math.max(Math.max(absMin, blockMin), value));
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
              {(() => {
                const minCols = page.blocks.length > 0
                  ? Math.max(DOCUMENT_GRID_COLUMNS_MIN, Math.max(...page.blocks.map((b) => b.colStart + b.colSpan - 1)))
                  : DOCUMENT_GRID_COLUMNS_MIN;
                const minRows = page.blocks.length > 0
                  ? Math.max(DOCUMENT_GRID_ROWS_MIN, Math.max(...page.blocks.map((b) => b.rowStart + b.rowSpan - 1)))
                  : DOCUMENT_GRID_ROWS_MIN;
                return (
                  <>
                    <Stepper
                      label="Colonnes"
                      value={page.columns}
                      min={minCols}
                      max={DOCUMENT_GRID_COLUMNS_MAX}
                      onChange={(v) => updatePageGrid(i, "columns", v)}
                    />
                    <Stepper
                      label="Lignes"
                      value={page.rows}
                      min={minRows}
                      max={DOCUMENT_GRID_ROWS_MAX}
                      onChange={(v) => updatePageGrid(i, "rows", v)}
                    />
                  </>
                );
              })()}
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
            onFieldStyleChange={onFieldStyleChange}
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
