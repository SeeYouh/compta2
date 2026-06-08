import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import IconPassager from "../assets/IconPassager";
import IconPassagerLandscape from "../assets/IconPassagerLandscape";
import { CATALOGUE_FIELDS, PASSENGER_FIELDS } from "../config/fieldDefinitions";
import { odysseeBlockService } from "../services/odysseeBlockService";

const DRAFT_KEY = "ody_rubrique_draft";
const DRAFT_TTL = 10 * 60 * 1000;

function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.savedAt > DRAFT_TTL) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

const RESIZE_CURSORS = {
  n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
  ne: "ne-resize", nw: "nw-resize", se: "se-resize", sw: "sw-resize",
};

const SOURCE_LABEL = { passenger: "Passager", catalogue: "Catalogue" };

function getFieldLabel(fieldId, sourceType) {
  const list = sourceType === "passenger" ? PASSENGER_FIELDS : CATALOGUE_FIELDS;
  return list.find((f) => f.id === fieldId)?.label ?? fieldId;
}

function clamp(min, max, val) {
  return Math.max(min, Math.min(max, val));
}

const Stepper = ({ label, value, min = 1, max = 12, onChange }) => (
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

const HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const OdysseeRubriqueCanvas = forwardRef(({ onSaved }, ref) => {
  const [name, setName] = useState("");
  const [columns, setColumns] = useState(2);
  const [rows, setRows] = useState(3);
  const [fieldPlacements, setFieldPlacements] = useState([]);
  const [sourceType, setSourceType] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [resizing, setResizing] = useState(null);
  const [moving, setMoving] = useState(null);
  // moving: { fieldId, colSpan, rowSpan, colStart, rowStart, grabCol, grabRow, isValid }

  const canvasAreaRef = useRef(null);
  const gridRef = useRef(null);

  const changeZoom = useCallback((delta) => {
    setZoom((prev) =>
      Math.min(3, Math.max(0.25, Math.round((prev + delta) * 10) / 10)),
    );
  }, []);

  // Ctrl + molette → zoom
  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const handler = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((prev) =>
        Math.min(3, Math.max(0.25, Math.round((prev + (e.deltaY < 0 ? 0.1 : -0.1)) * 10) / 10)),
      );
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    if (draft.name) setName(draft.name);
    if (draft.columns) setColumns(draft.columns);
    if (draft.rows) setRows(draft.rows);
    if (draft.sourceType) setSourceType(draft.sourceType);
    if (draft.fieldPlacements?.length) setFieldPlacements(draft.fieldPlacements);
  }, []);

  // Auto-save to localStorage (debounced 500ms, TTL refreshed on each change)
  useEffect(() => {
    if (!name && fieldPlacements.length === 0) return;
    const timer = setTimeout(() => {
      saveDraft({ name, columns, rows, fieldPlacements, sourceType });
    }, 500);
    return () => clearTimeout(timer);
  }, [name, columns, rows, fieldPlacements, sourceType]);

  // ─── Resize listeners (active only while resizing) ────────────────────────
  useEffect(() => {
    if (!resizing) return;

    document.body.style.cursor = RESIZE_CURSORS[resizing.handle] ?? "default";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e) => {
      const grid = gridRef.current;
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const cellW = rect.width / columns;
      const cellH = rect.height / rows;

      const mouseCol = clamp(1, columns, Math.floor((e.clientX - rect.left) / cellW) + 1);
      const mouseRow = clamp(1, rows, Math.floor((e.clientY - rect.top) / cellH) + 1);

      const { handle, fieldId } = resizing;
      const orig = fieldPlacements.find((p) => p.fieldId === fieldId);
      if (!orig) return;

      const origColEnd = orig.colStart + orig.colSpan - 1;
      const origRowEnd = orig.rowStart + orig.rowSpan - 1;

      // Intended new boundaries based on handle direction
      let c1 = orig.colStart;
      let c2 = origColEnd;
      let r1 = orig.rowStart;
      let r2 = origRowEnd;

      if (handle === "e" || handle === "ne" || handle === "se") c2 = Math.max(orig.colStart, mouseCol);
      if (handle === "w" || handle === "nw" || handle === "sw") c1 = Math.min(origColEnd, mouseCol);
      if (handle === "s" || handle === "se" || handle === "sw") r2 = Math.max(orig.rowStart, mouseRow);
      if (handle === "n" || handle === "ne" || handle === "nw") r1 = Math.min(origRowEnd, mouseRow);

      const conflictEdges = new Set();

      // Snap away from obstacles, mark conflict edges
      for (const other of fieldPlacements) {
        if (other.fieldId === fieldId) continue;
        const oc1 = other.colStart;
        const oc2 = other.colStart + other.colSpan - 1;
        const or1 = other.rowStart;
        const or2 = other.rowStart + other.rowSpan - 1;

        const rowsOverlap = r1 <= or2 && r2 >= or1;
        const colsOverlap = c1 <= oc2 && c2 >= oc1;

        if (rowsOverlap && colsOverlap) {
          if ((handle === "e" || handle === "ne" || handle === "se") && c2 >= oc1) {
            c2 = oc1 - 1;
            conflictEdges.add("e");
          }
          if ((handle === "w" || handle === "nw" || handle === "sw") && c1 <= oc2) {
            c1 = oc2 + 1;
            conflictEdges.add("w");
          }
          if ((handle === "s" || handle === "se" || handle === "sw") && r2 >= or1) {
            r2 = or1 - 1;
            conflictEdges.add("s");
          }
          if ((handle === "n" || handle === "ne" || handle === "nw") && r1 <= or2) {
            r1 = or2 + 1;
            conflictEdges.add("n");
          }
        }
      }

      // Ensure minimum 1×1
      c2 = Math.max(c1, c2);
      r2 = Math.max(r1, r2);

      setResizing((prev) => ({
        ...prev,
        colStart: c1,
        colSpan: c2 - c1 + 1,
        rowStart: r1,
        rowSpan: r2 - r1 + 1,
        conflictEdges,
      }));
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setFieldPlacements((prev) =>
        prev.map((p) =>
          p.fieldId === resizing.fieldId
            ? { ...p, colStart: resizing.colStart, rowStart: resizing.rowStart, colSpan: resizing.colSpan, rowSpan: resizing.rowSpan }
            : p,
        ),
      );
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing, fieldPlacements, columns, rows]);

  // ─── Move listeners (active only while moving) ───────────────────────────
  useEffect(() => {
    if (!moving) return;

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e) => {
      const grid = gridRef.current;
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const cellW = rect.width / columns;
      const cellH = rect.height / rows;

      const mouseCol = clamp(1, columns, Math.floor((e.clientX - rect.left) / cellW) + 1);
      const mouseRow = clamp(1, rows, Math.floor((e.clientY - rect.top) / cellH) + 1);

      // Anchor the grabbed cell under the mouse
      const newColStart = clamp(1, columns - moving.colSpan + 1, mouseCol - moving.grabCol);
      const newRowStart = clamp(1, rows - moving.rowSpan + 1, mouseRow - moving.grabRow);
      const newColEnd = newColStart + moving.colSpan - 1;
      const newRowEnd = newRowStart + moving.rowSpan - 1;

      // Valid only if no overlap with any other block
      const isValid = !fieldPlacements.some((p) => {
        if (p.fieldId === moving.fieldId) return false;
        return (
          newColStart <= p.colStart + p.colSpan - 1 &&
          newColEnd >= p.colStart &&
          newRowStart <= p.rowStart + p.rowSpan - 1 &&
          newRowEnd >= p.rowStart
        );
      });

      setMoving((prev) => ({ ...prev, colStart: newColStart, rowStart: newRowStart, isValid }));
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (moving.isValid) {
        setFieldPlacements((prev) =>
          prev.map((p) =>
            p.fieldId === moving.fieldId
              ? { ...p, colStart: moving.colStart, rowStart: moving.rowStart }
              : p,
          ),
        );
      }
      setMoving(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [moving, fieldPlacements, columns, rows]);

  // ─── Drag & drop (field from sidebar) ────────────────────────────────────
  const getCellOccupant = useCallback(
    (col, row) =>
      fieldPlacements.find(
        (p) =>
          col >= p.colStart &&
          col < p.colStart + p.colSpan &&
          row >= p.rowStart &&
          row < p.rowStart + p.rowSpan,
      ) ?? null,
    [fieldPlacements],
  );

  const handleDragOver = (e, col, row) => {
    if (!e.dataTransfer.types.includes("application/odyssee-field")) return;
    if (getCellOccupant(col, row)) return;
    e.preventDefault();
    setDragOverCell({ col, row });
  };

  const handleDragLeave = () => setDragOverCell(null);

  const handleDrop = (e, colStart, rowStart) => {
    e.preventDefault();
    setDragOverCell(null);
    const raw = e.dataTransfer.getData("application/odyssee-field");
    if (!raw) return;
    const { fieldId, sourceType: droppedType } = JSON.parse(raw);
    if (sourceType && sourceType !== droppedType) return;
    if (getCellOccupant(colStart, rowStart)) return;
    if (fieldPlacements.some((p) => p.fieldId === fieldId)) return;
    setSourceType(droppedType);
    setFieldPlacements((prev) => [
      ...prev,
      { fieldId, colStart, rowStart, colSpan: 1, rowSpan: 1 },
    ]);
  };

  const handleRemove = (fieldId) => {
    const next = fieldPlacements.filter((p) => p.fieldId !== fieldId);
    setFieldPlacements(next);
    if (next.length === 0) setSourceType(null);
  };

  const handleRotate = () => {
    setColumns(rows);
    setRows(columns);
  };

  const handleMoveStart = useCallback((e, placement) => {
    if (resizing) return; // don't start move during resize
    e.preventDefault();
    e.stopPropagation();

    const grid = gridRef.current;
    if (!grid) return;

    const rect = grid.getBoundingClientRect();
    const cellW = rect.width / columns;
    const cellH = rect.height / rows;

    const mouseCol = clamp(1, columns, Math.floor((e.clientX - rect.left) / cellW) + 1);
    const mouseRow = clamp(1, rows, Math.floor((e.clientY - rect.top) / cellH) + 1);

    // Which cell within the block was grabbed?
    const grabCol = clamp(0, placement.colSpan - 1, mouseCol - placement.colStart);
    const grabRow = clamp(0, placement.rowSpan - 1, mouseRow - placement.rowStart);

    setMoving({
      fieldId: placement.fieldId,
      colSpan: placement.colSpan,
      rowSpan: placement.rowSpan,
      colStart: placement.colStart,
      rowStart: placement.rowStart,
      grabCol,
      grabRow,
      isValid: true,
    });
  }, [resizing, columns, rows]);

  const handleResizeStart = useCallback((e, placement, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing({
      fieldId: placement.fieldId,
      handle,
      colStart: placement.colStart,
      rowStart: placement.rowStart,
      colSpan: placement.colSpan,
      rowSpan: placement.rowSpan,
      conflictEdges: new Set(),
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !sourceType) return { success: false };
    setIsSaving(true);
    setSaveStatus(null);
    const result = await odysseeBlockService.createBlock({
      name: name.trim(),
      sourceType,
      columns,
      rows,
      fieldPlacements,
    });
    if (result.success) {
      clearDraft();
      setSaveStatus({ type: "success", message: "Rubrique enregistrée." });
      onSaved?.(result.block);
    } else {
      setSaveStatus({ type: "error", message: result.error });
    }
    setIsSaving(false);
    return result;
  }, [name, sourceType, columns, rows, fieldPlacements, onSaved]);

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

  // ─── Cells & blocks rendering ─────────────────────────────────────────────
  // Compute effective placement for each field (resizing / moving overrides)
  const effectivePlacement = (p) => {
    if (resizing?.fieldId === p.fieldId)
      return { ...p, colStart: resizing.colStart, rowStart: resizing.rowStart, colSpan: resizing.colSpan, rowSpan: resizing.rowSpan };
    if (moving?.fieldId === p.fieldId)
      return { ...p, colStart: moving.colStart, rowStart: moving.rowStart };
    return p;
  };

  // Which cells are occupied by blocks (using effective positions)?
  const usedCells = new Set();
  fieldPlacements.forEach((p) => {
    const e = effectivePlacement(p);
    for (let r = e.rowStart; r < e.rowStart + e.rowSpan; r++) {
      for (let c = e.colStart; c < e.colStart + e.colSpan; c++) {
        usedCells.add(`${c},${r}`);
      }
    }
  });

  const blockEls = fieldPlacements.map((p) => {
    const eff = effectivePlacement(p);
    const isResizingThis = resizing?.fieldId === p.fieldId;
    const isMovingThis = moving?.fieldId === p.fieldId;
    const isInvalid = isMovingThis && !moving.isValid;
    const conflicts = isResizingThis && resizing.conflictEdges.size > 0
      ? [...resizing.conflictEdges].join(" ")
      : undefined;

    return (
      <div
        key={`block-${p.fieldId}`}
        className={[
          "ody-rubrique-canvas__block",
          isResizingThis ? "ody-rubrique-canvas__block--resizing" : "",
          isMovingThis   ? "ody-rubrique-canvas__block--moving"   : "",
          isInvalid      ? "ody-rubrique-canvas__block--invalid"  : "",
        ].filter(Boolean).join(" ")}
        data-conflicts={conflicts}
        style={{
          gridColumn: `${eff.colStart} / span ${eff.colSpan}`,
          gridRow: `${eff.rowStart} / span ${eff.rowSpan}`,
        }}
        onMouseDown={(e) => handleMoveStart(e, p)}
      >
        <span>{getFieldLabel(p.fieldId, sourceType)}</span>
        <button
          type="button"
          className="ody-rubrique-canvas__block-delete"
          onClick={() => handleRemove(p.fieldId)}
        >
          ×
        </button>
        {HANDLES.map((h) => (
          <div
            key={h}
            className={`ody-rubrique-canvas__resize-handle ody-rubrique-canvas__resize-handle--${h}`}
            onMouseDown={(e) => handleResizeStart(e, p, h)}
          />
        ))}
      </div>
    );
  });

  const cellEls = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= columns; c++) {
      if (usedCells.has(`${c},${r}`)) continue;
      const isOver = dragOverCell?.col === c && dragOverCell?.row === r;
      cellEls.push(
        <div
          key={`cell-${c}-${r}`}
          className={`ody-rubrique-canvas__cell${isOver ? " ody-rubrique-canvas__cell--over" : ""}`}
          style={{ gridColumn: c, gridRow: r }}
          onDragOver={(e) => handleDragOver(e, c, r)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, c, r)}
        />,
      );
    }
  }

  return (
    <div className="ody-rubrique-canvas">
      {/* ─── Barre de config ─────────────────────────────────────────────── */}
      <div className="ody-rubrique-canvas__config">
        <input
          type="text"
          className="ody-rubrique-canvas__config-input ody-rubrique-canvas__config-input--name"
          value={name}
          onChange={(e) => { setName(e.target.value); setSaveStatus(null); }}
          placeholder="Nom de la rubrique"
        />

        <Stepper label="Col" value={columns} onChange={setColumns} />
        <Stepper label="Lig" value={rows} onChange={setRows} />

        <div className="ody-rubrique-canvas__orientation-toggle">
          <button
            type="button"
            className={`ody-rubrique-canvas__orientation-btn${columns <= rows ? " ody-rubrique-canvas__orientation-btn--active" : ""}`}
            onClick={() => columns > rows && handleRotate()}
            title="Portrait"
          >
            <IconPassager size={14} />
          </button>
          <button
            type="button"
            className={`ody-rubrique-canvas__orientation-btn${columns > rows ? " ody-rubrique-canvas__orientation-btn--active" : ""}`}
            onClick={() => columns <= rows && handleRotate()}
            title="Paysage"
          >
            <IconPassagerLandscape size={14} />
          </button>
        </div>

        {sourceType && (
          <span className="ody-rubrique-canvas__source-label">
            {SOURCE_LABEL[sourceType]}
          </span>
        )}

        <div className="ody-rubrique-canvas__zoom">
          <button
            type="button"
            className="ody-rubrique-canvas__stepper-btn"
            onClick={() => changeZoom(-0.1)}
            disabled={zoom <= 0.25}
            title="Dézoomer"
          >
            −
          </button>
          <button
            type="button"
            className="ody-rubrique-canvas__zoom-reset"
            onClick={() => setZoom(1)}
            title="Réinitialiser le zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className="ody-rubrique-canvas__stepper-btn"
            onClick={() => changeZoom(0.1)}
            disabled={zoom >= 3}
            title="Zoomer"
          >
            +
          </button>
        </div>

        {isSaving && (
          <span className="ody-rubrique-canvas__saving-indicator">…</span>
        )}
      </div>

      {/* ─── Grille ──────────────────────────────────────────────────────── */}
      <div ref={canvasAreaRef} className="ody-rubrique-canvas__canvas-area">
        <div className="ody-rubrique-canvas__grid-wrap" style={{ zoom }}>
          <div
            ref={gridRef}
            className="ody-rubrique-canvas__grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 80px)`,
              gridTemplateRows: `repeat(${rows}, 80px)`,
            }}
          >
            {blockEls}
            {cellEls}
          </div>
        </div>
      </div>

      {/* ─── Statut enregistrement ───────────────────────────────────────── */}
      {saveStatus && (
        <div className={`ody-rubrique-canvas__status ody-rubrique-canvas__status--${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}
    </div>
  );
});

OdysseeRubriqueCanvas.displayName = "OdysseeRubriqueCanvas";

export default OdysseeRubriqueCanvas;
