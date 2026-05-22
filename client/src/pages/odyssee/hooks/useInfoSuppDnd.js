import { useRef, useState } from "react";

/**
 * Gestion du drag-and-drop pour la liste des blocs Info Supp.
 * Inspiré de useSidebarDnd mais simplifié : réordonnancement linéaire uniquement,
 * sans notion de dossiers ni de service réseau.
 * Retourne la même interface que useSidebarDnd pour rester compatible
 * avec SidebarCategoryItem.
 */
export const useInfoSuppDnd = ({ infoSupp, setInfoSupp }) => {
  const dragRef = useRef(null);
  const [ghostIndex, setGhostIndex] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // ── Handlers génériques ──────────────────────────────────────────────────

  const handleDragStart = (e, item) => {
    dragRef.current = item;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setGhostIndex(null);
    setDropTarget(null);
    dragRef.current = null;
  };

  const isGhostRedundant = (index) => {
    const drag = dragRef.current;
    if (!drag) return false;
    const currentIndex = infoSupp.findIndex((b) => b.id === drag.id);
    if (currentIndex === -1) return false;
    return index === currentIndex || index === currentIndex + 1;
  };

  // ── Action de dépôt ──────────────────────────────────────────────────────

  const handleDropBetween = (insertIndex) => {
    const drag = dragRef.current;
    setGhostIndex(null);
    setDropTarget(null);
    dragRef.current = null;
    if (!drag) return;
    const currentIndex = infoSupp.findIndex((b) => b.id === drag.id);
    if (currentIndex === -1) return;
    const newBlocks = [...infoSupp];
    const [moved] = newBlocks.splice(currentIndex, 1);
    const adjusted = currentIndex < insertIndex ? insertIndex - 1 : insertIndex;
    newBlocks.splice(Math.min(adjusted, newBlocks.length), 0, moved);
    setInfoSupp(newBlocks);
  };

  // ── Handlers sidebar ─────────────────────────────────────────────────────

  const handleSidebarDragOver = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    setGhostIndex(infoSupp.length);
    setDropTarget(null);
  };

  const handleSidebarDrop = (e) => {
    e.preventDefault();
    if (ghostIndex !== null) handleDropBetween(ghostIndex);
  };

  // ── Handlers par item ────────────────────────────────────────────────────

  const handleCategoryDragOver = (e, item, index) => {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag || drag.id === item.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    setGhostIndex(ratio < 0.5 ? index : index + 1);
    setDropTarget(null);
  };

  const handleCategoryDrop = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (ghostIndex !== null) handleDropBetween(ghostIndex);
  };

  return {
    dragRef,
    ghostIndex,
    nestedGhost: null,
    dropTarget,
    isGhostRedundant,
    handleDragStart,
    handleDragEnd,
    handleSidebarDragOver,
    handleSidebarDrop,
    handleCategoryDragOver,
    handleCategoryDrop,
  };
};
