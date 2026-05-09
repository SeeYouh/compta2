import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createAccount,
  deleteAccount,
  getAllAccounts,
  getTemplateAccount,
  updateAccount,
  updateSharedPermission,
} from "../controllers/accountsController.js";

const router = express.Router();

// GET /api/accounts - Récupère tous les comptes accessibles par l'utilisateur
router.get("/", authenticate, getAllAccounts);

// GET /api/accounts/template - Récupère le compte template
router.get("/template", getTemplateAccount);

// POST /api/accounts - Créer un nouveau compte
router.post("/", authenticate, createAccount);

// PUT /api/accounts/:id - Modifier un compte
router.put("/:id", authenticate, updateAccount);

// DELETE /api/accounts/:id - Supprimer un compte
router.delete("/:id", authenticate, deleteAccount);

// PATCH /api/accounts/:id/shared-permissions - Modifier une permission d'un partagé
router.patch("/:id/shared-permissions", authenticate, updateSharedPermission);

export default router;
