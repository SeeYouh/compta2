import { OdysseeCategory } from "../models/OdysseeCategory.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = new OdysseeCategory({
      userId: req.userId,
      name,
      description,
      image: req.savedImagePath || null,
    });
    const saved = await category.save();

    res
      .status(201)
      .json({ message: "Catégorie créée avec succès !", category: saved });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Vous avez déjà une catégorie avec ce nom" });
    }
    res.status(400).json({
      error: error.message || "Erreur lors de la création de la catégorie",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const updates = { name, description };
    if (req.savedImagePath) updates.image = req.savedImagePath;

    const category = await OdysseeCategory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ error: "Catégorie non trouvée ou non autorisée" });
    }

    res.status(200).json({ message: "Catégorie mise à jour !", category });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Vous avez déjà une catégorie avec ce nom" });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await OdysseeCategory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: false },
      { new: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ error: "Catégorie non trouvée ou non autorisée" });
    }

    res.status(200).json({ message: "Catégorie supprimée !", category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const hardDeleteCategory = async (req, res) => {
  try {
    const category = await OdysseeCategory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Catégorie non trouvée ou non autorisée" });
    }

    res
      .status(200)
      .json({ message: "Catégorie supprimée définitivement !", category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOneCategory = async (req, res) => {
  try {
    const category = await OdysseeCategory.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Catégorie non trouvée ou non autorisée" });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await OdysseeCategory.find({
      userId: req.userId,
      isActive: true,
    }).sort({ createdAt: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Terme de recherche requis" });
    }

    const categories = await OdysseeCategory.find({
      userId: req.userId,
      isActive: true,
      name: { $regex: q, $options: "i" },
    });

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
