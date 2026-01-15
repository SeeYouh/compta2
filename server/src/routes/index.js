import express from "express";

import accountsRoutes from "./accounts.js";
import authRoutes from "./auth.js";
import labelsRoutes from "./labels.js";
import settingsRoutes from "./settings.js";
import themesRoutes from "./themes.js";
import transactionsRoutes from "./transactions.js";

const router = express.Router();

// Routes API
router.use("/auth", authRoutes);
router.use("/accounts", accountsRoutes);
router.use("/labels", labelsRoutes);
router.use("/settings", settingsRoutes);
router.use("/themes", themesRoutes);
router.use("/transactions", transactionsRoutes);

export default router;
