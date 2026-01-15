import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  getLabels,
  updateLabels,
  resetLabels,
} from "../controllers/labelsController.js";

const router = express.Router();

// GET /api/labels - Récupère les labels personnalisés de l'utilisateur
router.get("/", authenticate, getLabels);

// PUT /api/labels - Met à jour les labels personnalisés
router.put("/", authenticate, updateLabels);

// POST /api/labels/reset - Réinitialise les labels aux valeurs par défaut
router.post("/reset", authenticate, resetLabels);

export default router;
