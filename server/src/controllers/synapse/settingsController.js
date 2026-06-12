import Settings from "../../models/synapse/Settings.js";

/**
 * GET /api/settings/:id
 * Récupère les paramètres par ID pour l'utilisateur connecté
 */
export const getSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOne({
      id,
      userId: req.userId,
    });

    if (!settings) {
      return res.status(404).json({ error: "Paramètres introuvables" });
    }

    res.json(settings);
  } catch (error) {
    console.error("Erreur getSettings:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des paramètres",
    });
  }
};

/**
 * POST /api/settings
 * Crée ou récupère les paramètres pour l'utilisateur connecté (upsert)
 */
export const createSettings = async (req, res) => {
  try {
    const { id, periodFilter } = req.body;

    if (!id) {
      return res.status(400).json({ error: "L'ID est requis" });
    }

    const settings = await Settings.findOneAndUpdate(
      { id, userId: req.userId },
      {
        $setOnInsert: {
          id,
          userId: req.userId,
          periodFilter: periodFilter || "all",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json(settings);
  } catch (error) {
    console.error("Erreur createSettings:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la création des paramètres",
    });
  }
};

/**
 * PATCH /api/settings/:id
 * Met à jour les paramètres pour l'utilisateur connecté
 */
export const updateSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { periodFilter } = req.body;

    const settings = await Settings.findOne({
      id,
      userId: req.userId,
    });

    if (!settings) {
      return res.status(404).json({ error: "Paramètres introuvables" });
    }

    if (periodFilter !== undefined) {
      settings.periodFilter = periodFilter;
    }

    await settings.save();

    res.json(settings);
  } catch (error) {
    console.error("Erreur updateSettings:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour des paramètres",
    });
  }
};

/**
 * PATCH /api/synapse/settings/color
 * Met à jour la couleur Synapse de l'utilisateur connecté
 */
export const updateUserColor = async (req, res) => {
  try {
    const { userColor } = req.body;

    if (!userColor) {
      return res.status(400).json({ error: "La couleur est requise" });
    }

    // Valider le format hex
    if (!/^#[0-9A-Fa-f]{6}$/.test(userColor)) {
      return res.status(400).json({ error: "Format de couleur invalide" });
    }

    // Trouver ou créer les settings pour cet utilisateur
    let settings = await Settings.findOne({
      id: "user-preferences",
      userId: req.userId,
    });

    if (!settings) {
      settings = new Settings({
        id: "user-preferences",
        userId: req.userId,
        userColor,
      });
    } else {
      settings.userColor = userColor;
    }

    await settings.save();

    res.json({ userColor: settings.userColor });
  } catch (error) {
    console.error("Erreur updateUserColor:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour de la couleur",
    });
  }
};

/**
 * GET /api/synapse/settings/color
 * Récupère la couleur Synapse de l'utilisateur connecté
 */
export const getUserColor = async (req, res) => {
  try {
    const settings = await Settings.findOne({
      id: "user-preferences",
      userId: req.userId,
    });

    const userColor = settings?.userColor || "#969696";
    res.json({ userColor });
  } catch (error) {
    console.error("Erreur getUserColor:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération de la couleur",
    });
  }
};

/**
 * DELETE /api/settings/:id
 * Supprime les paramètres pour l'utilisateur connecté
 */
export const deleteSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const settings = await Settings.findOneAndDelete({
      id,
      userId: req.userId,
    });

    if (!settings) {
      return res.status(404).json({ error: "Paramètres introuvables" });
    }

    res.json({ message: "Paramètres supprimés avec succès" });
  } catch (error) {
    console.error("Erreur deleteSettings:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la suppression des paramètres",
    });
  }
};
