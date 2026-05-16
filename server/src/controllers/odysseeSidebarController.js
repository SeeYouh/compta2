import { OdysseeFolder } from "../models/OdysseeFolder.js";
import { OdysseeSidebarLayout } from "../models/OdysseeSidebarLayout.js";

// GET /api/odyssee/sidebar
export const getSidebar = async (req, res) => {
  try {
    const userId = req.userId;
    const [layout, folders] = await Promise.all([
      OdysseeSidebarLayout.findOne({ userId }),
      OdysseeFolder.find({ userId }),
    ]);
    res.json({
      layout: layout?.items || [],
      folders: folders || [],
    });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/odyssee/sidebar/layout
export const updateLayout = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;
    const layout = await OdysseeSidebarLayout.findOneAndUpdate(
      { userId },
      { items },
      { upsert: true, new: true },
    );
    res.json({ layout: layout.items });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/odyssee/sidebar/folders
export const createFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryIds } = req.body;
    const folder = await OdysseeFolder.create({
      userId,
      categoryIds,
      isOpen: false,
    });
    res.status(201).json({ folder });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/odyssee/sidebar/folders/:id
export const updateFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = {};
    if (req.body.isOpen !== undefined) updates.isOpen = req.body.isOpen;
    if (req.body.categoryIds !== undefined)
      updates.categoryIds = req.body.categoryIds;
    if (req.body.color !== undefined) updates.color = req.body.color;
    if (req.body.name !== undefined) updates.name = req.body.name;
    const folder = await OdysseeFolder.findOneAndUpdate(
      { _id: req.params.id, userId },
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

// DELETE /api/odyssee/sidebar/folders/:id
export const deleteFolder = async (req, res) => {
  try {
    const userId = req.userId;
    await OdysseeFolder.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ message: "Dossier supprimé" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
