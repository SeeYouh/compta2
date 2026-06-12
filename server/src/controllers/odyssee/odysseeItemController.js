import { fileURLToPath } from "url";
import path from "path";

import { OdysseeProductFolder } from "../../models/odyssee/OdysseeProductFolder.js";
import { OdysseeItem } from "../../models/odyssee/OdysseeItem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createItem = async (req, res) => {
  try {
    const {
      productName,
      aliasName,
      treatmentDuration,
      amountToAdminister,
      intakeTime,
      categoryId,
      folderId,
      color,
    } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, error: "categoryId est requis" });
    }

    const itemData = {
      name: productName || "Nouveau voyage",
      img: [],
      tooltips: `Info ${productName}`,
      contentFilesData: {
        productName,
        aliasName: {
          activate: !!aliasName,
          name: aliasName || "",
        },
        img: [],
        treatmentDuration: Number(treatmentDuration) || 1,
        amountToAdminister: Number(amountToAdminister) || 1,
        intakeTime: {
          mode: intakeTime?.mode || "normal",
          checkedMoments: intakeTime?.checkedMoments || [],
          selectedTime: intakeTime?.selectedTime || "",
          durationBefore: intakeTime?.durationBefore || 0,
          durationAfter: intakeTime?.durationAfter || 0,
          nightDuration: intakeTime?.nightDuration || 0,
          advancedMode: intakeTime?.mode === "advanced",
          daysTime:
            intakeTime?.checkedMoments?.map((moment) => ({
              name: moment,
              activateTime: true,
            })) || [],
        },
      },
      categoryId,
      color: color || "",
      userId: req.userId,
      folderId: folderId || null,
    };

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/odyssee-images/${req.file.filename}`;
      itemData.img = [imageUrl];
      itemData.contentFilesData.img = [{ adress: imageUrl, alt: productName }];
    }

    const item = new OdysseeItem(itemData);
    const savedItem = await item.save();

    res.status(201).json({
      success: true,
      message: "Voyage créé avec succès !",
      product: savedItem,
    });
  } catch (error) {
    console.error("Erreur création voyage:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur lors de la création du voyage",
    });
  }
};

export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [products, folders] = await Promise.all([
      OdysseeItem.findByUserAndCategory(req.userId, categoryId),
      OdysseeProductFolder.find({
        userId: req.userId,
        categoryId,
        deletedAt: null,
      }).lean(),
    ]);

    res.status(200).json({
      success: true,
      products,
      folders,
      count: products.length,
    });
  } catch (error) {
    console.error("Erreur récupération voyages par catégorie:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la récupération des voyages",
    });
  }
};

export const getAllUserItems = async (req, res) => {
  try {
    const items = await OdysseeItem.findByUser(req.userId);

    const itemsByCategory = {};
    items.forEach((item) => {
      const key = item.categoryId.toString();
      if (!itemsByCategory[key]) itemsByCategory[key] = [];
      itemsByCategory[key].push(item);
    });

    res.status(200).json({
      success: true,
      itemsByCategory,
      totalCount: items.length,
    });
  } catch (error) {
    console.error("Erreur récupération tous les voyages:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la récupération des voyages",
    });
  }
};

export const getOneItem = async (req, res) => {
  try {
    const item = await OdysseeItem.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    res.status(200).json({ success: true, product: item });
  } catch (error) {
    console.error("Erreur récupération voyage:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    let itemObject = req.body.product
      ? JSON.parse(req.body.product)
      : { ...req.body };
    delete itemObject._id;

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/odyssee-images/${req.file.filename}`;
      itemObject.img = [imageUrl];
    }

    const existing = await OdysseeItem.findOne({
      _id: id,
      userId: req.userId,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "Voyage non trouvé ou non autorisé" });
    }

    const updated = await OdysseeItem.findByIdAndUpdate(id, itemObject, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Voyage mis à jour !",
      product: updated,
    });
  } catch (error) {
    console.error("Erreur mise à jour voyage:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await OdysseeItem.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!item) {
      return res
        .status(404)
        .json({ error: "Voyage non trouvé ou non autorisé" });
    }

    await OdysseeItem.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Voyage supprimé !" });
  } catch (error) {
    console.error("Erreur suppression voyage:", error);
    res.status(400).json({ error: error.message });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Terme de recherche requis" });
    }

    const items = await OdysseeItem.searchItems(q, req.userId);

    res
      .status(200)
      .json({ success: true, products: items, count: items.length });
  } catch (error) {
    console.error("Erreur recherche voyages:", error);
    res.status(500).json({ error: error.message });
  }
};
