import { useRef, useState } from "react";

import FolderService from "../services/folderService";

export const useSidebarDnd = ({
  sidebarItems,
  setSidebarItems,
  folders,
  setFolders,
}) => {
  const dragRef = useRef(null);
  const [ghostIndex, setGhostIndex] = useState(null);
  const [nestedGhost, setNestedGhost] = useState(null); // { folderId, index }
  const [dropTarget, setDropTarget] = useState(null);

  // ── Utilitaire interne ───────────────────────────────────────────────────────

  const computeRemoveFromFolder = async (
    categoryId,
    folderId,
    currentItems,
    currentFolders,
  ) => {
    const folder = currentFolders.find((f) => f._id === folderId);
    if (!folder) return { newFolders: currentFolders, newItems: currentItems };

    const newCategoryIds = folder.categoryIds.filter((id) => id !== categoryId);

    if (newCategoryIds.length === 0) {
      await FolderService.deleteFolder(folderId);
      return {
        newFolders: currentFolders.filter((f) => f._id !== folderId),
        newItems: currentItems.filter((item) => item.id !== folderId),
      };
    }

    await FolderService.updateFolder(folderId, { categoryIds: newCategoryIds });
    return {
      newFolders: currentFolders.map((f) =>
        f._id === folderId ? { ...f, categoryIds: newCategoryIds } : f,
      ),
      newItems: currentItems,
    };
  };

  // ── Handlers génériques ──────────────────────────────────────────────────────

  const handleDragStart = (e, item) => {
    dragRef.current = item;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setGhostIndex(null);
    setNestedGhost(null);
    setDropTarget(null);
    dragRef.current = null;
  };

  const isGhostRedundant = (index) => {
    const drag = dragRef.current;
    if (!drag || drag.fromFolderId) return false;
    const currentIndex = sidebarItems.findIndex((i) => i.id === drag.id);
    if (currentIndex === -1) return false;
    return index === currentIndex || index === currentIndex + 1;
  };

  // ── Actions de dépôt ─────────────────────────────────────────────────────────

  const handleReorderInFolder = async (folderId) => {
    const drag = dragRef.current;
    const ghost = nestedGhost;
    setNestedGhost(null);
    setGhostIndex(null);
    setDropTarget(null);
    dragRef.current = null;
    if (!drag || ghost?.folderId !== folderId) return;
    const folder = folders.find((f) => f._id === folderId);
    if (!folder) return;
    const fromIndex = folder.categoryIds.indexOf(drag.id);
    if (fromIndex === -1) return;
    const newIds = [...folder.categoryIds];
    newIds.splice(fromIndex, 1);
    const adjusted = ghost.index > fromIndex ? ghost.index - 1 : ghost.index;
    newIds.splice(adjusted, 0, drag.id);
    if (newIds.join(",") === folder.categoryIds.join(",")) return;
    setFolders((prev) =>
      prev.map((f) => (f._id === folderId ? { ...f, categoryIds: newIds } : f)),
    );
    await FolderService.updateFolder(folderId, { categoryIds: newIds });
  };

  const handleDropBetween = async (insertIndex) => {
    const drag = dragRef.current;
    setGhostIndex(null);
    setNestedGhost(null);
    setDropTarget(null);
    dragRef.current = null;
    if (!drag) return;

    let newItems = [...sidebarItems];
    let newFolders = [...folders];

    if (drag.fromFolderId) {
      const result = await computeRemoveFromFolder(
        drag.id,
        drag.fromFolderId,
        newItems,
        newFolders,
      );
      newItems = result.newItems;
      newFolders = result.newFolders;
      const safeIndex = Math.min(insertIndex, newItems.length);
      newItems.splice(safeIndex, 0, { type: "category", id: drag.id });
    } else {
      const currentIndex = newItems.findIndex((item) => item.id === drag.id);
      if (currentIndex === -1) return;
      newItems.splice(currentIndex, 1);
      const adjustedIndex =
        currentIndex < insertIndex ? insertIndex - 1 : insertIndex;
      newItems.splice(Math.min(adjustedIndex, newItems.length), 0, {
        type: drag.type,
        id: drag.id,
      });
    }

    setFolders(newFolders);
    setSidebarItems(newItems);
    FolderService.updateLayout(newItems);
  };

  const handleDropOnItem = async (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    setGhostIndex(null);
    setNestedGhost(null);
    setDropTarget(null);
    dragRef.current = null;
    if (!drag || drag.id === target.id) return;

    // Catégorie sur catégorie → créer un dossier
    if (drag.type === "category" && target.type === "category") {
      let newItems = [...sidebarItems];
      let newFolders = [...folders];
      if (drag.fromFolderId) {
        const result = await computeRemoveFromFolder(
          drag.id,
          drag.fromFolderId,
          newItems,
          newFolders,
        );
        newItems = result.newItems;
        newFolders = result.newFolders;
      } else {
        newItems = newItems.filter((item) => item.id !== drag.id);
      }
      const targetIndex = newItems.findIndex((item) => item.id === target.id);
      const folderResult = await FolderService.createFolder([
        drag.id,
        target.id,
      ]);
      if (!folderResult.success) return;
      const newFolder = folderResult.folder;
      newFolders = [...newFolders, newFolder];
      if (targetIndex >= 0) {
        newItems.splice(targetIndex, 1, { type: "folder", id: newFolder._id });
      } else {
        newItems.push({ type: "folder", id: newFolder._id });
      }
      setFolders(newFolders);
      setSidebarItems(newItems);
      FolderService.updateLayout(newItems);
      return;
    }

    // Catégorie sur dossier → ajouter à la fin du dossier
    if (drag.type === "category" && target.type === "folder") {
      if (drag.fromFolderId === target.id) return;
      let newItems = [...sidebarItems];
      let newFolders = [...folders];
      if (drag.fromFolderId) {
        const result = await computeRemoveFromFolder(
          drag.id,
          drag.fromFolderId,
          newItems,
          newFolders,
        );
        newItems = result.newItems;
        newFolders = result.newFolders;
      } else {
        newItems = newItems.filter((item) => item.id !== drag.id);
      }
      const targetFolder = newFolders.find((f) => f._id === target.id);
      if (!targetFolder) return;
      const newCategoryIds = [...targetFolder.categoryIds, drag.id];
      const folderResult = await FolderService.updateFolder(target.id, {
        categoryIds: newCategoryIds,
      });
      if (!folderResult.success) return;
      newFolders = newFolders.map((f) =>
        f._id === target.id ? { ...f, categoryIds: newCategoryIds } : f,
      );
      setFolders(newFolders);
      setSidebarItems(newItems);
      FolderService.updateLayout(newItems);
    }
  };

  // ── Handlers d'événements sidebar ────────────────────────────────────────────

  const handleSidebarDragOver = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    setGhostIndex(sidebarItems.length);
    setDropTarget(null);
  };

  const handleSidebarDrop = (e) => {
    e.preventDefault();
    if (ghostIndex !== null) handleDropBetween(ghostIndex);
  };

  // ── Handlers d'événements catégorie standalone ───────────────────────────────

  const handleCategoryDragOver = (e, item, index) => {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag || drag.id === item.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    if (drag.type === "category") {
      if (ratio < 0.4) {
        setGhostIndex(index);
        setDropTarget(null);
      } else if (ratio > 0.6) {
        setGhostIndex(index + 1);
        setDropTarget(null);
      } else {
        setGhostIndex(null);
        setDropTarget({ action: "on", id: item.id, type: "category" });
      }
    } else {
      setGhostIndex(ratio < 0.5 ? index : index + 1);
      setDropTarget(null);
    }
  };

  const handleCategoryDrop = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropTarget?.action === "on" && dropTarget?.id === item.id) {
      handleDropOnItem(e, { type: "category", id: item.id });
    } else if (ghostIndex !== null) {
      handleDropBetween(ghostIndex);
    }
  };

  // ── Handlers d'événements dossier ────────────────────────────────────────────

  const handleFolderDragOver = (e, item, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      dragRef.current?.type === "category" &&
      dragRef.current?.fromFolderId !== item.id
    ) {
      // Catégorie externe → ratio haut / milieu / bas
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      if (ratio < 0.25) {
        setNestedGhost(null);
        setDropTarget(null);
        setGhostIndex(index);
      } else if (ratio > 0.75) {
        setNestedGhost(null);
        setDropTarget(null);
        setGhostIndex(index + 1);
      } else {
        setGhostIndex(null);
        setNestedGhost(null);
        setDropTarget({ action: "on", id: item.id, type: "folder" });
      }
    } else if (dragRef.current?.fromFolderId === item.id) {
      // Catégorie interne → les icônes nested gèrent la position
      setGhostIndex(null);
      setDropTarget(null);
    } else {
      // Dossier → réordonnancement sidebar
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      setNestedGhost(null);
      setGhostIndex(ratio < 0.5 ? index : index + 1);
      setDropTarget(null);
    }
  };

  const handleFolderDrop = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropTarget?.action === "on" && dropTarget?.id === item.id) {
      handleDropOnItem(e, { type: "folder", id: item.id });
    } else if (nestedGhost?.folderId === item.id) {
      handleReorderInFolder(item.id);
    } else if (ghostIndex !== null) {
      handleDropBetween(ghostIndex);
    }
  };

  // ── Handlers d'événements icônes nested ──────────────────────────────────────

  const handleNestedDragOver = (e, item, catId, nestedIdx) => {
    e.preventDefault();
    const drag = dragRef.current;
    if (
      drag?.type !== "category" ||
      drag?.fromFolderId !== item.id ||
      drag.id === catId
    )
      return;
    // Interne uniquement → on bloque et on positionne
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    setNestedGhost({
      folderId: item.id,
      index: ratio < 0.5 ? nestedIdx : nestedIdx + 1,
    });
  };

  const handleNestedDrop = (e, item) => {
    e.preventDefault();
    const drag = dragRef.current;
    if (drag?.fromFolderId !== item.id) return; // Externe → remonte au dossier
    e.stopPropagation();
    handleReorderInFolder(item.id);
  };

  return {
    dragRef,
    ghostIndex,
    nestedGhost,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    isGhostRedundant,
    handleSidebarDragOver,
    handleSidebarDrop,
    handleCategoryDragOver,
    handleCategoryDrop,
    handleFolderDragOver,
    handleFolderDrop,
    handleNestedDragOver,
    handleNestedDrop,
  };
};
