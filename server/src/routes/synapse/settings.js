import express from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings,
  getUserColor,
  updateUserColor,
} from "../../controllers/synapse/settingsController.js";

const router = express.Router();

// GET /api/synapse/settings/color - Récupère la couleur Synapse
router.get("/color/get", authenticate, getUserColor);

// PATCH /api/synapse/settings/color - Met à jour la couleur Synapse
router.patch("/color/update", authenticate, updateUserColor);

// GET /api/synapse/settings/:id - Récupère les paramètres par ID
router.get("/:id", authenticate, getSettings);

// POST /api/synapse/settings - Crée de nouveaux paramètres
router.post("/", authenticate, createSettings);

// PATCH /api/synapse/settings/:id - Met à jour les paramètres
router.patch("/:id", authenticate, updateSettings);

// DELETE /api/synapse/settings/:id - Supprime les paramètres
router.delete("/:id", authenticate, deleteSettings);

export default router;
