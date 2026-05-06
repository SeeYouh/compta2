import "../styles/ContextMenu.scss";

import { useCallback, useEffect, useRef, useState } from "react";

import { HexColorPicker } from "react-colorful";

import { api } from "../utils/api.js";
import useStore from "../store/useStore.js";

export default function ContextMenu() {
  const {
    contextMenu,
    closeContextMenu,
    activeCanvasId,
    canvases,
    navigateToChild,
    updateNodeLocal,
    addCanvasLocal,
    removeCanvasLocal,
  } = useStore();
  const menuRef = useRef(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#ffffff");

  const canvas = canvases[activeCanvasId];
  const node = canvas?.nodes?.find((n) => n.id === contextMenu?.nodeId);

  useEffect(() => {
    if (node) setCurrentColor(node.data.color || "#ffffff");
  }, [node]);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu();
        setColorPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [contextMenu, closeContextMenu]);

  const handleColorChange = useCallback(
    (color) => {
      if (!contextMenu) return;
      setCurrentColor(color);
      updateNodeLocal(activeCanvasId, contextMenu.nodeId, { color });
    },
    [activeCanvasId, contextMenu, updateNodeLocal],
  );

  const handleCreateChild = useCallback(async () => {
    if (!contextMenu || !node) return;
    try {
      const newCanvas = await api.createCanvas(contextMenu.nodeId);
      addCanvasLocal(newCanvas);
      updateNodeLocal(activeCanvasId, contextMenu.nodeId, {
        childCanvasId: newCanvas.id,
      });
      closeContextMenu();
    } catch (e) {
      console.error(e);
    }
  }, [
    contextMenu,
    node,
    activeCanvasId,
    addCanvasLocal,
    updateNodeLocal,
    closeContextMenu,
  ]);

  const handleDeleteChild = useCallback(async () => {
    if (!contextMenu || !node?.data.childCanvasId) return;
    try {
      await api.deleteCanvas(node.data.childCanvasId);
      removeCanvasLocal(node.data.childCanvasId);
      updateNodeLocal(activeCanvasId, contextMenu.nodeId, {
        childCanvasId: null,
      });
      closeContextMenu();
    } catch (e) {
      console.error(e);
    }
  }, [
    contextMenu,
    node,
    activeCanvasId,
    removeCanvasLocal,
    updateNodeLocal,
    closeContextMenu,
  ]);

  const handleEnterChild = useCallback(() => {
    if (!node?.data.childCanvasId) return;
    navigateToChild(node.data.childCanvasId, node.data.label);
    closeContextMenu();
  }, [node, navigateToChild, closeContextMenu]);

  if (!contextMenu || !node) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: contextMenu.y, left: contextMenu.x }}
    >
      <ul className="context-menu__list">
        <li
          className={`context-menu__item context-menu__item--color ${colorPickerOpen ? "open" : ""}`}
          onMouseEnter={() => setColorPickerOpen(true)}
          onMouseLeave={() => setColorPickerOpen(false)}
        >
          <span className="context-menu__icon">
            <span
              className="color-swatch"
              style={{ backgroundColor: currentColor }}
            />
          </span>
          Couleur du nœud
          <span className="context-menu__arrow">›</span>
          {colorPickerOpen && (
            <div className="context-menu__submenu context-menu__submenu--color">
              <HexColorPicker
                color={currentColor}
                onChange={handleColorChange}
              />
              <div className="color-hex-display">{currentColor}</div>
            </div>
          )}
        </li>

        <li className="context-menu__separator" />

        {node.data.childCanvasId ? (
          <>
            <li className="context-menu__item" onClick={handleEnterChild}>
              <span className="context-menu__icon">⤵</span>
              Entrer dans le canvas enfant
            </li>
            <li
              className="context-menu__item context-menu__item--danger"
              onClick={handleDeleteChild}
            >
              <span className="context-menu__icon">✕</span>
              Supprimer le canvas enfant
            </li>
          </>
        ) : (
          <li className="context-menu__item" onClick={handleCreateChild}>
            <span className="context-menu__icon">+</span>
            Créer un canvas enfant
          </li>
        )}
      </ul>
    </div>
  );
}
