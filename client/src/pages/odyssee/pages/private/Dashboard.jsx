import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary } from "../../utils/variable";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import Gear from "../../assets/gear";
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

  // Initiales du nom de catégorie (ex: "la catégorie" → "lc")
  const getInitials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .slice(0, 3);

  const enrichCategory = (cat) => ({ ...cat, active: false, products: [] });

  // Chargement des catégories au montage
  useEffect(() => {
    const loadCategories = async () => {
      const result = await OdysseeCategoryService.getUserCategories();
      if (result.success && result.categories.length > 0) {
        const enriched = result.categories.map(enrichCategory);
        enriched[0].active = true;
        setCategories(enriched);
        setSelectedCategory(enriched[0]._id);
      }
    };
    loadCategories();
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
      setCategories((prev) => [...prev, enrichCategory(result.category)]);
    }
    setShowCategoryModal(false);
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
              <div className="catalog-sidebar">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className={`catalog-sidebar__icon${category.active ? " active" : ""}`}
                    onClick={() => handleCategorySelect(category._id)}
                  >
                    {getInitials(category.name)}
                  </div>
                ))}
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
                            <span className="catalog-main__count">
                              {currentProducts.length} produit
                              {currentProducts.length !== 1 ? "s" : ""}
                            </span>
                          )}
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
    </div>
  );
};

export default Dashboard;
