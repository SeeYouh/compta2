import express from 'express';

import { authenticate } from '../middleware/auth.js';
import {
  createProductFolder,
  deleteProductFolder,
  reorderFolders,
  updateProductFolder,
} from '../controllers/odysseeProductFolderController.js';

const router = express.Router();

// Créer un dossier de produits
router.post("/", authenticate, createProductFolder);

// Modifier un dossier (nom, couleur)
router.put("/:id", authenticate, updateProductFolder);

// Réordonner les dossiers
router.patch("/reorder", authenticate, reorderFolders);

// Supprimer un dossier (cascade : sous-dossiers + produits)
router.delete("/:id", authenticate, deleteProductFolder);

export default router;
