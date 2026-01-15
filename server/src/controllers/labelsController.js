import Labels from "../models/Labels.js";

/**
 * GET /api/labels
 * Récupère les labels personnalisés de l'utilisateur connecté
 * Si aucun label n'existe, crée un nouveau document avec les valeurs par défaut
 */
export const getLabels = async (req, res) => {
  try {
    let labels = await Labels.findOne({ userId: req.userId });

    // Si l'utilisateur n'a pas encore de labels, créer avec les valeurs par défaut
    if (!labels) {
      labels = await Labels.create({ userId: req.userId });
    }

    res.json(labels);
  } catch (error) {
    console.error("Erreur getLabels:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des labels" });
  }
};

/**
 * PUT /api/labels
 * Met à jour les labels personnalisés de l'utilisateur connecté
 */
export const updateLabels = async (req, res) => {
  try {
    const updates = req.body;

    // Supprimer les champs système qui ne doivent pas être modifiés
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.__v;
    delete updates._id;

    let labels = await Labels.findOne({ userId: req.userId });

    if (!labels) {
      // Créer un nouveau document avec les valeurs fournies
      labels = await Labels.create({
        userId: req.userId,
        ...updates,
      });
    } else {
      // Mettre à jour le document existant
      Object.assign(labels, updates);
      await labels.save();
    }

    res.json(labels);
  } catch (error) {
    console.error("Erreur updateLabels:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour des labels" });
  }
};

/**
 * POST /api/labels/reset
 * Réinitialise les labels aux valeurs par défaut
 */
export const resetLabels = async (req, res) => {
  try {
    // Supprimer le document existant
    await Labels.deleteOne({ userId: req.userId });

    // Créer un nouveau document avec les valeurs par défaut
    const labels = await Labels.create({ userId: req.userId });

    res.json(labels);
  } catch (error) {
    console.error("Erreur resetLabels:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la réinitialisation des labels" });
  }
};
