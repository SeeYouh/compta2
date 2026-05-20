import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import CatalogContent from "../../components/CatalogContent";
import CategoryForm from "../../components/CategoryForm";
import { categoryLibrary } from "../../utils/variable";
import FolderService from "../../services/folderService";
import Gear from "../../assets/gear";
import OdysseeCategoryService from "../../../../services/odysseeCategoryService";
import OdysseeProductService from "../../../../services/odysseeProductService";
import {
  odysseyCategoryService,
  odysseyItemDeleteService,
  odysseyItemFolderService,
  odysseyItemService,
  odysseySidebarService,
} from "../../services/odysseyServices";
import PaperProduct from "../../components/PaperProduct";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem("odyssee-sidebar-width");
    return saved ? parseInt(saved, 10) : 400;
  });
  const [selectedCategoryLibrary, setSelectedCategoryLibrary] = useState(
    categoryLibrary[2].name,
  );

  const checkCategorySelected = (radioId) => {
    setSelectedCategoryLibrary((selected) =>
      selected === radioId ? categoryLibrary[0].name : radioId,
    );
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
      _id: item._id,
      name: item.name,
      ...item.contentData,
    }),
    newItemTemplate: (folderId) => ({
      name: "",
      contentData: {},
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
      _id: item._id,
      name: item.name,
      ...item.contentData,
    }),
    newItemTemplate: (folderId) => ({
      name: "",
      contentData: {},
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
            <CatalogContent
              engine={currentEngine}
              CategoryFormComponent={CategoryForm}
              labels={currentCat?.labels}
            />
          </section>
        </div>
        {selectedCategoryLibrary === "Catalogues" &&
          cataloguesEngine.selectedFileData && (
            <PaperProduct
              key={cataloguesEngine.selectedFileData._id || "new"}
              contentFilesData={cataloguesEngine.selectedFileData}
              categoryId={cataloguesEngine.selectedCategory}
              onProductCreated={cataloguesEngine.handleItemCreated}
              editMode={cataloguesEngine.editMode}
            />
          )}
      </div>
    </div>
  );
};

export default Dashboard;
