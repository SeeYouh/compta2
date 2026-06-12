import express from "express";

import authRoutes from "./auth.js";
import synapseRoutes from "./synapse/index.js";
import trameRoutes from "./trame/index.js";
import odysseeRoutes from "./odyssee/index.js";

const router = express.Router();

// Routes API globales
router.use("/auth", authRoutes);

// Routes Synapse (comptabilité)
router.use("/synapse", synapseRoutes);

// Routes Trame (organigramme)
router.use("/trame", trameRoutes);

// Routes Odyssée (catalogue, passagers, planification)
router.use("/odyssee", odysseeRoutes);

export default router;
