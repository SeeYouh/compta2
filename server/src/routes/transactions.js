import express from "express";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../controllers/transactionsController.js";

const router = express.Router();

// GET /api/transactions - Récupère toutes les transactions
router.get("/", getTransactions);

// POST /api/transactions - Crée une nouvelle transaction
router.post("/", createTransaction);

// PATCH /api/transactions/:id - Met à jour une transaction
router.patch("/:id", updateTransaction);

// DELETE /api/transactions/:id - Supprime une transaction
router.delete("/:id", deleteTransaction);

export default router;
