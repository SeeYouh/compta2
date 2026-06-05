import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createProduct,
  deleteProduct,
  getAllUserProducts,
  getOneProduct,
  getProductsByCategory,
  searchProducts,
  updateProduct,
} from "../controllers/odysseeProductController.js";
import { odysseeUpload } from "../middleware/odysseeMulter.js";

const router = express.Router();

// Récupérer tous les produits de l'utilisateur (groupés par catégorie)
router.get("/user", authenticate, getAllUserProducts);

// Récupérer les produits par catégorie
router.get("/category/:categoryId", authenticate, getProductsByCategory);

// Rechercher des produits
router.get("/search", authenticate, searchProducts);

// Récupérer un produit par ID
router.get("/:id", authenticate, getOneProduct);

// Créer un produit (avec upload optionnel d'image)
router.post("/", authenticate, odysseeUpload, createProduct);

// Mettre à jour un produit
router.put("/:id", authenticate, odysseeUpload, updateProduct);

// Supprimer un produit
router.delete("/:id", authenticate, deleteProduct);

export default router;
