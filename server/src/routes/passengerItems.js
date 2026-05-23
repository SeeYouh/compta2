import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createInfoSuppFolder,
  createItem,
  deleteInfoSuppFolder,
  deleteItem,
  getAllUserItems,
  getItemsByCategory,
  getOneItem,
  searchItems,
  updateInfoSuppFolder,
  updateInfoSuppLayout,
  updateItem,
} from "../controllers/passengerItemController.js";
import { odysseeUpload } from "../middleware/odysseeMulter.js";

const router = express.Router();

router.get("/user", authenticate, getAllUserItems);
router.get("/category/:categoryId", authenticate, getItemsByCategory);
router.get("/search", authenticate, searchItems);
router.get("/:id", authenticate, getOneItem);
router.post("/", authenticate, odysseeUpload, createItem);
router.put("/:id", authenticate, odysseeUpload, updateItem);
router.delete("/:id", authenticate, deleteItem);

// Info Supp — dossiers et layout
router.post("/:id/infosupp/folders", authenticate, createInfoSuppFolder);
router.put(
  "/:id/infosupp/folders/:folderId",
  authenticate,
  updateInfoSuppFolder,
);
router.delete(
  "/:id/infosupp/folders/:folderId",
  authenticate,
  deleteInfoSuppFolder,
);
router.put("/:id/infosupp/layout", authenticate, updateInfoSuppLayout);

export default router;
