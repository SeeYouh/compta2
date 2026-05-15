import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createProduct,
  deleteProduct,
  getAllUserProducts,
  getOneProduct,
  getProductsByFolder,
  hardDeleteProduct,
  searchProducts,
  updateProduct,
} from "../controllers/odysseeProductController.js";
import { odysseeUpload } from "../middleware/odysseeMulter.js";

const router = express.Router();

// Récupérer tous les produits de l'utilisateur (organisés par dossier)
router.get("/user", authenticate, getAllUserProducts);

// Récupérer les produits par dossier
router.get("/folder/:folder", authenticate, getProductsByFolder);

// Rechercher des produits
router.get("/search", authenticate, searchProducts);

// Récupérer un produit par ID
router.get("/:id", authenticate, getOneProduct);

// Créer un produit (avec upload optionnel d'image)
router.post("/", authenticate, odysseeUpload, createProduct);

// Mettre à jour un produit
router.put("/:id", authenticate, odysseeUpload, updateProduct);

// Supprimer un produit (soft delete)
router.delete("/:id", authenticate, deleteProduct);

// Supprimer définitivement un produit
router.delete("/:id/hard", authenticate, hardDeleteProduct);

export default router;
