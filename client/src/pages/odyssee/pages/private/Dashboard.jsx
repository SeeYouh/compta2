import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CatalogMain from "../../components/CatalogMain";
import CatalogSidebar from "../../components/CatalogSidebar";
import CategoryContextMenu from "../../components/CategoryContextMenu";
import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary } from "../../utils/variable";
import CategorySettings from "../../components/CategorySettings";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import FolderContextMenu from "../../components/FolderContextMenu";
import FolderService from "../../services/folderService";
import FolderSettingsModal from "../../components/FolderSettingsModal";
import Gear from "../../assets/gear";
import OdysseeCategoryService from "../../../../services/odysseeCategoryService";
import OdysseeProductService from "../../../../services/odysseeProductService";
import PaperProduct from "../../components/PaperProduct";
import ProductFolderService from "../../../../services/productFolderService";
import ProductService from "../../services/productService";
import SidebarTooltip from "../../components/SidebarTooltip";
import SynapseUserMenu from "../../../../components/SynapseUserMenu";
import { useSidebarDnd } from "../../hooks/useSidebarDnd";

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

  // Dossiers de produits dans le catalogue
  const [productFolders, setProductFolders] = useState([]);
  const [editFolderModal, setEditFolderModal] = useState(null); // { folderId } ou null
  const [deleteFolderProductModal, setDeleteFolderProductModal] =
    useState(null); // { folderId, folderName } ou null

  // Drag & drop
  const dnd = useSidebarDnd({
    sidebarItems,
    setSidebarItems,
    folders,
    setFolders,
  });

  // UI flottante
  const [tooltip, setTooltip] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [folderSettingsModal, setFolderSettingsModal] = useState(null);
  const [categoryContextMenu, setCategoryContextMenu] = useState(null);
  const [folderOpenStates, setFolderOpenStates] = useState({});
  const [categorySettingsId, setCategorySettingsId] = useState(null);
  const [deleteCategoryFlow, setDeleteCategoryFlow] = useState(null);
  // deleteCategoryFlow phases :
  // { phase: 'confirm', categoryId, categoryName, products: [], confirmAll: false }
  // { phase: 'products', categoryId, categoryName, products: [], pendingIndex: 0 }

  const enrichCategory = (cat) => ({ ...cat, active: false, products: [] });

  // Chargement initial : catégories + layout sidebar
  useEffect(() => {
    const init = async () => {
      const [catResult, sidebarResult] = await Promise.all([
        OdysseeCategoryService.getUserCategories(),
        FolderService.getSidebar(),
      ]);

      if (catResult.success && catResult.categories.length > 0) {
        const enriched = catResult.categories.map(enrichCategory);
        enriched[0].active = true;
        setCategories(enriched);
        setSelectedCategory(enriched[0]._id);
      }

      if (sidebarResult.success) {
        const existingCatIds = new Set(
          (catResult.success ? catResult.categories : []).map((c) => c._id),
        );

        // Dossiers vides ou dont tous les categoryIds sont des catégories supprimées
        const ghostFolders = sidebarResult.folders.filter((f) =>
          f.categoryIds.every((id) => !existingCatIds.has(id)),
        );

        if (ghostFolders.length > 0) {
          await Promise.all(
            ghostFolders.map((f) => FolderService.deleteFolder(f._id)),
          );
        }

        const ghostIds = new Set(ghostFolders.map((f) => f._id));

        // Dossiers partiellement orphelins : purger les catIds supprimées
        const partialFolders = sidebarResult.folders.filter(
          (f) =>
            !ghostIds.has(f._id) &&
            f.categoryIds.some((id) => !existingCatIds.has(id)),
        );
        await Promise.all(
          partialFolders.map((f) =>
            FolderService.updateFolder(f._id, {
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
                  categoryIds: f.categoryIds.filter((id) =>
                    existingCatIds.has(id),
                  ),
                }
              : f,
          );

        const cleanLayout = sidebarResult.layout.filter(
          (i) => !(i.type === "folder" && ghostIds.has(i.id)),
        );

        setFolders(cleanFolders);
        if (cleanLayout.length > 0) {
          setSidebarItems(cleanLayout);
          if (ghostFolders.length > 0) FolderService.updateLayout(cleanLayout);
        } else if (sidebarResult.layout.length === 0) {
          setSidebarItems([]);
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
      setProductFolders((prev) => {
        const other = prev.filter(
          (f) => String(f.categoryId) !== String(categoryId),
        );
        return [...other, ...(result.folders || [])];
      });
    }
  };

  const handleProductCreated = () => {
    if (selectedCategory) loadProducts(selectedCategory);
    setSelectedFileData(null);
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

  // Création d'une catégorie via API
  const handleCreateCategory = async (categoryData) => {
    const result = await OdysseeCategoryService.createCategory(categoryData);
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

  // ── Tooltip ──────────────────────────────────────────────────────────────────

  const handleTooltipEnter = (e, type, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type, id, top: rect.top + rect.height / 2 });
  };

  const handleTooltipLeave = () => setTooltip(null);

  // ── Menu contextuel + paramètres catégorie ───────────────────────────────────

  const handleCategoryContextMenu = (e, categoryId) => {
    setCategoryContextMenu({ categoryId, x: e.clientX, y: e.clientY });
  };
  const relevantFolders = productFolders.filter(
    (f) => String(f.categoryId) === String(selectedCategory),
  );
  const allProductFoldersClosed =
    relevantFolders.length > 0 &&
    relevantFolders.every((f) => folderOpenStates[String(f._id)] === false);

  const toggleAllProductFolders = () => {
    setFolderOpenStates((prev) => {
      const updated = { ...prev };
      if (allProductFoldersClosed) {
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
  };

  const toggleProductFolder = (folderId) =>
    setFolderOpenStates((prev) => ({
      ...prev,
      [String(folderId)]: prev[String(folderId)] !== false ? false : true,
    }));
  // ── Dossiers de produits ─────────────────────────────────────────────────────

  const handleCreateProductFolder = async (
    categoryId,
    parentFolderId = null,
  ) => {
    const result = await ProductFolderService.createFolder({
      categoryId,
      parentFolderId: parentFolderId || null,
    });
    if (result.success) {
      setProductFolders((prev) => [...prev, result.folder]);
    }
    setCategoryContextMenu(null);
  };

  const handleSaveProductFolderEdit = async ({ name, color }) => {
    const folderId = editFolderModal?.folderId;
    if (!folderId) return;
    const result = await ProductFolderService.updateFolder(folderId, {
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
    }
    setEditFolderModal(null);
  };

  const handleConfirmDeleteProductFolder = async () => {
    const folderId = deleteFolderProductModal?.folderId;
    if (!folderId) return;
    const result = await ProductFolderService.deleteFolder(folderId);
    if (result.success) {
      setProductFolders((prev) => prev.filter((f) => f._id !== folderId));
      if (selectedCategory) loadProducts(selectedCategory);
    }
    setDeleteFolderProductModal(null);
  };

  const handleMoveProductToFolder = async (productId, folderId) => {
    const result = await OdysseeProductService.updateProduct(productId, {
      folderId: folderId || null,
    });
    if (result.success && selectedCategory) loadProducts(selectedCategory);
  };

  const handleGroupProducts = async (draggedId, targetId) => {
    const folderResult = await ProductFolderService.createFolder({
      categoryId: selectedCategory,
    });
    if (!folderResult.success) return;
    const folderId = folderResult.folder._id;
    await Promise.all([
      OdysseeProductService.updateProduct(draggedId, { folderId }),
      OdysseeProductService.updateProduct(targetId, { folderId }),
    ]);
    setProductFolders((prev) => [...prev, folderResult.folder]);
    if (selectedCategory) loadProducts(selectedCategory);
  };

  const handleReorderFolders = async (folderIds) => {
    // Mise à jour optimiste
    setProductFolders((prev) => {
      const ordered = folderIds
        .map((id) => prev.find((f) => String(f._id) === String(id)))
        .filter(Boolean)
        .map((f, i) => ({ ...f, order: i }));
      const others = prev.filter(
        (f) => !folderIds.some((id) => String(id) === String(f._id)),
      );
      return [...ordered, ...others];
    });
    await ProductFolderService.reorderFolders(folderIds);
  };

  const handleOpenDeleteCategory = async (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    const result =
      await OdysseeProductService.getProductsByCategory(categoryId);
    const products = result.success ? result.products : [];
    setDeleteCategoryFlow({
      phase: "confirm",
      categoryId,
      categoryName: cat?.name || "cette librairie",
      products,
      confirmAll: false,
    });
  };

  const executeDeleteCategory = async (categoryId) => {
    const result = await OdysseeCategoryService.deleteCategory(categoryId);
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
          // Dernier élément du dossier : supprimer le dossier aussi
          FolderService.deleteFolder(parentFolder._id);
          setFolders((prev) => prev.filter((f) => f._id !== parentFolder._id));
          setSidebarItems((prev) => {
            const newItems = prev.filter((i) => i.id !== parentFolder._id);
            FolderService.updateLayout(newItems);
            return newItems;
          });
        } else {
          FolderService.updateFolder(parentFolder._id, {
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
          FolderService.updateLayout(newItems);
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
    const { categoryId, products, confirmAll } = deleteCategoryFlow;
    if (products.length === 0 || confirmAll) {
      executeDeleteCategory(categoryId);
    } else {
      setDeleteCategoryFlow((prev) => ({
        ...prev,
        phase: "products",
        pendingIndex: 0,
      }));
    }
  };

  const handleConfirmProduct = () => {
    const { categoryId, products, pendingIndex } = deleteCategoryFlow;
    if (pendingIndex < products.length - 1) {
      setDeleteCategoryFlow((prev) => ({
        ...prev,
        pendingIndex: prev.pendingIndex + 1,
      }));
    } else {
      executeDeleteCategory(categoryId);
    }
  };

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

  return (
    <div className="odyssee-root" style={{ position: "relative" }}>
      <nav className="odyssee-navbar">
        <div className="odyssee-navbar__actions">
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
          <SynapseUserMenu
            align="right"
            menuItems={[
              {
                label: "⚙️ Paramètres",
                onClick: () => navigate("/odyssee/settings"),
              },
            ]}
          />
        </div>
      </nav>
      <div className="odyssee-body">
        <div className="left-menu" style={{ width }}>
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
                <CatalogSidebar
                  sidebarItems={sidebarItems}
                  folders={folders}
                  categories={categories}
                  selectedCategoryId={selectedCategory}
                  dnd={dnd}
                  onCategorySelect={handleCategorySelect}
                  onCategoryContextMenu={handleCategoryContextMenu}
                  onToggleFolder={toggleFolder}
                  onFolderContextMenu={handleFolderContextMenu}
                  onAddCategory={() => setShowCategoryModal(true)}
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipLeave={handleTooltipLeave}
                />
                <CatalogMain
                  selectedCat={categories.find(
                    (c) => c._id === selectedCategory,
                  )}
                  productFolders={productFolders}
                  selectedProductId={selectedFileData?._id}
                  onAdd={() => {
                    setSelectedFileData({
                      productName: "",
                      aliasName: { activate: false, name: "" },
                      img: [],
                      treatmentDuration: 1,
                      amountToAdminister: 1,
                      intakeTime: { advancedMode: false, daysTime: [] },
                    });
                    setEditMode(false);
                  }}
                  onSelect={handleSelectProduct}
                  onEdit={handleEditProduct}
                  onDelete={(product) =>
                    setDeleteModal({
                      open: true,
                      productId: product._id,
                      productName: product.name || "ce produit",
                    })
                  }
                  onCreateFolder={() =>
                    handleCreateProductFolder(selectedCategory)
                  }
                  onCreateProductInFolder={(folderId) => {
                    setSelectedFileData({
                      productName: "",
                      aliasName: { activate: false, name: "" },
                      img: [],
                      treatmentDuration: 1,
                      amountToAdminister: 1,
                      intakeTime: { advancedMode: false, daysTime: [] },
                      folderId,
                    });
                    setEditMode(false);
                  }}
                  onRenameFolder={(folderId) =>
                    setEditFolderModal({ folderId })
                  }
                  onDeleteFolder={(folderId) => {
                    const folder = productFolders.find(
                      (f) => f._id === folderId,
                    );
                    setDeleteFolderProductModal({
                      folderId,
                      folderName: folder?.name || "ce dossier",
                    });
                  }}
                  onMoveProductToFolder={handleMoveProductToFolder}
                  onGroupProducts={handleGroupProducts}
                  onReorderFolders={handleReorderFolders}
                  onCategoryContextMenu={handleCategoryContextMenu}
                  folderOpenStates={folderOpenStates}
                  onToggleFolder={toggleProductFolder}
                  allFoldersClosed={allProductFoldersClosed}
                  onToggleAllFolders={toggleAllProductFolders}
                />
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
      </div>

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

      <SidebarTooltip
        tooltip={tooltip}
        categories={categories}
        folders={folders}
      />

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

      {/* Modal paramètres catégorie */}
      {categorySettingsId &&
        (() => {
          const cat = categories.find((c) => c._id === categorySettingsId);
          if (!cat) return null;
          return (
            <CategorySettings
              category={cat}
              onClose={() => setCategorySettingsId(null)}
            />
          );
        })()}

      {/* Menu contextuel catégorie */}
      {categoryContextMenu && (
        <CategoryContextMenu
          x={categoryContextMenu.x}
          y={categoryContextMenu.y}
          onSettings={() =>
            setCategorySettingsId(categoryContextMenu.categoryId)
          }
          onDelete={() => {
            handleOpenDeleteCategory(categoryContextMenu.categoryId);
          }}
          onCreateFolder={() =>
            handleCreateProductFolder(categoryContextMenu.categoryId)
          }
          onCreateProduct={() => {
            setSelectedFileData({
              productName: "",
              aliasName: { activate: false, name: "" },
              img: [],
              treatmentDuration: 1,
              amountToAdminister: 1,
              intakeTime: { advancedMode: false, daysTime: [] },
            });
            setEditMode(false);
            setCategoryContextMenu(null);
          }}
          allFoldersClosed={allProductFoldersClosed}
          onToggleAllFolders={toggleAllProductFolders}
          onClose={() => setCategoryContextMenu(null)}
        />
      )}

      {/* Modal édition dossier produit */}
      {editFolderModal &&
        (() => {
          const folder = productFolders.find(
            (f) => f._id === editFolderModal.folderId,
          );
          if (!folder) return null;
          return (
            <FolderSettingsModal
              folder={folder}
              onSave={handleSaveProductFolderEdit}
              onCancel={() => setEditFolderModal(null)}
            />
          );
        })()}

      {/* Confirmation suppression dossier produit */}
      {deleteFolderProductModal && (
        <ConfirmationModal
          isOpen
          title="Supprimer le dossier"
          message={
            <>
              Supprimer &ldquo;{deleteFolderProductModal.folderName}&rdquo; ?{" "}
              <span>Les produits du dossier seront désactivés.</span>
            </>
          }
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleConfirmDeleteProductFolder}
          onCancel={() => setDeleteFolderProductModal(null)}
        />
      )}

      {/* Phase 1 : confirmation suppression catégorie */}
      {deleteCategoryFlow?.phase === "confirm" && (
        <ConfirmationModal
          isOpen
          title="Supprimer la librairie"
          message={
            <>
              Supprimer &ldquo;{deleteCategoryFlow.categoryName}&rdquo; ?{" "}
              <span>Cette action est irréversible.</span>
            </>
          }
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleConfirmDeleteCategory}
          onCancel={() => setDeleteCategoryFlow(null)}
          softDanger
          toggleLabel={
            deleteCategoryFlow.products.length > 0
              ? "Cela supprimera son contenu"
              : null
          }
          toggleChecked={deleteCategoryFlow.confirmAll}
          onToggleChange={(checked) =>
            setDeleteCategoryFlow((prev) => ({ ...prev, confirmAll: checked }))
          }
        />
      )}

      {/* Phase 2 : confirmation produit par produit */}
      {deleteCategoryFlow?.phase === "products" && (
        <ConfirmationModal
          isOpen
          title={`Produit ${deleteCategoryFlow.pendingIndex + 1} / ${deleteCategoryFlow.products.length}`}
          message={`Supprimer "${deleteCategoryFlow.products[deleteCategoryFlow.pendingIndex]?.name || "ce produit"}" ?`}
          confirmText="Supprimer"
          cancelText="Tout annuler"
          onConfirm={handleConfirmProduct}
          onCancel={() => setDeleteCategoryFlow(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
