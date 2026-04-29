import { v4 as uuidv4 } from "uuid";

import { Account } from "../models/Account.js";
import { getUserAccounts } from "../middleware/permissions.js";
import { Theme } from "../models/Theme.js";
import { Transaction } from "../models/Transaction.js";

/**
 * S'assure que le thème "Compte" et le sous-thème correspondant au compte source
 * existent dans le compte de destination. Crée le manquant si nécessaire.
 * Retourne { themeId, subThemeId }.
 */
async function ensureTransferTheme(
  destinationAccountId,
  sourceAccountId,
  sourceAccountName,
) {
  const TRANSFER_THEME_ID = "theme-compte";

  let linkedTheme = await Theme.findOne({
    accountId: destinationAccountId,
    name: "Compte",
  });

  if (!linkedTheme) {
    // Créer le thème "Compte" dans le compte de destination
    const subThemeId = sourceAccountId;
    linkedTheme = await Theme.create({
      id: TRANSFER_THEME_ID,
      accountId: destinationAccountId,
      name: "Compte",
      slug: "compte",
      subThemes: new Map([
        [
          subThemeId,
          {
            id: subThemeId,
            name: sourceAccountName,
            slug: sourceAccountName.toLowerCase().replace(/\s+/g, "-"),
            linkedAccountId: sourceAccountId,
            linkedThemeId: null,
            linkedSubThemeId: null,
            autoCreated: true,
          },
        ],
      ]),
    });
    return { themeId: linkedTheme.id, subThemeId };
  }

  // Le thème existe — chercher le sous-thème correspondant au compte source
  const existingSubTheme = Array.from(linkedTheme.subThemes.values()).find(
    (st) => st.linkedAccountId === sourceAccountId,
  );

  if (existingSubTheme) {
    return { themeId: linkedTheme.id, subThemeId: existingSubTheme.id };
  }

  // Le sous-thème est manquant — le créer
  const newSubThemeId = sourceAccountId;
  linkedTheme.subThemes.set(newSubThemeId, {
    id: newSubThemeId,
    name: sourceAccountName,
    slug: sourceAccountName.toLowerCase().replace(/\s+/g, "-"),
    linkedAccountId: sourceAccountId,
    linkedThemeId: null,
    linkedSubThemeId: null,
    autoCreated: true,
  });
  await linkedTheme.save();

  return { themeId: linkedTheme.id, subThemeId: newSubThemeId };
}

/**
 * GET /api/transactions
 * Récupère toutes les transactions des comptes accessibles par l'utilisateur
 */
export const getTransactions = async (req, res) => {
  try {
    // Récupérer tous les comptes accessibles par l'utilisateur
    const accounts = await getUserAccounts(req.userId);
    const accountIds = accounts.map((acc) => acc.id);

    // Récupérer les transactions de ces comptes
    const transactions = await Transaction.find({
      accountId: { $in: accountIds },
    }).sort({ date: -1 });

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

    // Si linkedAccountId est fourni, créer la transaction miroir dans le compte de destination
    // Les deux transactions sont indépendantes après création (pas de lien, suppression individuelle)
    if (transactionData.linkedAccountId) {
      // Récupérer le nom du compte source pour nommer le sous-thème dans le compte de destination
      const sourceAccount = await Account.findOne({
        id: transactionData.accountId,
      });
      const sourceAccountName =
        sourceAccount?.name ?? transactionData.accountId;

      // S'assurer que le thème/sous-thème existent dans le compte de destination
      const { themeId: linkedThemeId, subThemeId: linkedSubThemeId } =
        await ensureTransferTheme(
          transactionData.linkedAccountId,
          transactionData.accountId,
          sourceAccountName,
        );

      // Calculer le montant opposé (dépense -> recette, recette -> dépense)
      const linkedRecette = transactionData.depense || null;
      const linkedDepense = transactionData.recette || null;

      // Créer la transaction miroir dans le compte de destination (indépendante)
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
 * Supprime uniquement cette transaction (les virements inter-comptes sont indépendants)
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
