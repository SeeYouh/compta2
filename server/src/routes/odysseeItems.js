import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createItem,
  deleteItem,
  getAllUserItems,
  getItemsByCategory,
  getOneItem,
  searchItems,
  updateItem,
} from "../controllers/odysseeItemController.js";
import { odysseeUpload } from "../middleware/odysseeMulter.js";

const router = express.Router();

router.get("/user", authenticate, getAllUserItems);
router.get("/category/:categoryId", authenticate, getItemsByCategory);
router.get("/search", authenticate, searchItems);
router.get("/:id", authenticate, getOneItem);
router.post("/", authenticate, odysseeUpload, createItem);
router.put("/:id", authenticate, odysseeUpload, updateItem);
router.delete("/:id", authenticate, deleteItem);

export default router;
