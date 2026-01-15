import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings,
} from "../controllers/settingsController.js";

const router = express.Router();

// GET /api/settings/:id - Récupère les paramètres par ID
router.get("/:id", authenticate, getSettings);

// POST /api/settings - Crée de nouveaux paramètres
router.post("/", authenticate, createSettings);

// PATCH /api/settings/:id - Met à jour les paramètres
router.patch("/:id", authenticate, updateSettings);

// DELETE /api/settings/:id - Supprime les paramètres
router.delete("/:id", authenticate, deleteSettings);

export default router;
