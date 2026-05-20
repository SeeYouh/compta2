import { GenericItem } from '../models/GenericItem.js';

export const createItem = async (req, res) => {
  try {
    const { name, categoryId, folderId } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, error: "categoryId est requis" });
    }

    const item = new GenericItem({
      userId: req.userId,
      type: req.categoryType,
      categoryId,
      folderId: folderId || null,
      name: name || "Nouvel item",
    });

    const saved = await item.save();
    res.status(201).json({ success: true, item: saved });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const items = await GenericItem.find({
      userId: req.userId,
      type: req.categoryType,
      categoryId,
      deletedAt: null,
    }).lean();

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await GenericItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, type: req.categoryType },
      { $set: req.body },
      { new: true },
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, error: "Item introuvable" });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    await GenericItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, type: req.categoryType },
      { $set: { deletedAt: new Date() } },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
