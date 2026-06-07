import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createBlock,
  deleteBlock,
  getAllBlocks,
  getOneBlock,
  updateBlock,
} from "../controllers/odysseeBlockController.js";

const router = express.Router();

router.get("/", authenticate, getAllBlocks);
router.get("/:id", authenticate, getOneBlock);
router.post("/", authenticate, createBlock);
router.put("/:id", authenticate, updateBlock);
router.delete("/:id", authenticate, deleteBlock);

export default router;
