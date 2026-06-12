import express from "express";

import {
  addToHistory,
  getColorPreferences,
  setDefault,
  updateVariable,
} from "../../controllers/synapse/colorPreferencesController.js";
import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

// GET /api/color-preferences — charge history + variables + defaults
router.get("/", authenticate, getColorPreferences);

// PATCH /api/color-preferences/variable — met à jour une variable CSS
router.patch("/variable", authenticate, updateVariable);

// PATCH /api/color-preferences/history — ajoute une couleur à l'historique
router.patch("/history", authenticate, addToHistory);

// PATCH /api/color-preferences/default/:contextKey — définit la couleur par défaut d'un contexte
router.patch("/default/:contextKey", authenticate, setDefault);

export default router;
