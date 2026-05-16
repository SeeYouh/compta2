import express from "express";

import accountsRoutes from "./accounts.js";
import authRoutes from "./auth.js";
import contactsRoutes from "./contacts.js";
import labelsRoutes from "./labels.js";
import odysseeCategoriesRoutes from "./odysseeCategories.js";
import odysseeProductsRoutes from "./odysseeProducts.js";
import odysseeSidebarRoutes from "./odysseeSidebar.js";
import organigrammeRoutes from "./organigramme.js";
import projectionsRoutes from "./projections.js";
import settingsRoutes from "./settings.js";
import sharingRoutes from "./sharing.js";
import themesRoutes from "./themes.js";
import transactionsRoutes from "./transactions.js";

const router = express.Router();

// Routes API
router.use("/auth", authRoutes);
router.use("/accounts", accountsRoutes);
router.use("/contacts", contactsRoutes);
router.use("/labels", labelsRoutes);
router.use("/organigramme", organigrammeRoutes);
router.use("/projections", projectionsRoutes);
router.use("/settings", settingsRoutes);
router.use("/sharing", sharingRoutes);
router.use("/themes", themesRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/odyssee/products", odysseeProductsRoutes);
router.use("/odyssee/categories", odysseeCategoriesRoutes);
router.use("/odyssee/sidebar", odysseeSidebarRoutes);

export default router;
