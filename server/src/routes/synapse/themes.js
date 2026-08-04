import express from "express";

import { accountFromTheme, requirePermission } from "../../middleware/requirePermission.js";
import { authenticate } from "../../middleware/auth.js";
import {
  deleteTheme,
  getThemes,
  updateAllThemes,
  upsertTheme,
} from "../../controllers/synapse/themesController.js";

const router = express.Router();

// GET /api/themes - Récupère tous les thèmes accessibles
// (le contrôleur filtre déjà via getUserAccounts)
router.get("/", authenticate, getThemes);

// PUT /api/themes - Remplace les thèmes du périmètre de l'appelant
// (le contrôleur restreint lui-même aux comptes accessibles — cf. SEC-03)
router.put("/", authenticate, updateAllThemes);

// POST /api/themes/:themeId - Ajoute ou met à jour un thème
router.post(
  "/:themeId",
  authenticate,
  requirePermission("canManageThemes", accountFromTheme()),
  upsertTheme,
);

// DELETE /api/themes/:themeId - Supprime un thème
router.delete(
  "/:themeId",
  authenticate,
  requirePermission("canManageThemes", accountFromTheme()),
  deleteTheme,
);

export default router;
