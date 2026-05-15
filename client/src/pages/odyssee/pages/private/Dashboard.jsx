import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary, contentLibraryTitle } from "../../utils/variable";
import Gear from "../../assets/gear";
import PaperProduct from "../../components/PaperProduct";
import SynapseUserMenu from "../../../../components/SynapseUserMenu";

const Dashboard = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(400);
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

  // État des librairies (initialisé depuis les données JSON locales)
  const [categories, setCategories] = useState(() =>
    contentLibraryTitle.map((lib, i) => ({
      id: i + 1,
      icon: ["📁", "📂", "🗂️", "📋", "📊", "💼"][i] || "📁",
      color:
        ["#3498db", "#f39c12", "#e74c3c", "#9b59b6", "#1abc9c", "#e67e22"][i] ||
        "#3498db",
      name: lib.titleName,
      active: i === 0,
      products: lib.contentFiles || [],
    })),
  );
  const [selectedCategory, setSelectedCategory] = useState(1);

  // Fonction de création de catégorie
  const handleCreateCategory = (categoryData) => {
    const newCategory = { id: Date.now(), ...categoryData, active: false };
    setCategories((prev) => [...prev, newCategory]);
    setShowCategoryModal(false);
  };

  // Fonctions pour les catégories
  const handleCategorySelect = (categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        active: cat.id === categoryId,
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
    <div className="flex full-vh flex-1" style={{ position: "relative" }}>
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
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
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
          <section>
            <CategoryForm />
          </section>
          {selectedCategoryLibrary_old?.linkLibrary?.({
            onSelectFile: setSelectedFileData,
            availableHeight,
          }) || (
            // Interface hiérarchique (Libraries → Folders → Products)
            <div
              style={{
                display: "flex",
                flex: 1,
                overflowY: "auto",
                background: "#f5f6fa",
              }}
            >
              {/* Sidebar catégories (très à gauche) */}
              <div
                style={{
                  width: "60px",
                  background: "#2c3e50",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px 0",
                  position: "relative",
                }}
              >
                {/* Categories avec icônes */}
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    style={{
                      width: "40px",
                      height: "40px",
                      background: category.active
                        ? category.color
                        : "transparent",
                      border: category.active
                        ? "none"
                        : `2px solid ${category.color}`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "8px 0",
                      cursor: "pointer",
                      fontSize: "20px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!category.active) {
                        e.currentTarget.style.background = category.color;
                        e.currentTarget.style.border = "none";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!category.active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.border = `2px solid ${category.color}`;
                      }
                    }}
                  >
                    {category.icon}
                  </div>
                ))}

                {/* Bouton + en bas */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    width: "40px",
                    height: "40px",
                    background: "#27ae60",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "24px",
                    color: "white",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() => setShowCategoryModal(true)}
                >
                  +
                </div>
              </div>

              {/* Zone principale - Grille des produits */}
              <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                {(() => {
                  const selectedCat = categories.find(
                    (c) => c.id === selectedCategory,
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
                      {/* En-tête zone produits */}
                      <div
                        style={{
                          marginBottom: "20px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h4 style={{ margin: 0, color: "#2c3e50" }}>
                          {selectedCat
                            ? selectedCat.name
                            : "Sélectionnez une librairie"}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {selectedCat && (
                            <span
                              style={{ color: "#7f8c8d", fontSize: "14px" }}
                            >
                              {currentProducts.length} produit
                              {currentProducts.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {selectedCat && (
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                background: "#27ae60",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                fontSize: "22px",
                                color: "white",
                                boxShadow: "0 2px 8px rgba(39,174,96,0.35)",
                                transition: "transform 0.15s",
                                userSelect: "none",
                              }}
                              title="Nouveau produit"
                              onClick={() =>
                                setSelectedFileData(defaultProductData)
                              }
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.12)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            >
                              +
                            </div>
                          )}
                        </div>
                      </div>

                      {currentProducts.length === 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "300px",
                            color: "#7f8c8d",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "48px",
                              marginBottom: "16px",
                            }}
                          >
                            📦
                          </div>
                          <div
                            style={{ fontSize: "16px", marginBottom: "8px" }}
                          >
                            Aucun produit dans cette librairie
                          </div>
                          <div style={{ fontSize: "14px" }}>
                            Cliquez sur le bouton + pour créer votre premier
                            produit
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: "16px",
                          }}
                        >
                          {currentProducts.map((product, i) => (
                            <div
                              key={i}
                              style={{
                                background: "white",
                                borderRadius: "12px",
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                transition:
                                  "transform 0.2s ease, box-shadow 0.2s ease",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setSelectedFileData(
                                  product.contentFilesData || product,
                                )
                              }
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-4px)";
                                e.currentTarget.style.boxShadow =
                                  "0 6px 16px rgba(0,0,0,0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(0,0,0,0.1)";
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "110px",
                                  background: "#ecf0f1",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "36px",
                                  color: "#bdc3c7",
                                  overflow: "hidden",
                                }}
                              >
                                {product.img ? (
                                  <img
                                    src={product.img}
                                    alt={product.name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.parentElement.innerHTML = "📦";
                                    }}
                                  />
                                ) : (
                                  "📦"
                                )}
                              </div>
                              <div style={{ padding: "10px 12px" }}>
                                <h5
                                  style={{
                                    margin: "0 0 3px 0",
                                    color: "#2c3e50",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {product.name ||
                                    product.contentFilesData?.productName ||
                                    "Produit"}
                                </h5>
                                {product.tooltips && (
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#7f8c8d",
                                      fontSize: "11px",
                                      lineHeight: "1.4",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {product.tooltips}
                                  </p>
                                )}
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
      {selectedFileData && <PaperProduct contentFilesData={selectedFileData} />}

      {/* Modal de création de catégorie */}
      {showCategoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "30px",
              width: "400px",
              maxWidth: "90vw",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "#2c3e50" }}>
              Créer une nouvelle catégorie
            </h3>

            <CategoryForm
              onSubmit={handleCreateCategory}
              onCancel={() => setShowCategoryModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
