import express from "express";

import {
  deleteTheme,
  getThemes,
  updateAllThemes,
  upsertTheme,
} from "../controllers/themesController.js";

const router = express.Router();

// GET /api/themes - Récupère tous les thèmes
router.get("/", getThemes);

// PUT /api/themes - Remplace tous les thèmes
router.put("/", updateAllThemes);

// POST /api/themes/:themeId - Ajoute ou met à jour un thème
router.post("/:themeId", upsertTheme);

// DELETE /api/themes/:themeId - Supprime un thème
router.delete("/:themeId", deleteTheme);

export default router;
