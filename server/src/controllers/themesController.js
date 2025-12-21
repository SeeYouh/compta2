import { getUserAccounts } from "../middleware/permissions.js";
import { Theme } from "../models/Theme.js";

/**
 * GET /api/themes
 * Récupère tous les thèmes des comptes accessibles par l'utilisateur + template
 */
export const getThemes = async (req, res) => {
  try {
    // Récupérer tous les comptes accessibles par l'utilisateur
    const accounts = await getUserAccounts(req.userId);
    const accountIds = accounts.map((acc) => acc.id);

    // Ajouter le template (accessible à tous)
    const themes = await Theme.find({
      $or: [
        { accountId: { $in: accountIds } },
        { accountId: /^account-template/ },
      ],
    });

    res.json(themes.map((theme) => theme.toJSON()));
  } catch (error) {
    console.error("Erreur getThemes:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des thèmes" });
  }
};

/**
 * PUT /api/themes
 * Remplace tous les thèmes (sauvegarde complète depuis DrawerThemeManager)
 */
export const updateAllThemes = async (req, res) => {
  try {
    const themesObject = req.body;

    if (!themesObject || typeof themesObject !== "object") {
      return res.status(400).json({ error: "Format de données invalide" });
    }

    // Supprimer tous les thèmes existants
    await Theme.deleteMany({});

    // Créer les nouveaux thèmes
    const themesToInsert = Object.values(themesObject).map((theme) => ({
      id: theme.id,
      accountId: theme.accountId,
      name: theme.name,
      slug: theme.slug,
      subThemes: new Map(Object.entries(theme.subThemes || {})),
    }));

    await Theme.insertMany(themesToInsert);

    // Récupérer et renvoyer les thèmes mis à jour
    const updatedThemes = await Theme.find({});
    const result = {};
    updatedThemes.forEach((theme) => {
      result[theme.id] = theme.toJSON();
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur updateAllThemes:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour des thèmes" });
  }
};

/**
 * POST /api/themes/:themeId
 * Ajoute ou met à jour un thème spécifique
 */
export const upsertTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const themeData = req.body;

    if (!themeData.name || !themeData.slug) {
      return res.status(400).json({ error: "Nom et slug requis" });
    }

    const theme = await Theme.findOneAndUpdate(
      { id: themeId },
      {
        id: themeId,
        name: themeData.name,
        slug: themeData.slug,
        subThemes: new Map(Object.entries(themeData.subThemes || {})),
      },
      { upsert: true, new: true }
    );

    res.json(theme.toJSON());
  } catch (error) {
    console.error("Erreur upsertTheme:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la sauvegarde du thème" });
  }
};

/**
 * DELETE /api/themes/:themeId
 * Supprime un thème
 */
export const deleteTheme = async (req, res) => {
  try {
    const { themeId } = req.params;

    const result = await Theme.deleteOne({ id: themeId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Thème non trouvé" });
    }

    res.json({ success: true, message: "Thème supprimé" });
  } catch (error) {
    console.error("Erreur deleteTheme:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du thème" });
  }
};
