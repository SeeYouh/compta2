import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createDocument,
  deleteDocument,
  getAllUserDocuments,
  getDocumentByTemplateId,
  getDocumentsByCategory,
  getOneDocument,
  searchDocuments,
  updateDocument,
} from "../controllers/odysseeDocumentController.js";

const router = express.Router();

router.get("/user", authenticate, getAllUserDocuments);
router.get("/category/:categoryId", authenticate, getDocumentsByCategory);
router.get("/search", authenticate, searchDocuments);
router.get("/by-template/:templateId", authenticate, getDocumentByTemplateId);
router.get("/:id", authenticate, getOneDocument);
router.post("/", authenticate, createDocument);
router.put("/:id", authenticate, updateDocument);
router.delete("/:id", authenticate, deleteDocument);

export default router;
