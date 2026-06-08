import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import IconPassager from "../assets/IconPassager";
import IconPassagerLandscape from "../assets/IconPassagerLandscape";
import { CATALOGUE_FIELDS, PASSENGER_FIELDS } from "../config/fieldDefinitions";
import { odysseeBlockService } from "../services/odysseeBlockService";

const DRAFT_KEY = "ody_rubrique_draft";
const DRAFT_TTL = 10 * 60 * 1000; // 10 minutes

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

const SOURCE_LABEL = { passenger: "Passager", catalogue: "Catalogue" };

function getFieldLabel(fieldId, sourceType) {
  const list = sourceType === "passenger" ? PASSENGER_FIELDS : CATALOGUE_FIELDS;
  return list.find((f) => f.id === fieldId)?.label ?? fieldId;
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
  const canvasAreaRef = useRef(null);

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

  // Restore draft on mount (TTL check: expires 10min after last modification)
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    if (draft.name) setName(draft.name);
    if (draft.columns) setColumns(draft.columns);
    if (draft.rows) setRows(draft.rows);
    if (draft.sourceType) setSourceType(draft.sourceType);
    if (draft.fieldPlacements?.length) setFieldPlacements(draft.fieldPlacements);
  }, []);

  // Auto-save to localStorage on each modification (debounced 500ms)
  // TTL is refreshed on every change — expires only after 10min of inactivity
  useEffect(() => {
    if (!name && fieldPlacements.length === 0) return;
    const timer = setTimeout(() => {
      saveDraft({ name, columns, rows, fieldPlacements, sourceType });
    }, 500);
    return () => clearTimeout(timer);
  }, [name, columns, rows, fieldPlacements, sourceType]);

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

  // Expose save() to parent via ref
  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

  const cells = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= columns; c++) {
      const occupant = getCellOccupant(c, r);
      if (occupant && (occupant.colStart !== c || occupant.rowStart !== r)) continue;

      if (occupant) {
        cells.push(
          <div
            key={`block-${c}-${r}`}
            className="ody-rubrique-canvas__block"
            style={{
              gridColumn: `${c} / span ${occupant.colSpan}`,
              gridRow: `${r} / span ${occupant.rowSpan}`,
            }}
          >
            {getFieldLabel(occupant.fieldId, sourceType)}
            <button
              type="button"
              className="ody-rubrique-canvas__block-delete"
              onClick={() => handleRemove(occupant.fieldId)}
            >
              ×
            </button>
          </div>,
        );
      } else {
        const isOver = dragOverCell?.col === c && dragOverCell?.row === r;
        cells.push(
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
            className="ody-rubrique-canvas__grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 80px)`,
              gridTemplateRows: `repeat(${rows}, 80px)`,
            }}
          >
            {cells}
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
