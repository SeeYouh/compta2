import "../styles/CustomNode.scss";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Handle, NodeResizer } from "@xyflow/react";

import { generateHandles } from "../utils/handles.js";
import useStore from "../store/useStore.js";

/**
 * Calcule une couleur de bordure contrastée à partir de la couleur du nœud.
 * Si la couleur est claire → assombrit de 40%, sinon éclaircit de 45%.
 */
function computeBorderColor(hex) {
  if (!hex || !hex.startsWith("#")) return null;
  const raw = hex.slice(1);
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Luminance perceptuelle
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isLight = luminance > 0.5;
  const factor = isLight ? 0.45 : 1.5;
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v * factor)));
  const toHex = (v) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function computeFontSize(width, height, text) {
  if (!text || text.length === 0) return 14;
  const w = width - 24;
  const h = height - 56;
  if (w <= 0 || h <= 0) return 8;
  const size = Math.sqrt((w * h) / (text.length * 0.77));
  return Math.min(18, Math.max(8, size));
}

function renderContent(text, fontSize) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="node-body__list">
        {listItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, i) => {
    const match = line.match(/^[-*]\s(.+)/);
    if (match) {
      listItems.push(match[1]);
    } else {
      flushList();
      if (line.trim()) {
        elements.push(<p key={i}>{line}</p>);
      }
    }
  });
  flushList();

  return (
    <div className="node-body__preview" style={{ fontSize }}>
      {elements}
    </div>
  );
}

const CustomNode = memo(({ id, data, selected }) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [content, setContent] = useState(data.content || "");
  const labelInputRef = useRef(null);
  const contentRef = useRef(null);
  const { openContextMenu, activeCanvasId, updateNodeLocal, navigateToChild } =
    useStore();

  const width = data.width || 150;
  const height = data.height || 150;
  const handles = generateHandles(width, height);

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);
  useEffect(() => {
    setContent(data.content || "");
  }, [data.content]);

  const fontSize = useMemo(
    () => computeFontSize(width, height, content),
    [width, height, content],
  );

  const handleLabelDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditingLabel(true);
    setTimeout(() => labelInputRef.current?.select(), 10);
  }, []);

  const commitLabel = useCallback(() => {
    setIsEditingLabel(false);
    if (label === data.label) return;
    updateNodeLocal(activeCanvasId, id, { label });
  }, [id, activeCanvasId, label, data.label, updateNodeLocal]);

  const handleLabelKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === "Escape") commitLabel();
    },
    [commitLabel],
  );

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditingContent(true);
    setTimeout(() => contentRef.current?.focus(), 10);
  }, []);

  const commitContent = useCallback(() => {
    setIsEditingContent(false);
    if (content === (data.content || "")) return;
    updateNodeLocal(activeCanvasId, id, { content });
  }, [id, activeCanvasId, content, data.content, updateNodeLocal]);

  const handleContentKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") commitContent();
    },
    [commitContent],
  );

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(id, e.clientX, e.clientY);
    },
    [id, openContextMenu],
  );

  const handleResizeEnd = useCallback(
    (_, params) => {
      const { width: w, height: h } = params;
      const rounded = { width: Math.round(w), height: Math.round(h) };
      updateNodeLocal(activeCanvasId, id, rounded);
    },
    [id, activeCanvasId, updateNodeLocal],
  );

  const borderColor = useMemo(
    () => (selected ? computeBorderColor(data.color) : undefined),
    [selected, data.color],
  );

  return (
    <div
      className={`custom-node ${selected ? "selected" : ""} ${data.childCanvasId ? "has-child" : ""}`}
      style={{
        backgroundColor: data.color,
        width: "100%",
        height: "100%",
        ...(borderColor
          ? { borderColor, boxShadow: `0 0 0 3px ${borderColor}55` }
          : {}),
      }}
      onContextMenu={handleContextMenu}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={80}
        onResizeEnd={handleResizeEnd}
        handleStyle={{ width: 14, height: 14, borderRadius: 3 }}
        lineStyle={{ borderWidth: 2 }}
      />

      {!isEditingContent &&
        handles.map((h) => (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.position}
            style={h.style}
            className="node-handle"
          />
        ))}
      {!isEditingContent &&
        handles.map((h) => (
          <Handle
            key={`t-${h.id}`}
            id={`t-${h.id}`}
            type="target"
            position={h.position}
            style={h.style}
            className="node-handle"
          />
        ))}

      <div className="node-header" onDoubleClick={handleLabelDoubleClick}>
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            className="node-header__input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={handleLabelKeyDown}
          />
        ) : (
          <span className="node-header__label">{label}</span>
        )}
      </div>

      <div className="node-body" onClick={handleContentClick}>
        {isEditingContent ? (
          <textarea
            ref={contentRef}
            className="node-body__textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={commitContent}
            onKeyDown={handleContentKeyDown}
            style={{ fontSize }}
          />
        ) : (
          renderContent(content, fontSize) || (
            <span className="node-body__placeholder">Ajouter du texte…</span>
          )
        )}
      </div>

      {data.childCanvasId && (
        <div
          className="child-indicator"
          title="Ouvrir le canvas enfant"
          onClick={(e) => {
            e.stopPropagation();
            navigateToChild(data.childCanvasId, data.label);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect
              x="1"
              y="1"
              width="4"
              height="4"
              rx="1"
              fill="currentColor"
              opacity="0.7"
            />
            <rect
              x="7"
              y="1"
              width="4"
              height="4"
              rx="1"
              fill="currentColor"
              opacity="0.7"
            />
            <rect
              x="1"
              y="7"
              width="4"
              height="4"
              rx="1"
              fill="currentColor"
              opacity="0.7"
            />
            <rect
              x="7"
              y="7"
              width="4"
              height="4"
              rx="1"
              fill="currentColor"
              opacity="0.7"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

CustomNode.displayName = "CustomNode";
export default CustomNode;
