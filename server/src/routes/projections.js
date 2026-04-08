import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  computeProjections,
  deleteProjection,
  getOccurrences,
  getProjections,
  updateProjection,
} from "../controllers/projectionsController.js";

const router = express.Router();

// POST /api/projections/compute - Lance le calcul des projections pour un compte
router.post("/compute", authenticate, computeProjections);

// GET /api/projections/occurrences - Récupère les occurrences à afficher
router.get("/occurrences", authenticate, getOccurrences);

// GET /api/projections - Liste les patterns de projection d'un compte
router.get("/", authenticate, getProjections);

// PATCH /api/projections/:id - Met à jour une projection
router.patch("/:id", authenticate, updateProjection);

// DELETE /api/projections/:id - Supprime une projection et ses occurrences
router.delete("/:id", authenticate, deleteProjection);

export default router;
