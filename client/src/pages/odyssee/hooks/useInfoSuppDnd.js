import {
  useRef,
  useState,
} from 'react';

import { FOLDER_PALETTE } from '../config/folderColors';
import {
  useColorPreferences,
} from '../../../components/hooks/useColorPreferences';

// ── Helpers ──────────────────────────────────────────────────────────────────

const generateFolderId = () =>
  `isf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/** IDs de tous les blocs contenus dans des dossiers */
const getFolderChildIds = (items) => {
  const ids = new Set();
  items.forEach((item) => {
    if (item.type === "folder")
      (item.categoryIds || []).forEach((id) => ids.add(id));
  });
  return ids;
};

/** Items du niveau racine (non contenus dans un dossier) */
const getRootItems = (items) => {
  const childIds = getFolderChildIds(items);
  return items.filter((item) => !childIds.has(item.id));
};

/**
 * Reconstruit le tableau plat dans l'ordre :
 * rootItem, [enfants du dossier si rootItem est un dossier], rootItem suivant, …
 */
const rebuildItems = (allItems, newRootItems) => {
  const result = [];
  for (const rootItem of newRootItems) {
    const full = allItems.find((i) => i.id === rootItem.id) || rootItem;
    result.push(full);
    if (full.type === "folder") {
      (full.categoryIds || []).forEach((childId) => {
        const child = allItems.find((i) => i.id === childId);
        if (child) result.push(child);
      });
    }
  }
  return result;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useInfoSuppDnd = ({ infoSupp, setInfoSupp }) => {
  const dragRef = useRef(null);
  const [ghostIndex, setGhostIndex] = useState(null);
  const [nestedGhost, setNestedGhost] = useState(null); // { folderId, index }
  const [dropTarget, setDropTarget] = useState(null);
  const { getDefault } = useColorPreferences();

  const resetDnd = () => {
    setGhostIndex(null);
    setNestedGhost(null);
    setDropTarget(null);
    dragRef.current = null;
  };

  // ── Handlers génériques ──────────────────────────────────────────────────

  const handleDragStart = (e, item) => {
    dragRef.current = item;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => resetDnd();

  const isGhostRedundant = (index) => {
    const drag = dragRef.current;
    if (!drag || drag.fromFolderId) return false;
    const rootItems = getRootItems(infoSupp);
    const currentIndex = rootItems.findIndex((i) => i.id === drag.id);
    if (currentIndex === -1) return false;
    return index === currentIndex || index === currentIndex + 1;
  };

  // ── Retirer un bloc d'un dossier ─────────────────────────────────────────

  const removeFromFolder = (blockId, folderId, items) =>
    items.map((item) => {
      if (item.id !== folderId) return item;
      return {
        ...item,
        categoryIds: item.categoryIds.filter((id) => id !== blockId),
      };
    });

  // ── Supprimer les dossiers devenus vides ─────────────────────────────────

  const removeEmptyFolders = (items) =>
    items.filter(
      (item) =>
        item.type !== "folder" ||
        (item.categoryIds && item.categoryIds.length > 0),
    );

  // ── Réordonner les blocs dans un dossier ─────────────────────────────────

  const reorderInFolder = (folderId, insertIndex) => {
    const drag = dragRef.current;
    resetDnd();
    if (!drag || drag.fromFolderId !== folderId) return;
    setInfoSupp((prev) => {
      const folder = prev.find((i) => i.id === folderId);
      if (!folder) return prev;
      const fromIndex = folder.categoryIds.indexOf(drag.id);
      if (fromIndex === -1) return prev;
      const newIds = [...folder.categoryIds];
      newIds.splice(fromIndex, 1);
      const adjusted = fromIndex < insertIndex ? insertIndex - 1 : insertIndex;
      newIds.splice(Math.min(adjusted, newIds.length), 0, drag.id);
      const updated = prev.map((i) =>
        i.id === folderId ? { ...i, categoryIds: newIds } : i,
      );
      return rebuildItems(updated, getRootItems(updated));
    });
  };

  // ── Réordonner niveau racine ──────────────────────────────────────────────

  const handleDropBetween = (insertIndex) => {
    const drag = dragRef.current;
    resetDnd();
    if (!drag) return;
    setInfoSupp((prev) => {
      let items = [...prev];

      if (drag.fromFolderId) {
        items = removeFromFolder(drag.id, drag.fromFolderId, items);
        items = removeEmptyFolders(items);
        const rootItems = getRootItems(items);
        const block = items.find((i) => i.id === drag.id);
        if (!block) return prev;
        const newRoot = [...rootItems];
        newRoot.splice(Math.min(insertIndex, newRoot.length), 0, block);
        return rebuildItems(items, newRoot);
      }

      const rootItems = getRootItems(items);
      const currentIndex = rootItems.findIndex((i) => i.id === drag.id);
      if (currentIndex === -1) return prev;
      const newRoot = [...rootItems];
      newRoot.splice(currentIndex, 1);
      const adjusted =
        currentIndex < insertIndex ? insertIndex - 1 : insertIndex;
      newRoot.splice(
        Math.min(adjusted, newRoot.length),
        0,
        rootItems[currentIndex],
      );
      return rebuildItems(items, newRoot);
    });
  };

  // ── Déposer sur un item (créer dossier ou ajouter à dossier) ─────────────

  const handleDropOnItem = (drag, target) => {
    resetDnd();
    if (!drag || drag.id === target.id) return;

    // Bloc sur bloc → créer un dossier
    if (drag.type === "category" && target.type === "category") {
      setInfoSupp((prev) => {
        let items = [...prev];
        if (drag.fromFolderId) {
          items = removeFromFolder(drag.id, drag.fromFolderId, items);
          items = removeEmptyFolders(items);
        }

        const rootItems = getRootItems(items);
        const dragRootIndex = rootItems.findIndex((i) => i.id === drag.id);
        const targetRootIndex = rootItems.findIndex((i) => i.id === target.id);

        const newFolder = {
          id: generateFolderId(),
          type: "folder",
          title: "Dossier",
          color: getDefault("odyssee-infosupp-folder") ?? FOLDER_PALETTE[0],
          isOpen: true,
          categoryIds: [drag.id, target.id],
        };

        items = [...items, newFolder];

        const newRoot = rootItems.filter(
          (i) => i.id !== drag.id && i.id !== target.id,
        );
        const insertAt =
          !drag.fromFolderId &&
          dragRootIndex !== -1 &&
          dragRootIndex < targetRootIndex
            ? targetRootIndex - 1
            : targetRootIndex;
        newRoot.splice(
          Math.max(0, Math.min(insertAt, newRoot.length)),
          0,
          newFolder,
        );
        return rebuildItems(items, newRoot);
      });
      return;
    }

    // Bloc sur dossier → ajouter au dossier
    if (drag.type === "category" && target.type === "folder") {
      if (drag.fromFolderId === target.id) return;
      setInfoSupp((prev) => {
        let items = [...prev];
        if (drag.fromFolderId) {
          items = removeFromFolder(drag.id, drag.fromFolderId, items);
          items = removeEmptyFolders(items);
        }
        items = items.map((item) => {
          if (item.id !== target.id) return item;
          return {
            ...item,
            categoryIds: [...(item.categoryIds || []), drag.id],
          };
        });
        return rebuildItems(items, getRootItems(items));
      });
    }
  };

  // ── Handlers sidebar ─────────────────────────────────────────────────────

  const handleSidebarDragOver = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    setGhostIndex(getRootItems(infoSupp).length);
    setDropTarget(null);
  };

  const handleSidebarDrop = (e) => {
    e.preventDefault();
    if (ghostIndex !== null) handleDropBetween(ghostIndex);
  };

  // ── Handlers item standalone ──────────────────────────────────────────────

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
      handleDropOnItem(dragRef.current, { type: "category", id: item.id });
    } else if (ghostIndex !== null) {
      handleDropBetween(ghostIndex);
    }
  };

  // ── Handlers dossier ─────────────────────────────────────────────────────

  const handleFolderDragOver = (e, item, index) => {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.type === "category" && drag.fromFolderId !== item.id) {
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
    } else if (drag.fromFolderId === item.id) {
      setGhostIndex(null);
      setDropTarget(null);
    } else {
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
      handleDropOnItem(dragRef.current, { type: "folder", id: item.id });
    } else if (nestedGhost?.folderId === item.id) {
      reorderInFolder(item.id, nestedGhost.index);
    } else if (ghostIndex !== null) {
      handleDropBetween(ghostIndex);
    }
  };

  // ── Handlers nested ───────────────────────────────────────────────────────

  const handleNestedDragOver = (e, item, catId, nestedIdx) => {
    e.preventDefault();
    const drag = dragRef.current;
    if (
      drag?.type !== "category" ||
      drag?.fromFolderId !== item.id ||
      drag.id === catId
    )
      return;
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
    if (drag?.fromFolderId !== item.id) return;
    e.stopPropagation();
    reorderInFolder(item.id, nestedGhost?.index ?? 0);
  };

  return {
    dragRef,
    ghostIndex,
    nestedGhost,
    dropTarget,
    isGhostRedundant,
    handleDragStart,
    handleDragEnd,
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
