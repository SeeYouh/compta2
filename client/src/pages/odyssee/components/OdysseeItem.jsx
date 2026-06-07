import { useMemo, useState } from 'react';

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
import SaveStatus from './SaveStatus';
import { odysseeDocumentService } from '../services/odysseeDocumentService';
import OdysseeDocumentSidebar from './OdysseeDocumentSidebar';
import OdysseeDocumentToggle, {
  MODE_DOCUMENT,
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
    [data-ody-item="${id}"] .ody-doc-toggle label {
      border-color: color-mix(in srgb, ${c.contrastBase} 40%, transparent);
      color: ${c.contrastBase};
    }
    [data-ody-item="${id}"] .ody-doc-toggle label p:first-child {
      background: color-mix(in srgb, ${c.contrastBase} 20%, transparent);
    }
    [data-ody-item="${id}"] .ody-doc-toggle input:checked + label p:first-child {
      background: transparent;
    }
    [data-ody-item="${id}"] .ody-doc-toggle input:checked + label p:last-child {
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
      background: ${c.lightness};
      border-left-color: ${c.dark};
    }
    [data-ody-item="${id}"] .ody-sidebar-section-title { color: ${c.darker}; }
    [data-ody-item="${id}"] .ody-sidebar-block-card {
      border-color: color-mix(in srgb, ${c.base} 25%, transparent);
      color: ${c.darkest};
    }
    [data-ody-item="${id}"] .ody-sidebar-block-card:hover {
      border-color: ${c.base};
    }
    [data-ody-item="${id}"] .ody-sidebar-block-card__meta { color: ${c.dark}; }
    [data-ody-item="${id}"] .ody-sidebar-item-card {
      border-color: color-mix(in srgb, ${c.base} 25%, transparent);
      color: ${c.darkest};
    }
    [data-ody-item="${id}"] .ody-sidebar-item-card--bound {
      background: color-mix(in srgb, ${c.base} 6%, transparent);
      border-color: color-mix(in srgb, ${c.base} 40%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-item-card__check { color: ${c.base}; }
    [data-ody-item="${id}"] .ody-sidebar-idle-msg { color: ${c.dark}; }
    [data-ody-item="${id}"] .ody-sidebar-selected-name { color: ${c.darkest}; }
    [data-ody-item="${id}"] .ody-sidebar-selected-type {
      background: color-mix(in srgb, ${c.base} 8%, transparent);
      color: ${c.darker};
    }
    [data-ody-item="${id}"] .ody-sidebar-warning {
      color: ${c.danger};
      background: color-mix(in srgb, ${c.danger} 8%, transparent);
      border-color: color-mix(in srgb, ${c.danger} 20%, transparent);
    }
    [data-ody-item="${id}"] .ody-sidebar-close-btn { color: ${c.dark}; }
    [data-ody-item="${id}"] .ody-sidebar-close-btn:hover { color: ${c.darkest}; }
    [data-ody-item="${id}"] .ody-sidebar-empty-msg { color: ${c.dark}; }
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
