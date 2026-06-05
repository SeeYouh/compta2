import { OdysseeFolder } from "../models/OdysseeFolder.js";
import { OdysseeSidebarLayout } from "../models/OdysseeSidebarLayout.js";

// GET /api/odyssee/:type/sidebar
export const getSidebar = async (req, res) => {
  try {
    const userId = req.userId;
    const type = req.categoryType;
    const [layout, folders] = await Promise.all([
      OdysseeSidebarLayout.findOne({ userId, type }),
      OdysseeFolder.find({ userId, type }),
    ]);
    res.json({
      layout: layout?.items || [],
      folders: folders || [],
    });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/odyssee/:type/sidebar/layout
export const updateLayout = async (req, res) => {
  try {
    const userId = req.userId;
    const type = req.categoryType;
    const { items } = req.body;
    const layout = await OdysseeSidebarLayout.findOneAndUpdate(
      { userId, type },
      { $set: { items } },
      { upsert: true, new: true },
    );
    res.json({ layout: layout.items });
  } catch (error) {
    console.error("updateLayout error:", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/odyssee/:type/sidebar/folders
export const createFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const type = req.categoryType;
    const { categoryIds } = req.body;
    const folder = await OdysseeFolder.create({
      userId,
      type,
      categoryIds,
      isOpen: false,
    });
    res.status(201).json({ folder });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/odyssee/:type/sidebar/folders/:id
export const updateFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const type = req.categoryType;
    const updates = {};
    if (req.body.isOpen !== undefined) updates.isOpen = req.body.isOpen;
    if (req.body.categoryIds !== undefined)
      updates.categoryIds = req.body.categoryIds;
    if (req.body.color !== undefined) updates.color = req.body.color;
    if (req.body.name !== undefined) updates.name = req.body.name;
    const folder = await OdysseeFolder.findOneAndUpdate(
      { _id: req.params.id, userId, type },
      updates,
      { new: true },
    );
    if (!folder)
      return res.status(404).json({ message: "Dossier introuvable" });
    res.json({ folder });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE /api/odyssee/:type/sidebar/folders/:id
export const deleteFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const type = req.categoryType;
    await OdysseeFolder.findOneAndDelete({ _id: req.params.id, userId, type });
    res.json({ message: "Dossier supprimé" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
