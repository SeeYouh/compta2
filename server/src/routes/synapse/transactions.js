import express from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  accountFromBody,
  accountFromTransaction,
  requirePermission,
} from "../../middleware/requirePermission.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../../schemas/synapse.js";
import { validate } from "../../middleware/validate.js";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../../controllers/synapse/transactionsController.js";

const router = express.Router();

// GET /api/transactions - Récupère toutes les transactions accessibles
// (le contrôleur filtre déjà sur les comptes de l'utilisateur via getUserAccounts)
router.get("/", authenticate, getTransactions);

// POST /api/transactions - Crée une nouvelle transaction
router.post(
  "/",
  authenticate,
  validate(createTransactionSchema),
  requirePermission("canCreateTransactions", accountFromBody()),
  createTransaction,
);

// PATCH /api/transactions/:id - Met à jour une transaction
router.patch(
  "/:id",
  authenticate,
  requirePermission("canEditTransactions", accountFromTransaction()),
  validate(updateTransactionSchema),
  updateTransaction,
);

// DELETE /api/transactions/:id - Supprime une transaction
router.delete(
  "/:id",
  authenticate,
  requirePermission("canDeleteTransactions", accountFromTransaction()),
  deleteTransaction,
);

export default router;
