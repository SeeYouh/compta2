import { v4 as uuidv4 } from "uuid";

import { Account } from "../models/Account.js";
import { getUserAccounts } from "../middleware/permissions.js";
import { Theme } from "../models/Theme.js";
import { Transaction } from "../models/Transaction.js";

const TRANSFER_THEME_ID = "theme-compte-transfer";

/**
 * Synchronise le thème "Compte" dans tous les comptes non-template
 * Crée/met à jour les sous-thèmes pour pointer vers les autres comptes
 */
async function syncAccountTransferThemes() {
  try {
    const accounts = await Account.find({ isTemplate: false });

    // Si un seul compte, supprimer le thème "Compte" partout (inutile)
    if (accounts.length <= 1) {
      await Theme.deleteMany({
        id: TRANSFER_THEME_ID,
        accountId: { $ne: "template" },
      });
      return;
    }

    // Pour chaque compte, créer/mettre à jour le thème "Compte"
    for (const account of accounts) {
      // Créer les sous-thèmes : tous les autres comptes
      const otherAccounts = accounts
        .filter((acc) => acc.id !== account.id)
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));

      const subThemes = new Map(
        otherAccounts.map((acc) => [
          acc.id,
          {
            id: acc.id,
            name: acc.name,
            slug: acc.name.toLowerCase().replace(/\s+/g, "-"),
            linkedAccountId: acc.id,
            linkedThemeId: null,
            linkedSubThemeId: null,
          },
        ])
      );

      // Vérifier si le thème existe déjà
      const existingTheme = await Theme.findOne({
        id: TRANSFER_THEME_ID,
        accountId: account.id,
      });

      if (existingTheme) {
        // Mettre à jour les sous-thèmes
        existingTheme.subThemes = subThemes;
        await existingTheme.save();
      } else {
        // Créer le thème
        await Theme.create({
          id: TRANSFER_THEME_ID,
          accountId: account.id,
          name: "Compte",
          slug: "compte",
          subThemes,
        });
      }
    }
  } catch (error) {
    console.error("Erreur syncAccountTransferThemes:", error);
    throw error;
  }
}

/**
 * GET /api/accounts
 * Récupère tous les comptes accessibles par l'utilisateur connecté
 */
export const getAllAccounts = async (req, res) => {
  try {
    // req.userId est défini par le middleware authenticate
    const accounts = await getUserAccounts(req.userId);

    res.json(accounts);
  } catch (error) {
    console.error("Erreur getAllAccounts:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des comptes" });
  }
};

/**
 * GET /api/accounts/template
 * Récupère le compte template avec ses thèmes
 */
export const getTemplateAccount = async (req, res) => {
  try {
    const templateAccount = await Account.findOne({ isTemplate: true });

    if (!templateAccount) {
      return res.status(404).json({ error: "Compte template introuvable" });
    }

    // Récupérer les thèmes du template
    const templateThemes = await Theme.find({
      accountId: templateAccount.id,
    });

    res.json({
      account: templateAccount,
      themes: templateThemes,
    });
  } catch (error) {
    console.error("Erreur getTemplateAccount:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération du template",
    });
  }
};

/**
 * POST /api/accounts
 * Créer un nouveau compte en dupliquant les thèmes du template
 * + Ajouter/mettre à jour le thème "Compte" dans tous les comptes
 */
export const createAccount = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Le nom du compte est requis" });
    }

    // Vérifier que le template existe
    const templateAccount = await Account.findOne({ isTemplate: true });
    if (!templateAccount) {
      return res.status(500).json({
        error:
          "Compte template introuvable. Exécutez le script de migration d'abord.",
      });
    }

    // Créer le nouveau compte
    const newAccount = await Account.create({
      id: `account-${uuidv4()}`,
      name: name.trim(),
      isTemplate: false,
      userId: req.userId, // Associer au propriétaire
      sharedWith: [],
    });

    // Récupérer les thèmes du template
    const templateThemes = await Theme.find({
      accountId: templateAccount.id,
    }).lean();

    // Dupliquer les thèmes pour le nouveau compte (copie indépendante)
    const newThemes = templateThemes.map((theme) => ({
      id: theme.id, // Garder le même ID (isolé par accountId)
      accountId: newAccount.id,
      name: theme.name,
      slug: theme.slug,
      subThemes: theme.subThemes || {},
    }));

    await Theme.insertMany(newThemes);

    // Synchroniser le thème "Compte" dans tous les comptes
    await syncAccountTransferThemes();

    res.status(201).json({
      account: newAccount,
      themesCount: newThemes.length,
    });
  } catch (error) {
    console.error("Erreur createAccount:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création du compte" });
  }
};

/**
 * PUT /api/accounts/:id
 * Modifier le nom et/ou la couleur d'un compte
 */
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name && !color) {
      return res
        .status(400)
        .json({ error: "Le nom ou la couleur doit être fourni" });
    }

    if (name && name.trim().length === 0) {
      return res.status(400).json({ error: "Le nom ne peut pas être vide" });
    }

    if (color && !/^#[A-Fa-f0-9]{6}$/.test(color)) {
      return res
        .status(400)
        .json({ error: "Format de couleur invalide (ex: #3b82f6)" });
    }

    const account = await Account.findOne({ id, isTemplate: false });

    if (!account) {
      return res.status(404).json({ error: "Compte introuvable" });
    }

    const nameChanged = name && name.trim() !== account.name;

    if (name) account.name = name.trim();
    if (color) account.color = color;

    await account.save();

    // Si le nom a changé, synchroniser le thème "Compte" partout
    if (nameChanged) {
      await syncAccountTransferThemes();
    }

    res.json(account);
  } catch (error) {
    console.error("Erreur updateAccount:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la modification du compte" });
  }
};

/**
 * DELETE /api/accounts/:id
 * Supprimer un compte + ses transactions
 * Les transactions liées dans d'autres comptes deviennent orphelines
 */
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findOne({ id, isTemplate: false });

    if (!account) {
      return res.status(404).json({ error: "Compte introuvable" });
    }

    // Compter les éléments à supprimer
    const themesCount = await Theme.countDocuments({ accountId: id });
    const transactionsCount = await Transaction.countDocuments({
      accountId: id,
    });

    // Supprimer les thèmes du compte
    await Theme.deleteMany({ accountId: id });

    // Supprimer les transactions du compte
    await Transaction.deleteMany({ accountId: id });

    // Orpheliner les transactions liées (linkedAccountId = ce compte)
    await Transaction.updateMany(
      { linkedAccountId: id },
      { $set: { linkedAccountId: null, transferId: null } }
    );

    // Supprimer le compte
    await Account.deleteOne({ id });

    // Synchroniser le thème "Compte" dans tous les comptes restants
    await syncAccountTransferThemes();

    res.json({
      message: "Compte supprimé avec succès",
      deleted: {
        account: account.name,
        themes: themesCount,
        transactions: transactionsCount,
      },
    });
  } catch (error) {
    console.error("Erreur deleteAccount:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du compte" });
  }
};
