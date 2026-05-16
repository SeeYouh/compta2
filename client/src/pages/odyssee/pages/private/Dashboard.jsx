import { Fragment, useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary } from "../../utils/variable";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { darken } from "../../utils/colorUtils";
import { DARKEN_BG, DARKEN_BORDER } from "../../config/folderColors";
import FolderContextMenu from "../../components/FolderContextMenu";
import FolderService from "../../services/folderService";
import FolderSettingsModal from "../../components/FolderSettingsModal";
import Gear from "../../assets/gear";
import IconDossierFull from "../../assets/IconDossierFull";
import OdysseeCategoryService from "../../../../services/odysseeCategoryService";
import OdysseeProductService from "../../../../services/odysseeProductService";
import PaperProduct from "../../components/PaperProduct";
import ProductService from "../../services/productService";
import SynapseUserMenu from "../../../../components/SynapseUserMenu";

const Dashboard = () => {
  const navigate = useNavigate();
  const [width, _setWidth] = useState(400);
  const [availableHeight, setAvailableHeight] = useState(null);
  const [selectedCategoryLibrary, setSelectedCategoryLibrary] = useState(
    categoryLibrary[2].name,
  );
  const [selectedFileData, setSelectedFileData] = useState(null);

  const categorySelected = categoryLibrary[0];

  const checkCategorySelected = (radioId) => {
    setSelectedCategoryLibrary((selected) =>
      selected === radioId ? categorySelected : radioId,
    );
  };

  const selectedCategoryLibrary_old = categoryLibrary.find(
    (item) => item.name === selectedCategoryLibrary,
  );

  const onMouseEnter = () => {
    setDataTimeRotateGear((prev) => ({
      ...prev,
      timeRotateGear: prev.timeRotateGear / 3,
    }));
  };

  const onMouseLeave = () => {
    setDataTimeRotateGear((prev) => ({
      ...prev,
      timeRotateGear: prev.timeRotateGear * 3,
    }));
  };

  const [dataTimeRotateGear, setDataTimeRotateGear] = useState({
    timeRotateGear: 5,
    numberTeethGear: 7,
    numberTeethGear2: 9,
    numberTeethGear3: 10,
  });

  // États pour les modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    productId: null,
    productName: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Catégories chargées depuis l'API
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Sidebar : ordre + dossiers
  const [sidebarItems, setSidebarItems] = useState([]);
  const [folders, setFolders] = useState([]);

  // Drag & drop
  const dragRef = useRef(null);
  const [ghostIndex, setGhostIndex] = useState(null);
  const [nestedGhost, setNestedGhost] = useState(null); // { folderId, index }
  const [dropTarget, setDropTarget] = useState(null);

  // UI flottante
  const [tooltip, setTooltip] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [folderSettingsModal, setFolderSettingsModal] = useState(null);

  // Initiales du nom de catégorie (ex: "la catégorie" → "lc")
  const getInitials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .slice(0, 3);

  const enrichCategory = (cat) => ({ ...cat, active: false, products: [] });

  // Chargement initial : catégories + layout sidebar
  useEffect(() => {
    const init = async () => {
      const [catResult, sidebarResult] = await Promise.all([
        OdysseeCategoryService.getUserCategories(),
        FolderService.getSidebar(),
      ]);

      let enriched = [];
      if (catResult.success && catResult.categories.length > 0) {
        enriched = catResult.categories.map(enrichCategory);
        enriched[0].active = true;
        setCategories(enriched);
        setSelectedCategory(enriched[0]._id);
      }

      if (sidebarResult.success) {
        setFolders(sidebarResult.folders);
        if (sidebarResult.layout.length > 0) {
          setSidebarItems(sidebarResult.layout);
        } else if (enriched.length > 0) {
          // Première connexion : génération automatique depuis les catégories
          const items = enriched.map((cat) => ({
            type: "category",
            id: cat._id,
          }));
          setSidebarItems(items);
          FolderService.updateLayout(items);
        }
      }
    };
    init();
  }, []);

  // Chargement des produits quand la catégorie sélectionnée change
  useEffect(() => {
    if (!selectedCategory) return;
    loadProducts(selectedCategory);
  }, [selectedCategory]);

  const loadProducts = async (categoryId) => {
    const result =
      await OdysseeProductService.getProductsByCategory(categoryId);
    if (result.success) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId ? { ...cat, products: result.products } : cat,
        ),
      );
    }
  };

  const handleProductCreated = () => {
    if (selectedCategory) loadProducts(selectedCategory);
  };

  const handleEditProduct = (product) => {
    setSelectedFileData({ ...product.contentFilesData, _id: product._id });
    setEditMode(true);
  };

  const handleSelectProduct = (product) => {
    setSelectedFileData({ ...product.contentFilesData, _id: product._id });
    setEditMode(false);
  };

  const confirmDeleteProduct = async () => {
    const result = await ProductService.deleteProduct(deleteModal.productId);
    if (result.success) {
      if (selectedFileData?._id === deleteModal.productId) {
        setSelectedFileData(null);
      }
      loadProducts(selectedCategory);
    }
    setDeleteModal({ open: false, productId: null, productName: "" });
  };

  // Création d'une catégorie via API (nom limité à 15 caractères)
  const handleCreateCategory = async (categoryData) => {
    const truncated = { ...categoryData, name: categoryData.name.slice(0, 15) };
    const result = await OdysseeCategoryService.createCategory(truncated);
    if (result.success) {
      const newCat = enrichCategory(result.category);
      setCategories((prev) => [...prev, newCat]);
      setSidebarItems((prev) => {
        const newItems = [...prev, { type: "category", id: newCat._id }];
        FolderService.updateLayout(newItems);
        return newItems;
      });
    }
    setShowCategoryModal(false);
  };

  // ── Dossiers ────────────────────────────────────────────────────────────────

  const toggleFolder = async (folderId) => {
    const folder = folders.find((f) => f._id === folderId);
    if (!folder) return;
    const newIsOpen = !folder.isOpen;
    setFolders((prev) =>
      prev.map((f) => (f._id === folderId ? { ...f, isOpen: newIsOpen } : f)),
    );
    FolderService.updateFolder(folderId, { isOpen: newIsOpen });
  };

  // Retire une catégorie d'un dossier. Supprime le dossier s'il devient vide.
  // Retourne { newFolders, newItems } à partir des valeurs courantes passées en paramètre.
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

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

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

  // Réordonnancement au sein d'un même dossier
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

  // Dépose entre deux éléments de la sidebar (réordonnancement / retrait de dossier)
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
      // Retrait du dossier source
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
      // Réordonnancement dans la sidebar
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

  // Dépose sur un élément existant (catégorie ou dossier)
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

    // Catégorie sur dossier → ajouter au dossier
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

  // ── Tooltip ──────────────────────────────────────────────────────────────────

  const handleTooltipEnter = (e, type, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type, id, top: rect.top + rect.height / 2 });
  };

  const handleTooltipLeave = () => setTooltip(null);

  // ── Menu contextuel + paramètres dossier ─────────────────────────────────────

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
        FolderService.updateFolder(f._id, { isOpen: newIsOpen }),
      ),
    );
  };

  const handleSaveFolderSettings = async ({ name, color }) => {
    const folderId = folderSettingsModal;
    const result = await FolderService.updateFolder(folderId, { name, color });
    if (result.success) {
      setFolders((prev) =>
        prev.map((f) => (f._id === folderId ? { ...f, name, color } : f)),
      );
    }
    setFolderSettingsModal(null);
  };

  // ── Ghost ────────────────────────────────────────────────────────────────────

  // Ghost redondant = position identique à celle de l'item en cours de drag
  // (juste avant lui ou juste après lui → aucun déplacement réel)
  const isGhostRedundant = (index) => {
    const drag = dragRef.current;
    if (!drag || drag.fromFolderId) return false;
    const currentIndex = sidebarItems.findIndex((i) => i.id === drag.id);
    if (currentIndex === -1) return false;
    return index === currentIndex || index === currentIndex + 1;
  };

  const renderGhost = () => {
    const drag = dragRef.current;
    if (!drag) return null;

    if (drag.type === "category") {
      const cat = categories.find((c) => c._id === drag.id);
      if (!cat) return null;
      return (
        <div
          key="ghost"
          className="catalog-sidebar__icon catalog-sidebar__icon--ghost"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {cat.image ? (
            <img src={cat.image} alt={cat.name} />
          ) : (
            getInitials(cat.name)
          )}
        </div>
      );
    }

    if (drag.type === "folder") {
      const folder = folders.find((f) => f._id === drag.id);
      if (!folder) return null;
      const color = folder.color || "#969696";
      return (
        <div
          key="ghost"
          className="catalog-sidebar__folder catalog-sidebar__folder--ghost"
          style={{
            borderColor: darken(color, DARKEN_BORDER),
            background: darken(color, DARKEN_BG),
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="catalog-sidebar__icon catalog-sidebar__icon--folder">
            <IconDossierFull size={22} color={color} />
          </div>
        </div>
      );
    }

    return null;
  };

  // Fonctions pour les catégories
  const handleCategorySelect = (categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        active: cat._id === categoryId,
      })),
    );
    setSelectedCategory(categoryId);
  };

  useEffect(() => {
    const updateAvailableHeight = () => {
      const container = document.querySelector(".container-profil");
      const navBar = document.querySelector(".library-navBar");
      const titleLibrary = document.querySelector(".title-library");

      if (container && navBar && titleLibrary) {
        const totalHeight = window.innerHeight;
        const containerHeight = container.getBoundingClientRect().height;
        const navBarHeight = navBar.getBoundingClientRect().height;
        const titleHeight = titleLibrary.getBoundingClientRect().height;
        const remaining =
          totalHeight - containerHeight - navBarHeight - titleHeight;

        setAvailableHeight(remaining);
      }
    };

    updateAvailableHeight();
    window.addEventListener("resize", updateAvailableHeight);
    return () => window.removeEventListener("resize", updateAvailableHeight);
  }, []);

  useEffect(() => {
    setSelectedFileData(null);
  }, [selectedCategoryLibrary]);

  useEffect(() => {
    // user info disponible dans localStorage si nécessaire
  }, []);

  return (
    <div
      className="odyssee-root flex full-vh flex-1"
      style={{ position: "relative" }}
    >
      <div className="left-menu" style={{ width, height: "100%" }}>
        <section className="container-profil">
          <div className="flex">
            <Link
              to="/odyssee/settings"
              className="container-svg"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <Gear
                setDataTimeRotateGear={setDataTimeRotateGear}
                dataTimeRotateGear={dataTimeRotateGear}
              />
            </Link>
            {/* Avatar avec menu site-1 */}
            <SynapseUserMenu
              align="left"
              menuItems={[
                {
                  label: "⚙️ Paramètres",
                  onClick: () => navigate("/odyssee/settings"),
                },
              ]}
            />
          </div>
          {/* <div className="container-profil_status-profil">
            <p>Découverte</p>
          </div> */}
        </section>
        <section className="catalog-wrapper">
          <ul className="library-navBar">
            {categoryLibrary.map((item, index) => {
              const itemWidth = width * (item.width / 100);
              return (
                <li
                  key={"cat" + item.name + index}
                  style={{ width: `${itemWidth}px` }}
                >
                  <input
                    type="radio"
                    name="categoryLibrary"
                    id={item.name}
                    checked={item.name === selectedCategoryLibrary}
                    onChange={() => checkCategorySelected(item.name)}
                  />
                  <label htmlFor={item.name}>{item.name}</label>
                </li>
              );
            })}
          </ul>
          {selectedCategoryLibrary_old?.linkLibrary?.({
            onSelectFile: setSelectedFileData,
            availableHeight,
          }) || (
            <div className="catalog-container">
              {/* Sidebar catégories */}
              <div
                className="catalog-sidebar"
                onDragOver={(e) => {
                  if (!dragRef.current) return;
                  e.preventDefault();
                  setGhostIndex(sidebarItems.length);
                  setDropTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (ghostIndex !== null) handleDropBetween(ghostIndex);
                }}
              >
                {sidebarItems.map((item, index) => {
                  if (item.type === "folder") {
                    const folder = folders.find((f) => f._id === item.id);
                    if (!folder) return null;
                    const isDropOnFolder =
                      dropTarget?.action === "on" && dropTarget?.id === item.id;

                    const folderColor = folder.color || "#969696";
                    const folderBorderColor = darken(
                      folderColor,
                      DARKEN_BORDER,
                    );
                    const folderBgColor = darken(folderColor, DARKEN_BG);

                    return (
                      <Fragment key={item.id}>
                        {ghostIndex === index &&
                          !isGhostRedundant(index) &&
                          renderGhost()}
                        <div
                          className="catalog-sidebar__folder"
                          style={{
                            borderColor: isDropOnFolder
                              ? folderColor
                              : folderBorderColor,
                            background: folderBgColor,
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (
                              dragRef.current?.type === "category" &&
                              dragRef.current?.fromFolderId !== item.id
                            ) {
                              // Catégorie externe → ratio haut / milieu / bas
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const ratio =
                                (e.clientY - rect.top) / rect.height;
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
                                setDropTarget({
                                  action: "on",
                                  id: item.id,
                                  type: "folder",
                                });
                              }
                            } else if (
                              dragRef.current?.fromFolderId === item.id
                            ) {
                              // Catégorie interne → les icônes nested gèrent la position
                              setGhostIndex(null);
                              setDropTarget(null);
                            } else {
                              // Dossier → réordonnancement sidebar
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const ratio =
                                (e.clientY - rect.top) / rect.height;
                              setNestedGhost(null);
                              setGhostIndex(ratio < 0.5 ? index : index + 1);
                              setDropTarget(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (
                              dropTarget?.action === "on" &&
                              dropTarget?.id === item.id
                            ) {
                              handleDropOnItem(e, {
                                type: "folder",
                                id: item.id,
                              });
                            } else if (nestedGhost?.folderId === item.id) {
                              handleReorderInFolder(item.id);
                            } else if (ghostIndex !== null) {
                              handleDropBetween(ghostIndex);
                            }
                          }}
                        >
                          <div
                            className="catalog-sidebar__icon catalog-sidebar__icon--folder"
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(e, {
                                type: "folder",
                                id: item.id,
                                fromFolderId: null,
                              })
                            }
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) =>
                              handleFolderContextMenu(e, item.id)
                            }
                            onMouseEnter={(e) =>
                              handleTooltipEnter(e, "folder", item.id)
                            }
                            onMouseLeave={handleTooltipLeave}
                            onClick={() => toggleFolder(item.id)}
                          >
                            <IconDossierFull size={22} color={folderColor} />
                          </div>
                          {folder.isOpen && (
                            <div className="catalog-sidebar__folder-children">
                              {folder.categoryIds.map((catId, nestedIdx) => {
                                const cat = categories.find(
                                  (c) => c._id === catId,
                                );
                                if (!cat) return null;
                                return (
                                  <Fragment key={catId}>
                                    {nestedGhost?.folderId === item.id &&
                                      nestedGhost.index === nestedIdx && (
                                        <div className="catalog-sidebar__icon catalog-sidebar__icon--nested catalog-sidebar__icon--ghost" />
                                      )}
                                    <div
                                      className={`catalog-sidebar__icon catalog-sidebar__icon--nested${cat.active ? " active" : ""}`}
                                      style={
                                        cat.image
                                          ? { background: "transparent" }
                                          : {
                                              background: darken(
                                                folderColor,
                                                DARKEN_BORDER,
                                              ),
                                            }
                                      }
                                      draggable
                                      onDragStart={(e) =>
                                        handleDragStart(e, {
                                          type: "category",
                                          id: catId,
                                          fromFolderId: item.id,
                                        })
                                      }
                                      onDragOver={(e) => {
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
                                        const rect =
                                          e.currentTarget.getBoundingClientRect();
                                        const ratio =
                                          (e.clientY - rect.top) / rect.height;
                                        setNestedGhost({
                                          folderId: item.id,
                                          index:
                                            ratio < 0.5
                                              ? nestedIdx
                                              : nestedIdx + 1,
                                        });
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        const drag = dragRef.current;
                                        if (drag?.fromFolderId !== item.id)
                                          return; // Externe → remonte au dossier
                                        e.stopPropagation();
                                        handleReorderInFolder(item.id);
                                      }}
                                      onDragEnd={handleDragEnd}
                                      onMouseEnter={(e) =>
                                        handleTooltipEnter(e, "category", catId)
                                      }
                                      onMouseLeave={handleTooltipLeave}
                                      onClick={() =>
                                        handleCategorySelect(catId)
                                      }
                                    >
                                      {cat.image ? (
                                        <img src={cat.image} alt={cat.name} />
                                      ) : (
                                        getInitials(cat.name)
                                      )}
                                    </div>
                                  </Fragment>
                                );
                              })}
                              {nestedGhost?.folderId === item.id &&
                                nestedGhost.index ===
                                  folder.categoryIds.length && (
                                  <div className="catalog-sidebar__icon catalog-sidebar__icon--nested catalog-sidebar__icon--ghost" />
                                )}
                            </div>
                          )}
                        </div>
                      </Fragment>
                    );
                  }

                  // item.type === "category"
                  const cat = categories.find((c) => c._id === item.id);
                  if (!cat) return null;
                  const isDropOnCat =
                    dropTarget?.action === "on" && dropTarget?.id === item.id;

                  return (
                    <Fragment key={item.id}>
                      {ghostIndex === index &&
                        !isGhostRedundant(index) &&
                        renderGhost()}
                      <div
                        className={`catalog-sidebar__icon${cat.active ? " active" : ""}${isDropOnCat ? " drop-target" : ""}`}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, {
                            type: "category",
                            id: item.id,
                            fromFolderId: null,
                          })
                        }
                        onDragOver={(e) => {
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
                              setDropTarget({
                                action: "on",
                                id: item.id,
                                type: "category",
                              });
                            }
                          } else {
                            setGhostIndex(ratio < 0.5 ? index : index + 1);
                            setDropTarget(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            dropTarget?.action === "on" &&
                            dropTarget?.id === item.id
                          ) {
                            handleDropOnItem(e, {
                              type: "category",
                              id: item.id,
                            });
                          } else if (ghostIndex !== null) {
                            handleDropBetween(ghostIndex);
                          }
                        }}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={(e) =>
                          handleTooltipEnter(e, "category", item.id)
                        }
                        onMouseLeave={handleTooltipLeave}
                        onClick={() => handleCategorySelect(item.id)}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} />
                        ) : (
                          getInitials(cat.name)
                        )}
                      </div>
                    </Fragment>
                  );
                })}

                {ghostIndex === sidebarItems.length &&
                  !isGhostRedundant(sidebarItems.length) &&
                  renderGhost()}

                <div
                  className="catalog-sidebar__add"
                  onClick={() => setShowCategoryModal(true)}
                >
                  +
                </div>
              </div>

              {/* Zone produits */}
              <div className="catalog-main">
                {(() => {
                  const selectedCat = categories.find(
                    (c) => c._id === selectedCategory,
                  );
                  const currentProducts = selectedCat?.products || [];
                  const defaultProductData = {
                    productName: "",
                    aliasName: { activate: false, name: "" },
                    img: [],
                    treatmentDuration: 1,
                    amountToAdminister: 1,
                    intakeTime: { advancedMode: false, daysTime: [] },
                  };

                  return (
                    <>
                      <div className="catalog-main__header">
                        <h4>
                          {selectedCat
                            ? selectedCat.name
                            : "Sélectionnez une librairie"}
                        </h4>
                        <div className="catalog-main__meta">
                          {selectedCat && (
                            <div
                              className="catalog-main__add"
                              title="Nouveau produit"
                              onClick={() => {
                                setSelectedFileData(defaultProductData);
                                setEditMode(false);
                              }}
                            >
                              +
                            </div>
                          )}
                        </div>
                      </div>

                      {currentProducts.length === 0 ? (
                        <div className="catalog-empty">
                          <div className="catalog-empty__icon">📦</div>
                          <div className="catalog-empty__title">
                            Aucun produit dans cette librairie
                          </div>
                          <div className="catalog-empty__hint">
                            Cliquez sur le bouton + pour créer votre premier
                            produit
                          </div>
                        </div>
                      ) : (
                        <div className="catalog-grid">
                          {currentProducts.map((product, i) => (
                            <div
                              key={i}
                              className="catalog-card"
                              onClick={() => handleSelectProduct(product)}
                            >
                              <div className="catalog-card__image">
                                {product.img?.[0] ? (
                                  <img
                                    src={product.img[0]}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.parentElement.innerHTML = "📦";
                                    }}
                                  />
                                ) : (
                                  "📦"
                                )}
                              </div>
                              <div className="catalog-card__info">
                                <h5 className="catalog-card__name">
                                  {product.name ||
                                    product.contentFilesData?.productName ||
                                    "Produit"}
                                </h5>
                                {product.tooltips && (
                                  <p className="catalog-card__tooltip">
                                    {product.tooltips}
                                  </p>
                                )}
                              </div>
                              <div className="catalog-card__toolbar">
                                <button
                                  type="button"
                                  className="catalog-card__toolbar-btn catalog-card__toolbar-btn--edit"
                                  title="Modifier"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProduct(product);
                                  }}
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="catalog-card__toolbar-btn catalog-card__toolbar-btn--delete"
                                  title="Supprimer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({
                                      open: true,
                                      productId: product._id,
                                      productName: product.name || "ce produit",
                                    });
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </section>
      </div>
      {selectedFileData && (
        <PaperProduct
          key={selectedFileData._id || "new"}
          contentFilesData={selectedFileData}
          categoryId={selectedCategory}
          onProductCreated={handleProductCreated}
          editMode={editMode}
        />
      )}

      {/* Modal de création de catégorie (overlay géré par CategoryForm) */}
      {showCategoryModal && (
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.open}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.productName}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDeleteProduct}
        onCancel={() =>
          setDeleteModal({ open: false, productId: null, productName: "" })
        }
      />

      {/* Tooltip sidebar */}
      {tooltip &&
        (() => {
          if (tooltip.type === "category") {
            const cat = categories.find((c) => c._id === tooltip.id);
            if (!cat) return null;
            return (
              <div className="sidebar-tooltip" style={{ top: tooltip.top }}>
                <span className="sidebar-tooltip__name">{cat.name}</span>
              </div>
            );
          }
          if (tooltip.type === "folder") {
            const folder = folders.find((f) => f._id === tooltip.id);
            if (!folder) return null;
            if (folder.name) {
              return (
                <div className="sidebar-tooltip" style={{ top: tooltip.top }}>
                  <span className="sidebar-tooltip__name">{folder.name}</span>
                </div>
              );
            }
            const catNames = folder.categoryIds
              .map((id) => categories.find((c) => c._id === id)?.name)
              .filter(Boolean);
            return (
              <div className="sidebar-tooltip" style={{ top: tooltip.top }}>
                <ul className="sidebar-tooltip__list">
                  {catNames.slice(0, 5).map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                  {catNames.length > 5 && <li>…</li>}
                </ul>
              </div>
            );
          }
          return null;
        })()}

      {/* Menu contextuel dossier */}
      {contextMenu && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          allClosed={folders.every((f) => !f.isOpen)}
          onSettings={() => setFolderSettingsModal(contextMenu.folderId)}
          onToggleAll={handleToggleAllFolders}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Modal paramètres dossier */}
      {folderSettingsModal &&
        (() => {
          const folder = folders.find((f) => f._id === folderSettingsModal);
          if (!folder) return null;
          return (
            <FolderSettingsModal
              folder={folder}
              onSave={handleSaveFolderSettings}
              onCancel={() => setFolderSettingsModal(null)}
            />
          );
        })()}
    </div>
  );
};

export default Dashboard;
