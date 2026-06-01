import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CatalogContent from "../../components/CatalogContent";
import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary } from "../../utils/variable";
import FolderService from "../../services/folderService";
import Gear from "../../assets/gear";
import IconCompactMenu from "../../assets/IconCompactMenu";
import IconLibrary from "../../assets/IconLibrary";
import IconOdyssee from "../../assets/IconOdyssee";
import IconPassager from "../../assets/IconPassager";
import OdysseeCategoryService from "../../../../services/odysseeCategoryService";
import OdysseeItem from "../../components/OdysseeItem";
import OdysseeProductService from "../../../../services/odysseeProductService";
import {
  odysseyCategoryService,
  odysseyItemDeleteService,
  odysseyItemFolderService,
  odysseyItemService,
  odysseySidebarService,
} from "../../services/odysseyServices";
import PaperProduct from "../../components/PaperProduct";
import PassagerItem from "../../components/PassagerItem";
import {
  passengersCategoryService,
  passengersItemDeleteService,
  passengersItemFolderService,
  passengersItemService,
  passengersSidebarService,
} from "../../services/passengersServices";
import ProductFolderService from "../../../../services/productFolderService";
import ProductService from "../../services/productService";
import SynapseUserMenu from "../../../../components/SynapseUserMenu";
import useCatalogEngine from "../../hooks/useCatalogEngine";

const getTabIcon = (name) => {
  switch (name) {
    case "Passagers":
      return <IconPassager size={16} />;
    case "Odyssée":
      return <IconOdyssee size={16} />;
    case "Catalogues":
      return (
        <IconLibrary
          colorBooks="currentColor"
          colorPlus="currentColor"
          height={16}
        />
      );
    default:
      return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem("odyssee-sidebar-width");
    return saved ? parseInt(saved, 10) : 400;
  });
  const [isCompact, setIsCompact] = useState(
    () => localStorage.getItem("odyssee-compact-mode") === "true",
  );
  const [tabTooltip, setTabTooltip] = useState(null);
  const [selectedCategoryLibrary, setSelectedCategoryLibrary] = useState(
    () =>
      localStorage.getItem("odyssee-selected-library") ??
      categoryLibrary[2].name,
  );

  const toggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      localStorage.setItem("odyssee-compact-mode", String(next));
      return next;
    });
  };

  const checkCategorySelected = (radioId) => {
    setSelectedCategoryLibrary((selected) => {
      const next = selected === radioId ? categoryLibrary[0].name : radioId;
      localStorage.setItem("odyssee-selected-library", next);
      return next;
    });
  };

  const [dataTimeRotateGear, setDataTimeRotateGear] = useState({
    timeRotateGear: 5,
    numberTeethGear: 7,
    numberTeethGear2: 9,
    numberTeethGear3: 10,
  });

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

  const passengersEngine = useCatalogEngine({
    categoryService: passengersCategoryService,
    itemService: passengersItemService,
    itemDeleteService: passengersItemDeleteService,
    sidebarFolderService: passengersSidebarService,
    itemFolderService: passengersItemFolderService,
    transformItemForEdit: (item) => ({
      ...item.contentFilesData,
      _id: item._id,
      color: item.color,
    }),
    newItemTemplate: (folderId) => ({
      firstName: "",
      lastName: "",
      alias: "",
      gender: "NC",
      birthDate: null,
      avatar: null,
      contact: { phone: "", email: "", socialNetworks: [] },
      address: {
        country: "FR",
        postalCode: "",
        city: "",
        address: "",
        addressComplement: "",
      },
      infoSupp: [],
      ...(folderId ? { folderId } : {}),
    }),
  });

  const odysseeEngine = useCatalogEngine({
    categoryService: odysseyCategoryService,
    itemService: odysseyItemService,
    itemDeleteService: odysseyItemDeleteService,
    sidebarFolderService: odysseySidebarService,
    itemFolderService: odysseyItemFolderService,
    transformItemForEdit: (item) => ({
      ...item.contentFilesData,
      _id: item._id,
      color: item.color,
    }),
    newItemTemplate: (folderId) => ({
      productName: "",
      aliasName: { activate: false, name: "" },
      img: [],
      treatmentDuration: 1,
      amountToAdminister: 1,
      intakeTime: { advancedMode: false, daysTime: [] },
      ...(folderId ? { folderId } : {}),
    }),
  });

  const cataloguesEngine = useCatalogEngine({
    categoryService: OdysseeCategoryService,
    itemService: {
      getItemsByCategory: (catId) =>
        OdysseeProductService.getProductsByCategory(catId),
      updateItem: (id, data) => OdysseeProductService.updateProduct(id, data),
    },
    itemDeleteService: {
      deleteItem: (id) => ProductService.deleteProduct(id),
    },
    sidebarFolderService: FolderService,
    itemFolderService: ProductFolderService,
    transformItemForEdit: (item) => ({
      ...item.contentFilesData,
      _id: item._id,
      color: item.color,
    }),
    newItemTemplate: (folderId) => ({
      productName: "",
      aliasName: { activate: false, name: "" },
      img: [],
      treatmentDuration: 1,
      amountToAdminister: 1,
      intakeTime: { advancedMode: false, daysTime: [] },
      ...(folderId ? { folderId } : {}),
    }),
  });

  const engines = {
    Passagers: passengersEngine,
    Odyssée: odysseeEngine,
    Catalogues: cataloguesEngine,
  };

  const currentCat = categoryLibrary.find(
    (item) => item.name === selectedCategoryLibrary,
  );
  const currentEngine = engines[selectedCategoryLibrary];

  useEffect(() => {
    passengersEngine.setSelectedFileData(null);
    odysseeEngine.setSelectedFileData(null);
    cataloguesEngine.setSelectedFileData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryLibrary]);

  return (
    <div className="odyssee-root" style={{ position: "relative" }}>
      <nav className="odyssee-navbar">
        <button
          className="odyssee-navbar__compact-toggle"
          onClick={toggleCompact}
        >
          <IconCompactMenu isCompact={isCompact} size={20} />
        </button>
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
        <div className="left-menu" style={{ width: isCompact ? 136 : width }}>
          <div
            className="left-menu-resizer"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = width;
              const onMouseMove = (moveE) => {
                const next = Math.min(
                  800,
                  Math.max(300, startWidth + moveE.clientX - startX),
                );
                setWidth(next);
                localStorage.setItem("odyssee-sidebar-width", String(next));
              };
              const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                document.body.style.userSelect = "";
                document.body.style.cursor = "";
              };
              document.body.style.userSelect = "none";
              document.body.style.cursor = "ew-resize";
              document.addEventListener("mousemove", onMouseMove);
              document.addEventListener("mouseup", onMouseUp);
            }}
          />
          <section className="catalog-wrapper">
            <ul
              className={`library-navBar${isCompact ? " library-navBar--compact" : ""}`}
            >
              {categoryLibrary.map((item, index) => {
                const itemWidth = isCompact
                  ? undefined
                  : width * (item.width / 100);
                return (
                  <li
                    key={"cat" + item.name + index}
                    style={
                      itemWidth !== undefined
                        ? { width: `${itemWidth}px` }
                        : undefined
                    }
                    onMouseEnter={
                      isCompact
                        ? (e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setTabTooltip({
                              label: item.name,
                              x: rect.left,
                              arrowOffset: rect.width / 2,
                              y: rect.bottom + 6,
                            });
                          }
                        : undefined
                    }
                    onMouseLeave={
                      isCompact ? () => setTabTooltip(null) : undefined
                    }
                  >
                    <input
                      type="radio"
                      name="categoryLibrary"
                      id={item.name}
                      checked={item.name === selectedCategoryLibrary}
                      onChange={() => checkCategorySelected(item.name)}
                    />
                    <label htmlFor={item.name}>
                      {isCompact ? (
                        <span className="tab-icon">
                          {getTabIcon(item.name)}
                        </span>
                      ) : (
                        <span className="tab-label">{item.name}</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
            {tabTooltip && (
              <div
                className="library-tab-tooltip"
                style={{
                  left: tabTooltip.x,
                  top: tabTooltip.y,
                  "--arrow-offset": `${tabTooltip.arrowOffset}px`,
                }}
              >
                {tabTooltip.label}
              </div>
            )}
            <CatalogContent
              engine={currentEngine}
              CategoryFormComponent={CategoryForm}
              labels={currentCat?.labels}
              isCompact={isCompact}
            />
          </section>
        </div>
        {selectedCategoryLibrary === "Passagers" &&
          passengersEngine.selectedFileData && (
            <PassagerItem
              key={passengersEngine.selectedFileData._id || "new"}
              contentFilesData={passengersEngine.selectedFileData}
              categoryId={passengersEngine.selectedCategory}
              onProductCreated={passengersEngine.handleItemCreated}
              editMode={passengersEngine.editMode}
              onActivate={() => passengersEngine.setEditMode(true)}
            />
          )}
        {selectedCategoryLibrary === "Odyssée" &&
          odysseeEngine.selectedFileData && (
            <OdysseeItem
              key={odysseeEngine.selectedFileData._id || "new"}
              contentFilesData={odysseeEngine.selectedFileData}
              categoryId={odysseeEngine.selectedCategory}
              onProductCreated={odysseeEngine.handleItemCreated}
              editMode={odysseeEngine.editMode}
              onActivate={() => odysseeEngine.setEditMode(true)}
            />
          )}
        {selectedCategoryLibrary === "Catalogues" &&
          cataloguesEngine.selectedFileData && (
            <PaperProduct
              key={cataloguesEngine.selectedFileData._id || "new"}
              contentFilesData={cataloguesEngine.selectedFileData}
              categoryId={cataloguesEngine.selectedCategory}
              onProductCreated={cataloguesEngine.handleItemCreated}
              editMode={cataloguesEngine.editMode}
              onActivate={() => cataloguesEngine.setEditMode(true)}
            />
          )}
      </div>
    </div>
  );
};

export default Dashboard;
