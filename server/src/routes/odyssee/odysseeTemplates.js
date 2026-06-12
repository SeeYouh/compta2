import express from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  createTemplate,
  deleteTemplate,
  getAllUserTemplates,
  getOneTemplate,
  getTemplatesByCategory,
  searchTemplates,
  updateTemplate,
} from "../../controllers/odyssee/odysseeTemplateController.js";

const router = express.Router();

router.get("/user", authenticate, getAllUserTemplates);
router.get("/category/:categoryId", authenticate, getTemplatesByCategory);
router.get("/search", authenticate, searchTemplates);
router.get("/:id", authenticate, getOneTemplate);
router.post("/", authenticate, createTemplate);
router.put("/:id", authenticate, updateTemplate);
router.delete("/:id", authenticate, deleteTemplate);

export default router;
