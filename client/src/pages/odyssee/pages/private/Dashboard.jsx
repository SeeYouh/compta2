import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CatalogMain from "../../components/CatalogMain";
import CatalogSidebar from "../../components/CatalogSidebar";
import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary } from "../../utils/variable";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import FolderContextMenu from "../../components/FolderContextMenu";
import FolderService from "../../services/folderService";
import FolderSettingsModal from "../../components/FolderSettingsModal";
import Gear from "../../assets/gear";
import OdysseeCategoryService from "../../../../services/odysseeCategoryService";
import OdysseeProductService from "../../../../services/odysseeProductService";
import PaperProduct from "../../components/PaperProduct";
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
        setFolders(sidebarResult.folders);
        if (sidebarResult.layout.length > 0) {
          setSidebarItems(sidebarResult.layout);
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
              <CatalogSidebar
                sidebarItems={sidebarItems}
                folders={folders}
                categories={categories}
                dnd={dnd}
                onCategorySelect={handleCategorySelect}
                onToggleFolder={toggleFolder}
                onFolderContextMenu={handleFolderContextMenu}
                onAddCategory={() => setShowCategoryModal(true)}
                onTooltipEnter={handleTooltipEnter}
                onTooltipLeave={handleTooltipLeave}
              />
              <CatalogMain
                selectedCat={categories.find((c) => c._id === selectedCategory)}
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
    </div>
  );
};

export default Dashboard;
