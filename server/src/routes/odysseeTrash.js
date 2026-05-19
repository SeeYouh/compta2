import express from 'express';

import { authenticate } from '../middleware/auth.js';
import {
  getTrash,
  permanentDeleteFolder,
  permanentDeleteProduct,
  restoreFolder,
  restoreProduct,
} from '../controllers/odysseeTrashController.js';

const router = express.Router();

router.get("/", authenticate, getTrash);
router.post("/products/:id/restore", authenticate, restoreProduct);
router.post("/folders/:id/restore", authenticate, restoreFolder);
router.delete("/products/:id", authenticate, permanentDeleteProduct);
router.delete("/folders/:id", authenticate, permanentDeleteFolder);

export default router;
