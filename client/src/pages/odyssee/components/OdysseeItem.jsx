import { useMemo, useRef, useState } from 'react';

import ColorPicker from '../../../components/ColorPicker';
import IconSaveFalse from '../../../assets/IconSaveFalse';
import IconSaveTrue from '../../../assets/IconSaveTrue';
import {
  DOCUMENT_MARGINS_DEFAULT,
  DOCUMENT_PAGE_DEFAULT,
} from '../config/documentGrid';
import { computeColorPalette } from '../utils/colorPalette';
import { useOdysseeColor } from '../contexts/OdysseeColorContext';
import OdysseeCanvas from './OdysseeCanvas';
import OdysseeRubriqueCanvas from './OdysseeRubriqueCanvas';
import SaveStatus from './SaveStatus';
import { odysseeDocumentService } from '../services/odysseeDocumentService';
import OdysseeDocumentSidebar from './OdysseeDocumentSidebar';
import OdysseeDocumentToggle, {
  MODE_DOCUMENT,
  MODE_RUBRIQUE,
  MODE_TEMPLATE,
} from './OdysseeDocumentToggle';
import { odysseeTemplateService } from '../services/odysseeTemplateService';
import { odysseyItemService } from '../services/odysseyServices';

function buildOdysseeItemStyles(c, id) {
  return `
    [data-ody-item="${id}"] .ody-item__toolbar {
      background: ${c.base};
      border-bottom-color: ${c.dark};
    }
    [data-ody-item="${id}"] .ody-item__toolbar-input {
      color: ${c.contrastBase};
      border-color: color-mix(in srgb, ${c.contrastBase} 35%, transparent);
    }
    [data-ody-item="${id}"] .ody-item__toolbar-input::placeholder {
      color: color-mix(in srgb, ${c.contrastBase} 45%, transparent);
    }
    [data-ody-item="${id}"] .ody-item__margins-label {
      color: ${c.contrastBase};
    }
    [data-ody-item="${id}"] .ody-item__margins-label span {
      color: color-mix(in srgb, ${c.contrastBase} 60%, transparent);
    }
    [data-ody-item="${id}"] .ody-item__save-btn {
      background: color-mix(in srgb, ${c.contrastBase} 12%, transparent);
      border-color: color-mix(in srgb, ${c.contrastBase} 30%, transparent);
      color: ${c.contrastBase};
    }
    [data-ody-item="${id}"] .ody-item__save-btn:hover:not(:disabled) {
      background: color-mix(in srgb, ${c.contrastBase} 22%, transparent);
    }
    [data-ody-item="${id}"] .ody-item__color-btn {
      border-color: color-mix(in srgb, ${c.contrastBase} 30%, transparent);
    }
    [data-ody-item="${id}"] .ody-item__color-btn:hover {
      border-color: color-mix(in srgb, ${c.contrastBase} 60%, transparent);
    }
    [data-ody-item="${id}"] .paper-product__status--success {
      background-color: ${c.dark};
      color: ${c.lightness};
      border-left-color: ${c.base};
    }
    [data-ody-item="${id}"] .paper-product__status--error {
      background-color: ${c.darkest};
      color: ${c.dangerLight};
      border-left-color: ${c.danger};
    }
    [data-ody-item="${id}"] .ody-doc-toggle__pill {
      border-color: color-mix(in srgb, ${c.contrastBase} 40%, transparent);
      color: ${c.contrastBase};
    }
    [data-ody-item="${id}"] .ody-doc-toggle__btn--active {
      background: color-mix(in srgb, ${c.contrastBase} 20%, transparent);
    }
    [data-ody-item="${id}"] .ody-canvas { background: ${c.light}; }
    [data-ody-item="${id}"] .ody-canvas-page__controls { color: ${c.darkest}; }
    [data-ody-item="${id}"] .ody-canvas-block {
      border-color: color-mix(in srgb, ${c.base} 30%, transparent);
      color: ${c.darker};
    }
    [data-ody-item="${id}"] .ody-canvas-block--selected {
      border-color: ${c.base} !important;
      background: color-mix(in srgb, ${c.base} 8%, transparent) !important;
    }
    [data-ody-item="${id}"] .ody-canvas-block--bound {
      background: color-mix(in srgb, ${c.base} 8%, transparent);
      border-color: color-mix(in srgb, ${c.base} 50%, transparent);
    }
    [data-ody-item="${id}"] .ody-doc-sidebar {
      background: ${c.darkest};
      border-left-color: color-mix(in srgb, ${c.contrastDarkest} 12%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-msg {
      color: color-mix(in srgb, ${c.contrastDarkest} 45%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-panel__header {
      color: ${c.contrastDarkest};
      border-bottom-color: color-mix(in srgb, ${c.contrastDarkest} 12%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-panel__header:hover {
      background: color-mix(in srgb, ${c.contrastDarkest} 8%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-panel--open .ody-sidebar-panel__header {
      background: color-mix(in srgb, ${c.contrastDarkest} 5%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-panel__body {
      background: color-mix(in srgb, black 20%, ${c.darkest});
    }
    [data-ody-item="${id}"] .ody-sidebar-block-card {
      border-color: color-mix(in srgb, ${c.contrastDarkest} 15%, transparent);
      color: ${c.contrastDarkest};
      background: color-mix(in srgb, ${c.contrastDarkest} 5%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-block-card:hover {
      border-color: color-mix(in srgb, ${c.contrastDarkest} 35%, transparent);
      background: color-mix(in srgb, ${c.contrastDarkest} 10%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-block-card__meta {
      color: color-mix(in srgb, ${c.contrastDarkest} 55%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-item-card {
      border-color: color-mix(in srgb, ${c.contrastDarkest} 15%, transparent);
      color: ${c.contrastDarkest};
      background: color-mix(in srgb, ${c.contrastDarkest} 5%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-item-card--bound {
      background: color-mix(in srgb, ${c.base} 18%, ${c.darkest});
      border-color: color-mix(in srgb, ${c.base} 45%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-item-card__check { color: ${c.base}; }
    [data-ody-item="${id}"] .ody-sidebar-selected-type {
      background: color-mix(in srgb, ${c.base} 15%, transparent);
      color: color-mix(in srgb, ${c.contrastDarkest} 70%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-warning {
      color: ${c.dangerLight};
      background: color-mix(in srgb, ${c.danger} 12%, transparent);
      border-color: color-mix(in srgb, ${c.danger} 30%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-close-btn {
      color: color-mix(in srgb, ${c.contrastDarkest} 50%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-close-btn:hover {
      color: ${c.contrastDarkest};
    }
    [data-ody-item="${id}"] .ody-sidebar-cat-icon {
      background: color-mix(in srgb, ${c.contrastDarkest} 12%, transparent);
      color: ${c.contrastDarkest};
    }
    [data-ody-item="${id}"] .ody-sidebar-cat-icon--selected {
      outline: 2px solid ${c.base};
      outline-offset: 1px;
    }
    [data-ody-item="${id}"] .ody-sidebar-panel__item-strip {
      border-left-color: color-mix(in srgb, ${c.contrastDarkest} 10%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-cat-items__info {
      color: color-mix(in srgb, ${c.contrastDarkest} 40%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-item-icon {
      background: color-mix(in srgb, ${c.contrastDarkest} 12%, transparent);
      color: ${c.contrastDarkest};
    }
    [data-ody-item="${id}"] .ody-sidebar-item-icon--bound {
      outline-color: ${c.base};
    }
    [data-ody-item="${id}"] .ody-sidebar-context {
      border-color: color-mix(in srgb, ${c.contrastDarkest} 15%, transparent);
      color: color-mix(in srgb, ${c.contrastDarkest} 70%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-field-chip {
      border-color: color-mix(in srgb, ${c.contrastDarkest} 15%, transparent);
      color: ${c.contrastDarkest};
      background: color-mix(in srgb, ${c.contrastDarkest} 5%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-field-chip:hover {
      border-color: color-mix(in srgb, ${c.contrastDarkest} 35%, transparent);
      background: color-mix(in srgb, ${c.contrastDarkest} 10%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__config-input {
      color: ${c.darker};
      border-color: color-mix(in srgb, ${c.darker} 30%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__config-input::placeholder {
      color: color-mix(in srgb, ${c.darker} 40%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__stepper {
      color: ${c.darker};
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__stepper-btn {
      color: ${c.darker};
      border-color: color-mix(in srgb, ${c.darker} 30%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__stepper-btn:hover:not(:disabled) {
      background: color-mix(in srgb, ${c.darker} 10%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__config-btn {
      color: ${c.darker};
      border-color: color-mix(in srgb, ${c.darker} 30%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__config-btn:hover:not(:disabled) {
      background: color-mix(in srgb, ${c.darker} 10%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__source-label {
      background: color-mix(in srgb, ${c.base} 15%, transparent);
      color: ${c.darker};
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__grid-wrap {
      background: ${c.light};
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__cell {
      border-color: color-mix(in srgb, ${c.darker} 18%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__cell--over {
      background: color-mix(in srgb, ${c.base} 12%, transparent);
      border-color: color-mix(in srgb, ${c.base} 55%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__block {
      border-color: color-mix(in srgb, ${c.base} 40%, transparent);
      background: color-mix(in srgb, ${c.base} 12%, transparent);
      color: ${c.darker};
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__orientation-toggle {
      border-color: color-mix(in srgb, ${c.darker} 30%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__orientation-btn {
      color: ${c.darker};
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__orientation-btn--active {
      background: color-mix(in srgb, ${c.darker} 12%, transparent);
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__status--success {
      background: color-mix(in srgb, ${c.base} 10%, transparent);
      color: ${c.darker};
      border-left-color: ${c.base};
    }
    [data-ody-item="${id}"] .ody-rubrique-canvas__status--error {
      background: color-mix(in srgb, ${c.danger} 10%, transparent);
      color: ${c.dangerLight};
      border-left-color: ${c.danger};
    }
  `;
}

const OdysseeItem = ({
  contentFilesData,
  categoryId,
  onProductCreated,
  editMode = false,
  onActivate,
}) => {
  const entityId = contentFilesData._id || 'new-ody';

  const { colors: themeColors } = useOdysseeColor();
  const [color, setColor] = useState(contentFilesData.color || '');
  const [previewColor, setPreviewColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const activeColor = previewColor || color;
  const colors = useMemo(
    () => (activeColor ? computeColorPalette(activeColor) : themeColors),
    [activeColor, themeColors],
  );

  const itemStyles = useMemo(
    () => buildOdysseeItemStyles(colors, entityId),
    [colors, entityId],
  );

  const [mode, setMode] = useState(MODE_TEMPLATE);
  const [pages, setPages] = useState([{ ...DOCUMENT_PAGE_DEFAULT, blocks: [] }]);
  const [margins, setMargins] = useState(DOCUMENT_MARGINS_DEFAULT);
  const [productName, setProductName] = useState(contentFilesData.productName || '');
  const [aliasName, setAliasName] = useState(
    contentFilesData.aliasName?.name || '',
  );
  const [bindings, setBindings] = useState([]);
  const [selectedBlockPlacement, setSelectedBlockPlacement] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const rubriqueCanvasRef = useRef(null);

  const handleModeChange = (newMode) => {
    setSelectedBlockPlacement(null);
    setMode(newMode);
  };

  const handleBlockDrop = ({ pageIndex, colStart, rowStart, blockDef }) => {
    const colSpan = blockDef.defaultColSpan ?? 1;
    const rowSpan = blockDef.defaultRowSpan ?? 1;
    setPages((prev) =>
      prev.map((page, i) => {
        if (i !== pageIndex) return page;
        return {
          ...page,
          blocks: [
            ...page.blocks,
            { colStart, rowStart, colSpan, rowSpan, blockDef },
          ],
        };
      }),
    );
  };

  const handleBlockClick = (pageIndex, blockIndex, block) => {
    if (mode !== MODE_DOCUMENT) return;
    setSelectedBlockPlacement({
      pageIndex,
      blockIndex,
      sourceType: block.blockDef?.sourceType,
      blockId: block.blockDef?._id,
      name: block.blockDef?.name,
    });
  };

  const handleBlockRemove = (pageIndex, blockIndex) => {
    setPages((prev) =>
      prev.map((page, i) =>
        i !== pageIndex
          ? page
          : { ...page, blocks: page.blocks.filter((_, j) => j !== blockIndex) },
      ),
    );
    setBindings((prev) =>
      prev.filter(
        (b) =>
          !(
            b.pageIndex === pageIndex &&
            b.blockPlacementIndex === blockIndex
          ),
      ),
    );
    if (
      selectedBlockPlacement?.pageIndex === pageIndex &&
      selectedBlockPlacement?.blockIndex === blockIndex
    ) {
      setSelectedBlockPlacement(null);
    }
  };

  const handleBlockMove = ({ pageIndex, sourceBlockIndex, colStart, rowStart, colSpan, rowSpan, blockDef }) => {
    setPages((prev) =>
      prev.map((page, i) => {
        if (i !== pageIndex) return page;
        const filtered = page.blocks.filter((_, j) => j !== sourceBlockIndex);
        return {
          ...page,
          blocks: [...filtered, { colStart, rowStart, colSpan, rowSpan, blockDef }],
        };
      }),
    );
  };

  const handleBindingDrop = ({ pageIndex, blockIndex, bindingData }) => {
    const { sourceType, sourceId, displayName } = bindingData;
    const filtered =
      sourceType === 'passenger'
        ? bindings.filter((b) => b.sourceType !== 'passenger')
        : bindings.filter(
            (b) =>
              !(
                b.pageIndex === pageIndex &&
                b.blockPlacementIndex === blockIndex
              ),
          );
    setBindings([
      ...filtered,
      {
        pageIndex,
        blockPlacementIndex: blockIndex,
        sourceType,
        sourceId,
        displayName,
      },
    ]);
  };

  const handleSave = async () => {
    if (mode === MODE_RUBRIQUE) {
      await rubriqueCanvasRef.current?.save();
      return;
    }
    if (!categoryId) {
      setSaveStatus({ type: 'error', message: 'Aucune catégorie sélectionnée.' });
      return;
    }
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const itemUpdate = await odysseyItemService.updateItem(contentFilesData._id, {
        color: color || undefined,
      });

      if (mode === MODE_TEMPLATE) {
        const serializedPages = pages.map((page) => ({
          columns: page.columns,
          rows: page.rows,
          blocks: page.blocks.map((b) => ({
            blockId: b.blockDef._id,
            colStart: b.colStart,
            rowStart: b.rowStart,
            colSpan: b.colSpan,
            rowSpan: b.rowSpan,
          })),
        }));
        const payload = {
          productName: productName || 'Sans titre',
          aliasName: { activate: false, name: aliasName },
          categoryId,
          color: color || undefined,
          margins,
          pages: serializedPages,
        };
        const result = templateId
          ? await odysseeTemplateService.updateTemplate(templateId, payload)
          : await odysseeTemplateService.createTemplate(payload);
        if (result.success) {
          setTemplateId(result.template._id);
          setSaveStatus({ type: 'success', message: 'Template enregistré.' });
          setTimeout(() => setSaveStatus(null), 3000);
          onProductCreated?.(itemUpdate.product ?? contentFilesData);
        } else {
          setSaveStatus({ type: 'error', message: result.error });
        }
      } else {
        if (!templateId) {
          setSaveStatus({ type: 'error', message: "Enregistrez d'abord le template." });
          return;
        }
        const payload = {
          productName: productName || 'Sans titre',
          aliasName: { activate: false, name: aliasName },
          categoryId,
          color: color || undefined,
          templateId,
          bindings: bindings.map(
            ({ pageIndex, blockPlacementIndex, sourceType, sourceId }) => ({
              pageIndex,
              blockPlacementIndex,
              sourceType,
              sourceId,
            }),
          ),
        };
        const result = documentId
          ? await odysseeDocumentService.updateDocument(documentId, payload)
          : await odysseeDocumentService.createDocument(payload);
        if (result.success) {
          setDocumentId(result.document._id);
          setSaveStatus({ type: 'success', message: 'Document enregistré.' });
          setTimeout(() => setSaveStatus(null), 3000);
          onProductCreated?.(itemUpdate.product ?? contentFilesData);
        } else {
          setSaveStatus({ type: 'error', message: result.error });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="ody-item"
      data-ody-item={entityId}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}
    >
      <style>{itemStyles}</style>

      {/* ─── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="ody-item__toolbar">
        <input
          type="text"
          className="ody-item__toolbar-input ody-item__toolbar-input--name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Nom du document"
        />
        <input
          type="text"
          className="ody-item__toolbar-input ody-item__toolbar-input--alias"
          value={aliasName}
          onChange={(e) => setAliasName(e.target.value)}
          placeholder="Alias"
        />

        {mode === MODE_TEMPLATE && (
          <div className="ody-item__margins-wrap">
            {['top', 'bottom', 'left', 'right'].map((side) => (
              <label key={side} className="ody-item__margins-label">
                {side}&nbsp;
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={margins[side]}
                  onChange={(e) =>
                    setMargins((prev) => ({ ...prev, [side]: Number(e.target.value) }))
                  }
                />
                <span>mm</span>
              </label>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto' }} />
        <OdysseeDocumentToggle mode={mode} onChange={handleModeChange} />

        <div className="paper-product__save-wrap">
          {editMode ? (
            <button
              type="button"
              className="paper-product__save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              <IconSaveTrue color={colors.contrastBase} />
            </button>
          ) : (
            <div className="paper-product__save-btn" onClick={onActivate}>
              <IconSaveFalse color={colors.contrastBase} />
            </div>
          )}
          <span className="save-tooltip">
            {editMode ? 'Enregistrer' : "Activer l'édition"}
          </span>
        </div>

        <SaveStatus status={saveStatus} />

        <div className="ody-item__color-wrap">
          <button
            className="ody-item__color-btn"
            style={{ background: activeColor || colors.base }}
            onClick={() => setShowColorPicker((v) => !v)}
            title="Couleur de l'item"
          />
          {showColorPicker && (
            <div className="ody-item__color-picker-wrap">
              <ColorPicker
                value={color || colors.base}
                onChange={(hex) => {
                  setColor(hex);
                  setPreviewColor(null);
                  setShowColorPicker(false);
                }}
                onPreview={(hex) => setPreviewColor(hex)}
                onClose={() => {
                  setPreviewColor(null);
                  setShowColorPicker(false);
                }}
                showDefaultButtons={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Body : canvas + sidebar droite ───────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {mode === MODE_RUBRIQUE ? (
          <OdysseeRubriqueCanvas ref={rubriqueCanvasRef} onSaved={() => handleModeChange(MODE_TEMPLATE)} />
        ) : (
          <OdysseeCanvas
            pages={pages}
            margins={margins}
            mode={mode}
            onPagesChange={setPages}
            onBlockDrop={handleBlockDrop}
            onBlockMove={handleBlockMove}
            onBlockClick={handleBlockClick}
            onBlockRemove={handleBlockRemove}
            onBindingDrop={handleBindingDrop}
            selectedBlockPlacement={selectedBlockPlacement}
            bindings={bindings}
          />
        )}
        <OdysseeDocumentSidebar
          mode={mode}
          categoryId={categoryId}
          selectedBlockPlacement={selectedBlockPlacement}
          onClearSelection={() => setSelectedBlockPlacement(null)}
          bindings={bindings}
        />
      </div>
    </div>
  );
};

export default OdysseeItem;
