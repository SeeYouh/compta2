import { Transaction } from "../models/Transaction.js";

/**
 * GET /api/transactions
 * Récupère toutes les transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Erreur getTransactions:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des transactions",
    });
  }
};

/**
 * POST /api/transactions
 * Crée une nouvelle transaction
 */
export const createTransaction = async (req, res) => {
  try {
    const transactionData = req.body;

    // Validation basique
    if (
      !transactionData.date ||
      !transactionData.themeId ||
      !transactionData.subThemeId ||
      !transactionData.payment ||
      !transactionData.designation
    ) {
      return res.status(400).json({
        error: "Champs requis manquants",
      });
    }

    const transaction = await Transaction.create({
      ...transactionData,
      updatedAt: transactionData.updatedAt || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Erreur createTransaction:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la création de la transaction",
    });
  }
};

/**
 * PATCH /api/transactions/:id
 * Met à jour une transaction
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updatedAt: Date.now(),
    };

    const transaction = await Transaction.findOneAndUpdate({ id }, updates, {
      new: true,
      runValidators: true,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Erreur updateTransaction:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour de la transaction",
    });
  }
};

/**
 * DELETE /api/transactions/:id
 * Supprime une transaction
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ id });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    res.json({ message: "Transaction supprimée", id });
  } catch (error) {
    console.error("Erreur deleteTransaction:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la suppression de la transaction",
    });
  }
};
