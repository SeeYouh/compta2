import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../controllers/transactionsController.js";

const router = express.Router();

// GET /api/transactions - Récupère toutes les transactions accessibles
router.get("/", authenticate, getTransactions);

// POST /api/transactions - Crée une nouvelle transaction
router.post("/", authenticate, createTransaction);

// PATCH /api/transactions/:id - Met à jour une transaction
router.patch("/:id", authenticate, updateTransaction);

// DELETE /api/transactions/:id - Supprime une transaction
router.delete("/:id", authenticate, deleteTransaction);

export default router;
