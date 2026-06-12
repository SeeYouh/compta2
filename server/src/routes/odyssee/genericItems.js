import express from 'express';

import { authenticate } from '../../middleware/auth.js';
import {
  createItem,
  deleteItem,
  getItemsByCategory,
  updateItem,
} from '../../controllers/odyssee/genericItemController.js';

const router = express.Router();

router.get("/category/:categoryId", authenticate, getItemsByCategory);
router.post("/", authenticate, createItem);
router.put("/:id", authenticate, updateItem);
router.delete("/:id", authenticate, deleteItem);

export default router;
