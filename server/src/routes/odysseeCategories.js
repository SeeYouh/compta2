import express from 'express';

import { authenticate } from '../middleware/auth.js';
import { categoryUpload } from '../middleware/odysseeMulter.js';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getOneCategory,
  searchCategories,
  updateCategory,
} from '../controllers/odysseeCategoryController.js';
import { validateCategoryImage } from '../middleware/imageValidation.js';

const router = express.Router();

// Toutes les routes sont protégées : les catégories appartiennent à un utilisateur
router.get("/", authenticate, getAllCategories);
router.get("/search", authenticate, searchCategories);
router.get("/:id", authenticate, getOneCategory);
router.post(
  "/",
  authenticate,
  categoryUpload,
  validateCategoryImage,
  createCategory,
);
router.put(
  "/:id",
  authenticate,
  categoryUpload,
  validateCategoryImage,
  updateCategory,
);
router.delete("/:id", authenticate, deleteCategory);

export default router;
