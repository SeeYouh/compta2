import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getOneCategory,
  hardDeleteCategory,
  searchCategories,
  updateCategory,
} from "../controllers/odysseeCategoryController.js";

const router = express.Router();

// Récupérer toutes les catégories (public)
router.get("/", getAllCategories);

// Rechercher des catégories (public)
router.get("/search", searchCategories);

// Récupérer une catégorie par ID (public)
router.get("/:id", getOneCategory);

// Créer une catégorie (authentification requise)
router.post("/", authenticate, createCategory);

// Mettre à jour une catégorie
router.put("/:id", authenticate, updateCategory);

// Supprimer une catégorie (soft delete)
router.delete("/:id", authenticate, deleteCategory);

// Supprimer définitivement une catégorie
router.delete("/:id/hard", authenticate, hardDeleteCategory);

export default router;
