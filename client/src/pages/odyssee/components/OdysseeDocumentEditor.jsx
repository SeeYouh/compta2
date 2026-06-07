import { useState } from "react";

import {
  DOCUMENT_MARGINS_DEFAULT,
  DOCUMENT_PAGE_DEFAULT,
} from "../config/documentGrid";
import { odysseeDocumentService } from "../services/odysseeDocumentService";
import { odysseeTemplateService } from "../services/odysseeTemplateService";
import OdysseeCanvas from "./OdysseeCanvas";
import OdysseeDocumentSidebar from "./OdysseeDocumentSidebar";
import OdysseeDocumentToggle, {
  MODE_DOCUMENT,
  MODE_TEMPLATE,
} from "./OdysseeDocumentToggle";

const OdysseeDocumentEditor = ({ categoryId, color }) => {
  const [mode, setMode] = useState(MODE_TEMPLATE);
  const [margins, setMargins] = useState(DOCUMENT_MARGINS_DEFAULT);
  const [pages, setPages] = useState([
    { ...DOCUMENT_PAGE_DEFAULT, blocks: [] },
  ]);
  const [templateId, setTemplateId] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [bindings, setBindings] = useState([]);
  const [selectedBlockPlacement, setSelectedBlockPlacement] = useState(null);
  const [docName, setDocName] = useState("");
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
        (b) => !(b.pageIndex === pageIndex && b.blockPlacementIndex === blockIndex),
      ),
    );
    if (
      selectedBlockPlacement?.pageIndex === pageIndex &&
      selectedBlockPlacement?.blockIndex === blockIndex
    ) {
      setSelectedBlockPlacement(null);
    }
  };

  const handleBindingDrop = ({ pageIndex, blockIndex, bindingData }) => {
    const { sourceType, sourceId, displayName } = bindingData;
    const filtered =
      sourceType === "passenger"
        ? bindings.filter((b) => b.sourceType !== "passenger")
        : bindings.filter(
            (b) =>
              !(b.pageIndex === pageIndex && b.blockPlacementIndex === blockIndex),
          );
    setBindings([
      ...filtered,
      { pageIndex, blockPlacementIndex: blockIndex, sourceType, sourceId, displayName },
    ]);
  };

  const handleSave = async () => {
    if (!categoryId) {
      setSaveStatus({ type: "error", message: "Aucune catégorie sélectionnée." });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
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
          productName: docName || "Sans titre",
          categoryId,
          color: color || "#969696",
          margins,
          pages: serializedPages,
        };
        const result = templateId
          ? await odysseeTemplateService.updateTemplate(templateId, payload)
          : await odysseeTemplateService.createTemplate(payload);

        if (result.success) {
          setTemplateId(result.template._id);
          setSaveStatus({ type: "success", message: "Template enregistré." });
        } else {
          setSaveStatus({ type: "error", message: result.error });
        }
      } else {
        if (!templateId) {
          setSaveStatus({
            type: "error",
            message: "Enregistrez d'abord le template avant de créer un document.",
          });
          return;
        }
        const payload = {
          productName: docName || "Sans titre",
          categoryId,
          templateId,
          color: color || "#969696",
          bindings: bindings.map(({ pageIndex, blockPlacementIndex, sourceType, sourceId }) => ({
            pageIndex,
            blockPlacementIndex,
            sourceType,
            sourceId,
          })),
        };
        const result = documentId
          ? await odysseeDocumentService.updateDocument(documentId, payload)
          : await odysseeDocumentService.createDocument(payload);

        if (result.success) {
          setDocumentId(result.document._id);
          setSaveStatus({ type: "success", message: "Document enregistré." });
        } else {
          setSaveStatus({ type: "error", message: result.error });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = (template) => {
    setMargins(template.margins);
    setPages(
      template.pages.map((p) => ({
        columns: p.columns,
        rows: p.rows,
        blocks: p.blocks.map((b) => ({
          colStart: b.colStart,
          rowStart: b.rowStart,
          colSpan: b.colSpan,
          rowSpan: b.rowSpan,
          blockDef: b.blockId,
        })),
      })),
    );
    setTemplateId(template._id);
    setDocName(template.productName);
    setBindings([]);
    setDocumentId(null);
    setSelectedBlockPlacement(null);
  };

  const handleLoadDocument = (document, template) => {
    handleLoadTemplate(template);
    setBindings(document.bindings || []);
    setDocumentId(document._id);
    setMode(MODE_DOCUMENT);
  };

  return (
    <div className="ody-doc-editor" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        className="ody-doc-editor__toolbar"
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}
      >
        <OdysseeDocumentToggle mode={mode} onChange={handleModeChange} color={color} />

        <input
          type="text"
          className="ody-doc-editor__name"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="Nom du document"
          style={{ fontSize: 13, padding: "3px 8px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: 4, width: 200 }}
        />

        {mode === MODE_TEMPLATE && (
          <div
            className="ody-doc-editor__margins"
            style={{ display: "flex", gap: 8, fontSize: 12 }}
          >
            {["top", "bottom", "left", "right"].map((side) => (
              <label key={side}>
                {side}&nbsp;
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={margins[side]}
                  onChange={(e) =>
                    setMargins((prev) => ({
                      ...prev,
                      [side]: Number(e.target.value),
                    }))
                  }
                  style={{ width: 40 }}
                />
                <span style={{ fontSize: 10, color: "#999" }}>mm</span>
              </label>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{ marginLeft: "auto", fontSize: 12, padding: "4px 12px", cursor: isSaving ? "default" : "pointer" }}
        >
          {isSaving ? "…" : "Enregistrer"}
        </button>

        {saveStatus && (
          <span
            style={{
              fontSize: 12,
              color: saveStatus.type === "success" ? "#2a9d2a" : "#c0392b",
            }}
          >
            {saveStatus.message}
          </span>
        )}
      </div>

      <div
        className="ody-doc-editor__body"
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        <OdysseeCanvas
          pages={pages}
          margins={margins}
          mode={mode}
          onPagesChange={setPages}
          onBlockDrop={handleBlockDrop}
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

export default OdysseeDocumentEditor;
