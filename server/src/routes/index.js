import express from "express";

import accountsRoutes from "./accounts.js";
import authRoutes from "./auth.js";
import colorPreferencesRoutes from "./colorPreferences.js";
import contactsRoutes from "./contacts.js";
import { injectType } from "../middleware/injectType.js";
import labelsRoutes from "./labels.js";
import odysseeCategoriesRoutes from "./odysseeCategories.js";
import odysseeProductFoldersRoutes from "./odysseeProductFolders.js";
import odysseeProductsRoutes from "./odysseeProducts.js";
import odysseeSidebarRoutes from "./odysseeSidebar.js";
import odysseeTrashRoutes from "./odysseeTrash.js";
import odysseyItemsRoutes from "./odysseyItems.js";
import organigrammeRoutes from "./organigramme.js";
import passengerItemsRoutes from "./passengerItems.js";
import projectionsRoutes from "./projections.js";
import settingsRoutes from "./settings.js";
import sharingRoutes from "./sharing.js";
import themesRoutes from "./themes.js";
import transactionsRoutes from "./transactions.js";

const router = express.Router();

// Routes API
router.use("/auth", authRoutes);
router.use("/accounts", accountsRoutes);
router.use("/color-preferences", colorPreferencesRoutes);
router.use("/contacts", contactsRoutes);
router.use("/labels", labelsRoutes);
router.use("/organigramme", organigrammeRoutes);
router.use("/projections", projectionsRoutes);
router.use("/settings", settingsRoutes);
router.use("/sharing", sharingRoutes);
router.use("/themes", themesRoutes);
router.use("/transactions", transactionsRoutes);

// Routes Odyssée — Catalogues
router.use(
  "/odyssee/catalog/categories",
  injectType("catalog"),
  odysseeCategoriesRoutes,
);
router.use(
  "/odyssee/catalog/sidebar",
  injectType("catalog"),
  odysseeSidebarRoutes,
);
router.use(
  "/odyssee/catalog/products",
  injectType("catalog"),
  odysseeProductsRoutes,
);
router.use(
  "/odyssee/catalog/product-folders",
  injectType("catalog"),
  odysseeProductFoldersRoutes,
);
router.use("/odyssee/catalog/trash", injectType("catalog"), odysseeTrashRoutes);

// Routes Odyssée — Passagers
router.use(
  "/odyssee/passengers/categories",
  injectType("passengers"),
  odysseeCategoriesRoutes,
);
router.use(
  "/odyssee/passengers/sidebar",
  injectType("passengers"),
  odysseeSidebarRoutes,
);
router.use(
  "/odyssee/passengers/items",
  injectType("passengers"),
  passengerItemsRoutes,
);
router.use(
  "/odyssee/passengers/item-folders",
  injectType("passengers"),
  odysseeProductFoldersRoutes,
);

// Routes Odyssée — Odyssey
router.use(
  "/odyssee/odyssey/categories",
  injectType("odyssey"),
  odysseeCategoriesRoutes,
);
router.use(
  "/odyssee/odyssey/sidebar",
  injectType("odyssey"),
  odysseeSidebarRoutes,
);
router.use("/odyssee/odyssey/items", injectType("odyssey"), odysseyItemsRoutes);
router.use(
  "/odyssee/odyssey/item-folders",
  injectType("odyssey"),
  odysseeProductFoldersRoutes,
);

export default router;
