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

    // Si linkedAccountId est fourni, créer automatiquement la transaction miroir (virement)
    if (transactionData.linkedAccountId) {
      const transferId = `transfer-${uuidv4()}`;

      // Ajouter le transferId à la transaction principale
      transaction.transferId = transferId;
      await transaction.save();

      // Récupérer le thème "Compte" du compte de destination pour le virement retour
      const linkedTheme = await Theme.findOne({
        accountId: transactionData.linkedAccountId,
        name: "Compte", // Chercher le thème virtuel correspondant
      });

      // Déterminer les IDs du thème/sous-thème pour la transaction miroir
      let linkedThemeId = "virtual-transfer-theme";
      let linkedSubThemeId = transactionData.accountId;

      // Si un thème "Compte" existe en DB pour le compte lié, l'utiliser
      if (linkedTheme) {
        linkedThemeId = linkedTheme.id;
        // Chercher le sous-thème correspondant au compte source
        const linkedSubTheme = Array.from(linkedTheme.subThemes.values()).find(
          (st) => st.linkedAccountId === transactionData.accountId
        );
        if (linkedSubTheme) {
          linkedSubThemeId = linkedSubTheme.id;
        }
      }

      // Calculer le montant opposé (dépense -> recette, recette -> dépense)
      const linkedRecette = transactionData.depense || null;
      const linkedDepense = transactionData.recette || null;

      // Créer la transaction miroir dans le compte de destination
      await Transaction.create({
        id: `transaction-${uuidv4()}`,
        accountId: transactionData.linkedAccountId,
        date: transactionData.date,
        themeId: linkedThemeId,
        subThemeId: linkedSubThemeId,
        payment: transactionData.payment,
        designation: transactionData.designation,
        recette: linkedRecette,
        depense: linkedDepense,
        transferId: transferId,
        linkedAccountId: transactionData.accountId,
        updatedAt: Date.now(),
        disabled: false,
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
 * Supprime une transaction et sa transaction liée si c'est un transfert inter-comptes
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la transaction à supprimer
    const transaction = await Transaction.findOne({ id });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    // Si la transaction a un transferId, supprimer toutes les transactions liées
    if (transaction.transferId) {
      await Transaction.deleteMany({ transferId: transaction.transferId });
      res.json({
        message: "Transaction et transaction liée supprimées",
        id,
        transferId: transaction.transferId,
      });
    } else {
      // Sinon, supprimer uniquement cette transaction
      await Transaction.findOneAndDelete({ id });
      res.json({ message: "Transaction supprimée", id });
    }
  } catch (error) {
    console.error("Erreur deleteTransaction:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la suppression de la transaction",
    });
  }
};
