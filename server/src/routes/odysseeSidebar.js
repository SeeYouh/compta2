import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createFolder,
  deleteFolder,
  getSidebar,
  updateFolder,
  updateLayout,
} from "../controllers/odysseeSidebarController.js";

const router = express.Router();

router.get("/", authenticate, getSidebar);
router.put("/layout", authenticate, updateLayout);
router.post("/folders", authenticate, createFolder);
router.put("/folders/:id", authenticate, updateFolder);
router.delete("/folders/:id", authenticate, deleteFolder);

export default router;
