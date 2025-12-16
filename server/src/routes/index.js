import express from "express";

import themesRoutes from "./themes.js";
import transactionsRoutes from "./transactions.js";

const router = express.Router();

// Routes API
router.use("/themes", themesRoutes);
router.use("/transactions", transactionsRoutes);

export default router;
