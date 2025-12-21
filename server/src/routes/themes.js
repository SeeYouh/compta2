import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  deleteTheme,
  getThemes,
  updateAllThemes,
  upsertTheme,
} from "../controllers/themesController.js";

const router = express.Router();

// GET /api/themes - Récupère tous les thèmes accessibles
router.get("/", authenticate, getThemes);

// PUT /api/themes - Remplace tous les thèmes
router.put("/", authenticate, updateAllThemes);

// POST /api/themes/:themeId - Ajoute ou met à jour un thème
router.post("/:themeId", authenticate, upsertTheme);

// DELETE /api/themes/:themeId - Supprime un thème
router.delete("/:themeId", authenticate, deleteTheme);

export default router;
