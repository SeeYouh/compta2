import { OdysseeProduct } from '../models/OdysseeProduct.js';
import { OdysseeProductFolder } from '../models/OdysseeProductFolder.js';

export const createProductFolder = async (req, res) => {
  try {
    const { categoryId, parentFolderId, name, color } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, error: "categoryId est requis" });
    }

    let depth = 0;
    if (parentFolderId) {
      const parent = await OdysseeProductFolder.findOne({
        _id: parentFolderId,
        userId: req.userId,
      });
      if (!parent) {
        return res
          .status(404)
          .json({ success: false, error: "Dossier parent introuvable" });
      }
      if (parent.depth >= 1) {
        return res.status(400).json({
          success: false,
          error: "Profondeur maximale atteinte (2 niveaux)",
        });
      }
      depth = 1;
    }

    const folder = new OdysseeProductFolder({
      userId: req.userId,
      categoryId,
      parentFolderId: parentFolderId || null,
      name: name || "Nouveau dossier",
      color: color || "#969696",
      depth,
    });

    const saved = await folder.save();
    res.status(201).json({ success: true, folder: saved });
  } catch (error) {
    console.error("Erreur création dossier produit:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur création dossier",
    });
  }
};

export const updateProductFolder = async (req, res) => {
  try {
    const folder = await OdysseeProductFolder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true },
    );

    if (!folder) {
      return res
        .status(404)
        .json({ success: false, error: "Dossier introuvable" });
    }

    res.status(200).json({ success: true, folder });
  } catch (error) {
    console.error("Erreur mise à jour dossier produit:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur mise à jour dossier",
    });
  }
};

export const reorderFolders = async (req, res) => {
  try {
    const { folderIds } = req.body;
    if (!Array.isArray(folderIds)) {
      return res
        .status(400)
        .json({ success: false, error: "folderIds doit être un tableau" });
    }

    await Promise.all(
      folderIds.map((id, index) =>
        OdysseeProductFolder.updateOne(
          { _id: id, userId: req.userId },
          { $set: { order: index } },
        ),
      ),
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur réordonnement dossiers:", error);
    res
      .status(400)
      .json({ success: false, error: error.message || "Erreur réordonnement" });
  }
};

export const deleteProductFolder = async (req, res) => {
  try {
    const folder = await OdysseeProductFolder.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!folder) {
      return res
        .status(404)
        .json({ success: false, error: "Dossier introuvable" });
    }

    // Récupérer les IDs des sous-dossiers (si dossier niveau 0)
    const subFolderIds = [];
    if (folder.depth === 0) {
      const subFolders = await OdysseeProductFolder.find({
        parentFolderId: folder._id,
        userId: req.userId,
      });
      subFolderIds.push(...subFolders.map((f) => f._id));
    }

    const allFolderIds = [folder._id, ...subFolderIds];

    // Supprimer les produits dans ces dossiers (soft delete)
    await OdysseeProduct.updateMany(
      { folderId: { $in: allFolderIds }, userId: req.userId },
      { $set: { isActive: false } },
    );

    // Supprimer les sous-dossiers puis le dossier
    await OdysseeProductFolder.deleteMany({ _id: { $in: allFolderIds } });

    res.status(200).json({ success: true, message: "Dossier supprimé" });
  } catch (error) {
    console.error("Erreur suppression dossier produit:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur suppression dossier",
    });
  }
};
