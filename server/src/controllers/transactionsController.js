import { v4 as uuidv4 } from "uuid";

import { Theme } from "../models/Theme.js";
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
 * Si le sous-thème a linkedAccountId, crée automatiquement une transaction liée
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
      !transactionData.designation ||
      !transactionData.accountId
    ) {
      return res.status(400).json({
        error: "Champs requis manquants",
      });
    }

    // Récupérer le thème pour vérifier si le sous-thème a un lien
    const theme = await Theme.findOne({
      id: transactionData.themeId,
      accountId: transactionData.accountId,
    });

    if (!theme) {
      return res.status(404).json({ error: "Thème introuvable" });
    }

    const subTheme = theme.subThemes.get(transactionData.subThemeId);
    if (!subTheme) {
      return res.status(404).json({ error: "Sous-thème introuvable" });
    }

    // Créer la transaction principale
    const transaction = await Transaction.create({
      ...transactionData,
      updatedAt: transactionData.updatedAt || Date.now(),
    });

    // Si le sous-thème a un lien vers un autre compte, créer la transaction liée
    if (
      subTheme.linkedAccountId &&
      subTheme.linkedThemeId &&
      subTheme.linkedSubThemeId
    ) {
      const transferId = `transfer-${uuidv4()}`;

      // Ajouter le transferId à la transaction principale
      transaction.transferId = transferId;
      transaction.linkedAccountId = subTheme.linkedAccountId;
      await transaction.save();

      // Calculer le montant opposé (recette <-> dépense)
      const linkedRecette = transactionData.depense || null;
      const linkedDepense = transactionData.recette || null;

      // Créer la transaction liée (montant opposé)
      await Transaction.create({
        id: `transaction-${uuidv4()}`,
        accountId: subTheme.linkedAccountId,
        date: transactionData.date,
        themeId: subTheme.linkedThemeId,
        subThemeId: subTheme.linkedSubThemeId,
        payment: transactionData.payment,
        designation: transactionData.designation,
        recette: linkedRecette,
        depense: linkedDepense,
        transferId: transferId,
        linkedAccountId: transactionData.accountId,
        updatedAt: Date.now(),
      });
    }

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
