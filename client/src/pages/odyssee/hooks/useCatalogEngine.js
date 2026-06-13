import { useEffect, useState } from "react";

import { useSidebarDnd } from "./useSidebarDnd";

// Cache persistant par type de service — survit aux re-montages, pas aux rechargements de page
const engineCache = new Map();

const enrichCategory = (cat) => ({ ...cat, active: false, products: [] });

export async function fetchAndProcessEngine(
  categoryService,
  sidebarFolderService,
) {
  if (engineCache.has(categoryService)) return engineCache.get(categoryService);

  const [catResult, sidebarResult] = await Promise.all([
    categoryService.getUserCategories(),
    sidebarFolderService.getSidebar(),
  ]);

  let finalCategories = [];
  let finalSidebarItems = [];
  let finalFolders = [];

  if (catResult.success && catResult.categories.length > 0) {
    const enriched = catResult.categories.map(enrichCategory);
    enriched[0].active = true;
    finalCategories = enriched;
  }

  if (sidebarResult.success) {
    const existingCatIds = new Set(
      (catResult.success ? catResult.categories : []).map((c) => c._id),
    );

    const ghostFolders = sidebarResult.folders.filter((f) =>
      f.categoryIds.every((id) => !existingCatIds.has(id)),
    );

    if (ghostFolders.length > 0) {
      await Promise.all(
        ghostFolders.map((f) => sidebarFolderService.deleteFolder(f._id)),
      );
    }

    const ghostIds = new Set(ghostFolders.map((f) => f._id));

    const partialFolders = sidebarResult.folders.filter(
      (f) =>
        !ghostIds.has(f._id) &&
        f.categoryIds.some((id) => !existingCatIds.has(id)),
    );
    await Promise.all(
      partialFolders.map((f) =>
        sidebarFolderService.updateFolder(f._id, {
          categoryIds: f.categoryIds.filter((id) => existingCatIds.has(id)),
        }),
      ),
    );

    const cleanFolders = sidebarResult.folders
      .filter((f) => !ghostIds.has(f._id))
      .map((f) =>
        partialFolders.find((p) => p._id === f._id)
          ? {
              ...f,
              categoryIds: f.categoryIds.filter((id) => existingCatIds.has(id)),
            }
          : f,
      );

    const cleanLayout = sidebarResult.layout.filter(
      (i) =>
        !(i.type === "folder" && ghostIds.has(i.id)) &&
        !(i.type === "category" && !existingCatIds.has(i.id)),
    );

    const hadStaleItems = sidebarResult.layout.length !== cleanLayout.length;
    finalFolders = cleanFolders;

    if (cleanLayout.length > 0) {
      finalSidebarItems = cleanLayout;
      if (ghostFolders.length > 0 || hadStaleItems)
        sidebarFolderService.updateLayout(cleanLayout);
    } else if (sidebarResult.layout.length === 0) {
      if (catResult.success && catResult.categories.length > 0) {
        finalSidebarItems = catResult.categories.map((c) => ({
          type: "category",
          id: c._id,
        }));
      }
    }
  }

  const result = {
    categories: finalCategories,
    sidebarItems: finalSidebarItems,
    folders: finalFolders,
    itemsByCategory: {},
  };
  engineCache.set(categoryService, result);
  return result;
}

const useCatalogEngine = ({
  categoryService,
  itemService,
  itemDeleteService,
  sidebarFolderService,
  itemFolderService,
  transformItemForEdit,
  newItemTemplate,
}) => {
  const [isLoading, setIsLoading] = useState(
    () => !engineCache.has(categoryService),
  );
  const [categories, setCategories] = useState(
    () => engineCache.get(categoryService)?.categories ?? [],
  );
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const cached = engineCache.get(categoryService);
    const firstCat =
      cached?.categories.find((c) => c.active) || cached?.categories[0];
    return firstCat?._id ?? null;
  });
  const [sidebarItems, setSidebarItems] = useState(
    () => engineCache.get(categoryService)?.sidebarItems ?? [],
  );
  const [folders, setFolders] = useState(
    () => engineCache.get(categoryService)?.folders ?? [],
  );
  const [productFolders, setProductFolders] = useState([]);
  const [editFolderModal, setEditFolderModal] = useState(null);
  const [deleteFolderFlow, setDeleteFolderFlow] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    itemId: null,
    itemName: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [folderSettingsModal, setFolderSettingsModal] = useState(null);
  const [categoryContextMenu, setCategoryContextMenu] = useState(null);
  const [folderOpenStates, setFolderOpenStates] = useState({});
  const [categorySettingsId, setCategorySettingsId] = useState(null);
  const [deleteCategoryFlow, setDeleteCategoryFlow] = useState(null);

  // ── Cache helpers ──────────────────────────────────────────────────────────────
  const getCache = () => engineCache.get(categoryService);

  const invalidateItemsCache = (categoryId) => {
    const entry = getCache();
    if (entry?.itemsByCategory)
      delete entry.itemsByCategory[String(categoryId)];
  };

  const patchCachedProductFolders = (categoryId, updater) => {
    const entry = getCache();
    const catItems = entry?.itemsByCategory?.[String(categoryId)];
    if (catItems) catItems.productFolders = updater(catItems.productFolders);
  };

  const dnd = useSidebarDnd({
    sidebarItems,
    setSidebarItems,
    folders,
    setFolders,
    folderService: sidebarFolderService,
  });

  // ── Chargement initial ───────────────────────────────────────────────────────

  useEffect(() => {
    if (engineCache.has(categoryService)) return;

    fetchAndProcessEngine(categoryService, sidebarFolderService)
      .then((data) => {
        setCategories(data.categories);
        setSidebarItems(data.sidebarItems);
        setFolders(data.folders);
        const firstCat =
          data.categories.find((c) => c.active) || data.categories[0];
        if (firstCat) setSelectedCategory(firstCat._id);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chargement des items quand la catégorie change ───────────────────────────

  useEffect(() => {
    if (!selectedCategory) return;
    loadItems(selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // ── Sync cache automatique (couvre aussi les mises à jour DnD) ───────────────
  useEffect(() => {
    const entry = getCache();
    if (entry) entry.categories = categories;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    const entry = getCache();
    if (entry) entry.sidebarItems = sidebarItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarItems]);

  useEffect(() => {
    const entry = getCache();
    if (entry) entry.folders = folders;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders]);

  const loadItems = async (categoryId) => {
    // ── Cache hit ────────────────────────────────────────────────────────────
    const cached = getCache();
    const cachedItems = cached?.itemsByCategory?.[String(categoryId)];
    if (cachedItems) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId
            ? { ...cat, products: cachedItems.products }
            : cat,
        ),
      );
      setProductFolders((prev) => {
        const other = prev.filter(
          (f) => String(f.categoryId) !== String(categoryId),
        );
        return [...other, ...(cachedItems.productFolders || [])];
      });
      setFolderOpenStates((prev) => {
        const updated = { ...prev };
        (cachedItems.productFolders || []).forEach((f) => {
          if (f.isOpen === false) updated[String(f._id)] = false;
          else delete updated[String(f._id)];
        });
        return updated;
      });
      return;
    }

    // ── Cache miss → fetch serveur ────────────────────────────────────────
    const result = await itemService.getItemsByCategory(categoryId);
    if (result.success) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId ? { ...cat, products: result.products } : cat,
        ),
      );
      setProductFolders((prev) => {
        const other = prev.filter(
          (f) => String(f.categoryId) !== String(categoryId),
        );
        return [...other, ...(result.folders || [])];
      });
      setFolderOpenStates((prev) => {
        const updated = { ...prev };
        (result.folders || []).forEach((f) => {
          if (f.isOpen === false) {
            updated[String(f._id)] = false;
          } else {
            delete updated[String(f._id)];
          }
        });
        return updated;
      });
      // Stocker les items en cache
      const entry = getCache();
      if (entry) {
        entry.itemsByCategory[String(categoryId)] = {
          products: result.products,
          productFolders: result.folders || [],
        };
      }
    }
  };

  // ── Items ────────────────────────────────────────────────────────────────────

  const handleItemCreated = (product) => {
    if (selectedCategory) {
      invalidateItemsCache(selectedCategory);
      loadItems(selectedCategory);
    }
    if (product) {
      setSelectedFileData(transformItemForEdit(product));
      setEditMode(true);
    }
  };

  const handleEditItem = (item) => {
    setSelectedFileData(transformItemForEdit(item));
    setEditMode(true);
  };

  const handleSelectItem = (item) => {
    if (selectedFileData?._id === item._id) {
      setSelectedFileData(null);
      return;
    }
    setSelectedFileData(transformItemForEdit(item));
    setEditMode(false);
  };

  const handleAddItem = (folderId) => {
    setSelectedFileData(newItemTemplate(folderId));
    setEditMode(false);
  };

  const updateSelectedColor = (color) => {
    setSelectedFileData((prev) => (prev ? { ...prev, color } : prev));
  };

  const confirmDeleteItem = async () => {
    const result = await itemDeleteService.deleteItem(deleteModal.itemId);
    if (result.success) {
      if (selectedFileData?._id === deleteModal.itemId) {
        setSelectedFileData(null);
      }
      invalidateItemsCache(selectedCategory);
      loadItems(selectedCategory);
    }
    setDeleteModal({ open: false, itemId: null, itemName: "" });
  };

  // ── Catégories ───────────────────────────────────────────────────────────────

  const handleCreateCategory = async (categoryData) => {
    const result = await categoryService.createCategory(categoryData);
    if (result.success) {
      const newCat = enrichCategory(result.category);
      setCategories((prev) =>
        [...prev, newCat].map((cat) => ({
          ...cat,
          active: cat._id === newCat._id,
        })),
      );
      setSidebarItems((prev) => {
        const newItems = [...prev, { type: "category", id: newCat._id }];
        sidebarFolderService.updateLayout(newItems);
        return newItems;
      });
      setSelectedCategory(newCat._id);
    }
    setShowCategoryModal(false);
  };

  const handleCategorySelect = (categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        active: cat._id === categoryId,
      })),
    );
    setSelectedCategory(categoryId);
  };

  const handleOpenDeleteCategory = async (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    const result = await itemService.getItemsByCategory(categoryId);
    const items = result.success ? result.products : [];
    setDeleteCategoryFlow({
      phase: "confirm",
      categoryId,
      categoryName: cat?.name || "cette librairie",
      items,
      confirmAll: false,
    });
  };

  const executeDeleteCategory = async (categoryId) => {
    const result = await categoryService.deleteCategory(categoryId);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));

      const parentFolder = folders.find((f) =>
        f.categoryIds.includes(categoryId),
      );

      if (parentFolder) {
        const newCategoryIds = parentFolder.categoryIds.filter(
          (id) => id !== categoryId,
        );
        if (newCategoryIds.length === 0) {
          sidebarFolderService.deleteFolder(parentFolder._id);
          setFolders((prev) => prev.filter((f) => f._id !== parentFolder._id));
          setSidebarItems((prev) => {
            const newItems = prev.filter((i) => i.id !== parentFolder._id);
            sidebarFolderService.updateLayout(newItems);
            return newItems;
          });
        } else {
          sidebarFolderService.updateFolder(parentFolder._id, {
            categoryIds: newCategoryIds,
          });
          setFolders((prev) =>
            prev.map((f) =>
              f._id === parentFolder._id
                ? { ...f, categoryIds: newCategoryIds }
                : f,
            ),
          );
        }
      } else {
        setSidebarItems((prev) => {
          const newItems = prev.filter((i) => i.id !== categoryId);
          sidebarFolderService.updateLayout(newItems);
          return newItems;
        });
      }

      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setSelectedFileData(null);
      }
      if (categorySettingsId === categoryId) setCategorySettingsId(null);
    }
    setDeleteCategoryFlow(null);
  };

  const handleConfirmDeleteCategory = () => {
    const { categoryId, items, confirmAll } = deleteCategoryFlow;
    if (items.length === 0 || confirmAll) {
      executeDeleteCategory(categoryId);
    } else {
      setDeleteCategoryFlow((prev) => ({
        ...prev,
        phase: "items",
        pendingIndex: 0,
      }));
    }
  };

  const handleConfirmCategoryItem = () => {
    const { categoryId, items, pendingIndex } = deleteCategoryFlow;
    if (pendingIndex < items.length - 1) {
      setDeleteCategoryFlow((prev) => ({
        ...prev,
        pendingIndex: prev.pendingIndex + 1,
      }));
    } else {
      executeDeleteCategory(categoryId);
    }
  };

  // ── Dossiers sidebar ─────────────────────────────────────────────────────────

  const toggleFolder = async (folderId) => {
    const folder = folders.find((f) => f._id === folderId);
    if (!folder) return;
    const newIsOpen = !folder.isOpen;
    setFolders((prev) =>
      prev.map((f) => (f._id === folderId ? { ...f, isOpen: newIsOpen } : f)),
    );
    sidebarFolderService.updateFolder(folderId, { isOpen: newIsOpen });
  };

  const handleFolderContextMenu = (e, folderId) => {
    e.preventDefault();
    setContextMenu({ folderId, x: e.clientX, y: e.clientY });
  };

  const handleToggleAllFolders = async () => {
    const allClosed = folders.every((f) => !f.isOpen);
    const newIsOpen = allClosed;
    setFolders((prev) => prev.map((f) => ({ ...f, isOpen: newIsOpen })));
    await Promise.all(
      folders.map((f) =>
        sidebarFolderService.updateFolder(f._id, { isOpen: newIsOpen }),
      ),
    );
  };

  const handleSaveFolderSettings = async ({ name, color }) => {
    const folderId = folderSettingsModal;
    const result = await sidebarFolderService.updateFolder(folderId, {
      name,
      color,
    });
    if (result.success) {
      setFolders((prev) =>
        prev.map((f) => (f._id === folderId ? { ...f, name, color } : f)),
      );
    }
    setFolderSettingsModal(null);
  };

  // ── Dossiers d'items ─────────────────────────────────────────────────────────

  const relevantFolders = productFolders.filter(
    (f) => String(f.categoryId) === String(selectedCategory),
  );
  const allProductFoldersClosed =
    relevantFolders.length > 0 &&
    relevantFolders.every((f) => folderOpenStates[String(f._id)] === false);

  const toggleAllProductFolders = () => {
    const opening = allProductFoldersClosed;
    setFolderOpenStates((prev) => {
      const updated = { ...prev };
      if (opening) {
        relevantFolders.forEach((f) => {
          delete updated[String(f._id)];
        });
      } else {
        relevantFolders.forEach((f) => {
          updated[String(f._id)] = false;
        });
      }
      return updated;
    });
    relevantFolders.forEach((f) =>
      itemFolderService.updateFolder(f._id, { isOpen: opening }),
    );
  };

  const toggleProductFolder = (folderId) => {
    const newState =
      folderOpenStates[String(folderId)] !== false ? false : true;
    setFolderOpenStates((prev) => ({ ...prev, [String(folderId)]: newState }));
    itemFolderService.updateFolder(folderId, { isOpen: newState });
    const pf = productFolders.find((f) => String(f._id) === String(folderId));
    if (pf) {
      patchCachedProductFolders(pf.categoryId, (fs) =>
        fs.map((f) =>
          String(f._id) === String(folderId) ? { ...f, isOpen: newState } : f,
        ),
      );
    }
  };

  const handleCreateItemFolder = async (categoryId, parentFolderId = null) => {
    const result = await itemFolderService.createFolder({
      categoryId,
      parentFolderId: parentFolderId || null,
    });
    if (result.success) {
      setProductFolders((prev) => [...prev, result.folder]);
      patchCachedProductFolders(categoryId, (fs) => [
        ...(fs || []),
        result.folder,
      ]);
    }
    setCategoryContextMenu(null);
  };

  const handleSaveItemFolderEdit = async ({ name, color }) => {
    const folderId = editFolderModal?.folderId;
    if (!folderId) return;
    const result = await itemFolderService.updateFolder(folderId, {
      name,
      color,
    });
    if (result.success) {
      setProductFolders((prev) =>
        prev.map((f) =>
          f._id === folderId
            ? { ...f, name: result.folder.name, color: result.folder.color }
            : f,
        ),
      );
      const pf = productFolders.find((f) => String(f._id) === String(folderId));
      if (pf) {
        patchCachedProductFolders(pf.categoryId, (fs) =>
          fs.map((f) =>
            String(f._id) === String(folderId)
              ? { ...f, name: result.folder.name, color: result.folder.color }
              : f,
          ),
        );
      }
    }
    setEditFolderModal(null);
  };

  const executeDeleteItemFolder = async (folderId) => {
    const result = await itemFolderService.deleteFolder(folderId);
    if (result.success) {
      // Collecter récursivement tous les IDs de dossiers supprimés (dossier + sous-dossiers)
      const affected = new Set();
      const collect = (id) => {
        affected.add(String(id));
        productFolders
          .filter((f) => String(f.parentFolderId) === String(id))
          .forEach((f) => collect(f._id));
      };
      collect(folderId);

      // Fermer le panneau si l'item sélectionné était dans un dossier supprimé
      if (selectedFileData) {
        const cat = categories.find((c) => c._id === selectedCategory);
        const existingAffected =
          selectedFileData._id &&
          (cat?.products || []).some(
            (p) =>
              String(p._id) === String(selectedFileData._id) &&
              affected.has(String(p.folderId)),
          );
        const newInFolder =
          !selectedFileData._id &&
          selectedFileData.folderId &&
          affected.has(String(selectedFileData.folderId));
        if (existingAffected || newInFolder) setSelectedFileData(null);
      }

      setProductFolders((prev) =>
        prev.filter((f) => !affected.has(String(f._id))),
      );
      if (selectedCategory) {
        invalidateItemsCache(selectedCategory);
        loadItems(selectedCategory);
      }
    }
    setDeleteFolderFlow(null);
  };

  const handleConfirmDeleteFolder = () => {
    const { folderId, items, confirmAll } = deleteFolderFlow;
    if (items.length === 0 || confirmAll) {
      executeDeleteItemFolder(folderId);
    } else {
      setDeleteFolderFlow((prev) => ({
        ...prev,
        phase: "items",
        pendingIndex: 0,
      }));
    }
  };

  const handleConfirmFolderItem = () => {
    const { folderId, items, pendingIndex } = deleteFolderFlow;
    if (pendingIndex < items.length - 1) {
      setDeleteFolderFlow((prev) => ({
        ...prev,
        pendingIndex: prev.pendingIndex + 1,
      }));
    } else {
      executeDeleteItemFolder(folderId);
    }
  };

  const handleMoveItemToFolder = async (
    itemId,
    folderId,
    rootOrder,
    sourceFolderId = null,
  ) => {
    // Vérifier avant le déplacement si le dossier source va devenir vide
    let shouldDeleteSourceFolder = false;
    if (sourceFolderId && !folderId) {
      const cat = categories.find(
        (c) => String(c._id) === String(selectedCategory),
      );
      const remainingItems = (cat?.products || []).filter(
        (p) =>
          String(p.folderId) === String(sourceFolderId) &&
          String(p._id) !== String(itemId),
      );
      shouldDeleteSourceFolder = remainingItems.length === 0;
    }

    const update = { folderId: folderId || null };
    if (rootOrder !== undefined) update.rootOrder = rootOrder;
    const result = await itemService.updateItem(itemId, update);
    if (result.success && selectedCategory) {
      if (shouldDeleteSourceFolder) {
        await itemFolderService.deleteFolder(sourceFolderId);
        setProductFolders((prev) =>
          prev.filter((f) => String(f._id) !== String(sourceFolderId)),
        );
        patchCachedProductFolders(selectedCategory, (fs) =>
          fs.filter((f) => String(f._id) !== String(sourceFolderId)),
        );
      }
      invalidateItemsCache(selectedCategory);
      loadItems(selectedCategory);
    }
  };

  const handleGroupItems = async (draggedId, targetId) => {
    const folderResult = await itemFolderService.createFolder({
      categoryId: selectedCategory,
    });
    if (!folderResult.success) return;
    const folderId = folderResult.folder._id;
    await Promise.all([
      itemService.updateItem(draggedId, { folderId }),
      itemService.updateItem(targetId, { folderId }),
    ]);
    setProductFolders((prev) => [...prev, folderResult.folder]);
    if (selectedCategory) {
      invalidateItemsCache(selectedCategory);
      loadItems(selectedCategory);
    }
  };

  const handleReorderItemFolders = async (folderIds) => {
    const ordered = folderIds
      .map((id) => productFolders.find((f) => String(f._id) === String(id)))
      .filter(Boolean)
      .map((f, i) => ({ ...f, order: i }));
    const others = productFolders.filter(
      (f) => !folderIds.some((id) => String(id) === String(f._id)),
    );
    const next = [...ordered, ...others];
    setProductFolders(next);
    patchCachedProductFolders(selectedCategory, () =>
      next.filter((f) => String(f.categoryId) === String(selectedCategory)),
    );
    await itemFolderService.reorderFolders(folderIds);
  };

  // ── Tooltip ──────────────────────────────────────────────────────────────────

  const handleTooltipEnter = (e, type, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type, id, top: rect.top + rect.height / 2 });
  };

  const handleTooltipLeave = () => setTooltip(null);

  // ── Menu contextuel catégorie ────────────────────────────────────────────────

  const handleCategoryContextMenu = (e, categoryId) => {
    setCategoryContextMenu({ categoryId, x: e.clientX, y: e.clientY });
  };

  // ── Retour ───────────────────────────────────────────────────────────────────

  return {
    isLoading,
    categories,
    selectedCategory,
    sidebarItems,
    folders,
    productFolders,
    editFolderModal,
    setEditFolderModal,
    deleteFolderFlow,
    setDeleteFolderFlow,
    showCategoryModal,
    setShowCategoryModal,
    deleteModal,
    setDeleteModal,
    editMode,
    selectedFileData,
    setSelectedFileData,
    setEditMode,
    tooltip,
    contextMenu,
    setContextMenu,
    folderSettingsModal,
    setFolderSettingsModal,
    categoryContextMenu,
    setCategoryContextMenu,
    folderOpenStates,
    categorySettingsId,
    setCategorySettingsId,
    deleteCategoryFlow,
    setDeleteCategoryFlow,
    allProductFoldersClosed,
    dnd,
    handleItemCreated,
    handleEditItem,
    handleSelectItem,
    handleAddItem,
    updateSelectedColor,
    confirmDeleteItem,
    handleCreateCategory,
    handleCategorySelect,
    handleOpenDeleteCategory,
    handleConfirmDeleteCategory,
    handleConfirmCategoryItem,
    toggleFolder,
    handleFolderContextMenu,
    handleToggleAllFolders,
    handleSaveFolderSettings,
    handleTooltipEnter,
    handleTooltipLeave,
    handleCategoryContextMenu,
    toggleAllProductFolders,
    toggleProductFolder,
    handleCreateItemFolder,
    handleSaveItemFolderEdit,
    handleConfirmDeleteFolder,
    handleConfirmFolderItem,
    handleMoveItemToFolder,
    handleGroupItems,
    handleReorderItemFolders,
  };
};

export default useCatalogEngine;
