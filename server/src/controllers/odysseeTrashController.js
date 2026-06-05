import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

import { OdysseeCategory } from "../models/OdysseeCategory.js";
import { OdysseeProduct } from "../models/OdysseeProduct.js";
import { OdysseeProductFolder } from "../models/OdysseeProductFolder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/odyssee/trash
export const getTrash = async (req, res) => {
  try {
    const userId = req.userId;

    const [allProducts, folders] = await Promise.all([
      OdysseeProduct.find({ userId, deletedAt: { $ne: null } })
        .populate("categoryId", "name")
        .lean(),
      OdysseeProductFolder.find({ userId, deletedAt: { $ne: null } })
        .populate("categoryId", "name")
        .lean(),
    ]);

    const folderIds = new Set(folders.map((f) => f._id.toString()));
    const folderProductsMap = {};
    const standaloneProducts = [];

    for (const product of allProducts) {
      const fId = product.folderId?.toString();
      if (fId && folderIds.has(fId)) {
        if (!folderProductsMap[fId]) folderProductsMap[fId] = [];
        folderProductsMap[fId].push(product);
      } else {
        standaloneProducts.push(product);
      }
    }

    const foldersWithProducts = folders.map((f) => ({
      ...f,
      products: folderProductsMap[f._id.toString()] || [],
    }));

    res.status(200).json({
      success: true,
      products: standaloneProducts,
      folders: foldersWithProducts,
    });
  } catch (error) {
    console.error("Erreur récupération corbeille:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/odyssee/trash/products/:id/restore
export const restoreProduct = async (req, res) => {
  try {
    const product = await OdysseeProduct.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deletedAt: { $ne: null } },
      { $set: { deletedAt: null, folderId: null } },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produit introuvable dans la corbeille",
      });
    }

    // Restaurer la catégorie si elle est aussi en corbeille
    if (product.categoryId) {
      await OdysseeCategory.updateOne(
        {
          _id: product.categoryId,
          userId: req.userId,
          deletedAt: { $ne: null },
        },
        { $set: { deletedAt: null } },
      );
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Erreur restauration produit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/odyssee/trash/folders/:id/restore
export const restoreFolder = async (req, res) => {
  try {
    const folder = await OdysseeProductFolder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true },
    );

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: "Dossier introuvable dans la corbeille",
      });
    }

    // Restaurer aussi les produits qui étaient dans ce dossier
    await OdysseeProduct.updateMany(
      { folderId: folder._id, userId: req.userId, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
    );

    // Restaurer la catégorie si elle est aussi en corbeille
    if (folder.categoryId) {
      await OdysseeCategory.updateOne(
        {
          _id: folder.categoryId,
          userId: req.userId,
          deletedAt: { $ne: null },
        },
        { $set: { deletedAt: null } },
      );
    }

    res.status(200).json({ success: true, folder });
  } catch (error) {
    console.error("Erreur restauration dossier:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/odyssee/trash/products/:id
export const permanentDeleteProduct = async (req, res) => {
  try {
    const product = await OdysseeProduct.findOne({
      _id: req.params.id,
      userId: req.userId,
      deletedAt: { $ne: null },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produit introuvable dans la corbeille",
      });
    }

    // Supprimer les fichiers image
    if (product.img && product.img.length > 0) {
      product.img.forEach((imageUrl) => {
        const filename = imageUrl.split("/odyssee-images/")[1];
        if (filename) {
          const imagePath = path.join(
            __dirname,
            "../../odyssee-images",
            filename,
          );
          fs.unlink(imagePath, (err) => {
            if (err) console.error("Erreur suppression image:", err);
          });
        }
      });
    }

    await OdysseeProduct.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "Produit supprimé définitivement" });
  } catch (error) {
    console.error("Erreur suppression définitive produit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/odyssee/trash/folders/:id
export const permanentDeleteFolder = async (req, res) => {
  try {
    const folder = await OdysseeProductFolder.findOne({
      _id: req.params.id,
      userId: req.userId,
      deletedAt: { $ne: null },
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: "Dossier introuvable dans la corbeille",
      });
    }

    // Supprimer définitivement les produits du dossier encore en corbeille
    const products = await OdysseeProduct.find({
      folderId: folder._id,
      userId: req.userId,
      deletedAt: { $ne: null },
    });

    for (const product of products) {
      if (product.img && product.img.length > 0) {
        product.img.forEach((imageUrl) => {
          const filename = imageUrl.split("/odyssee-images/")[1];
          if (filename) {
            const imagePath = path.join(
              __dirname,
              "../../odyssee-images",
              filename,
            );
            fs.unlink(imagePath, (err) => {
              if (err) console.error("Erreur suppression image:", err);
            });
          }
        });
      }
    }

    await OdysseeProduct.deleteMany({
      folderId: folder._id,
      userId: req.userId,
      deletedAt: { $ne: null },
    });
    await OdysseeProductFolder.findByIdAndDelete(folder._id);

    res
      .status(200)
      .json({ success: true, message: "Dossier supprimé définitivement" });
  } catch (error) {
    console.error("Erreur suppression définitive dossier:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
