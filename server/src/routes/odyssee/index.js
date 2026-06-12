import express from "express";

import { injectType } from "../../middleware/injectType.js";
import odysseeBlocksRoutes from "./odysseeBlocks.js";
import odysseeCategoriesRoutes from "./odysseeCategories.js";
import odysseeDocumentsRoutes from "./odysseeDocuments.js";
import odysseeItemsRoutes from "./odysseeItems.js";
import odysseeProductFoldersRoutes from "./odysseeProductFolders.js";
import odysseeProductsRoutes from "./odysseeProducts.js";
import odysseeSidebarRoutes from "./odysseeSidebar.js";
import odysseeTemplatesRoutes from "./odysseeTemplates.js";
import odysseeTrashRoutes from "./odysseeTrash.js";
import passengerItemsRoutes from "./passengerItems.js";

const router = express.Router();

// Routes Odyssée — Catalogues
router.use(
  "/catalog/categories",
  injectType("catalog"),
  odysseeCategoriesRoutes,
);
router.use(
  "/catalog/sidebar",
  injectType("catalog"),
  odysseeSidebarRoutes,
);
router.use(
  "/catalog/products",
  injectType("catalog"),
  odysseeProductsRoutes,
);
router.use(
  "/catalog/product-folders",
  injectType("catalog"),
  odysseeProductFoldersRoutes,
);
router.use("/catalog/trash", injectType("catalog"), odysseeTrashRoutes);

// Routes Odyssée — Passagers
router.use(
  "/passengers/categories",
  injectType("passengers"),
  odysseeCategoriesRoutes,
);
router.use(
  "/passengers/sidebar",
  injectType("passengers"),
  odysseeSidebarRoutes,
);
router.use(
  "/passengers/items",
  injectType("passengers"),
  passengerItemsRoutes,
);
router.use(
  "/passengers/item-folders",
  injectType("passengers"),
  odysseeProductFoldersRoutes,
);

// Routes Odyssée — Odyssey
router.use(
  "/odyssey/categories",
  injectType("odyssey"),
  odysseeCategoriesRoutes,
);
router.use(
  "/odyssey/sidebar",
  injectType("odyssey"),
  odysseeSidebarRoutes,
);
router.use("/odyssey/items", injectType("odyssey"), odysseeItemsRoutes);
router.use(
  "/odyssey/item-folders",
  injectType("odyssey"),
  odysseeProductFoldersRoutes,
);
router.use("/odyssey/blocks", odysseeBlocksRoutes);
router.use("/odyssey/templates", odysseeTemplatesRoutes);
router.use("/odyssey/documents", odysseeDocumentsRoutes);

export default router;
