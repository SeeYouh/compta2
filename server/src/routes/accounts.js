import express from "express";

import {
  createAccount,
  deleteAccount,
  getAllAccounts,
  getTemplateAccount,
  updateAccount,
} from "../controllers/accountsController.js";

const router = express.Router();

// GET /api/accounts - Récupère tous les comptes utilisateurs
router.get("/", getAllAccounts);

// GET /api/accounts/template - Récupère le compte template
router.get("/template", getTemplateAccount);

// POST /api/accounts - Créer un nouveau compte
router.post("/", createAccount);

// PUT /api/accounts/:id - Modifier un compte
router.put("/:id", updateAccount);

// DELETE /api/accounts/:id - Supprimer un compte
router.delete("/:id", deleteAccount);

export default router;
