import { OdysseeBlock } from "../models/OdysseeBlock.js";

export const getAllBlocks = async (req, res) => {
  try {
    const userId = req.userId;
    // Récupère les blocs globaux (isDefault) + les blocs propres à l'utilisateur
    const blocks = await OdysseeBlock.find({
      isActive: true,
      $or: [{ isDefault: true }, { userId }],
    }).sort({ isDefault: -1, createdAt: 1 });

    res.json({ success: true, blocks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOneBlock = async (req, res) => {
  try {
    const block = await OdysseeBlock.findById(req.params.id);
    if (!block || !block.isActive) {
      return res
        .status(404)
        .json({ success: false, error: "Bloc introuvable" });
    }
    res.json({ success: true, block });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createBlock = async (req, res) => {
  try {
    const { name, sourceType, columns, rows, fieldPlacements } = req.body;

    if (!name || !sourceType || !columns || !rows) {
      return res.status(400).json({
        success: false,
        error: "name, sourceType, columns et rows sont requis",
      });
    }

    const block = await OdysseeBlock.create({
      name,
      sourceType,
      columns,
      rows,
      fieldPlacements: fieldPlacements || [],
      userId: req.userId,
      isDefault: false,
    });

    res.status(201).json({ success: true, block });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const block = await OdysseeBlock.findById(req.params.id);

    if (!block || !block.isActive) {
      return res
        .status(404)
        .json({ success: false, error: "Bloc introuvable" });
    }
    // On ne peut modifier que ses propres blocs
    if (block.isDefault || block.userId !== userId) {
      return res.status(403).json({ success: false, error: "Non autorisé" });
    }

    const { name, sourceType, columns, rows, fieldPlacements } = req.body;
    if (name !== undefined) block.name = name;
    if (sourceType !== undefined) block.sourceType = sourceType;
    if (columns !== undefined) block.columns = columns;
    if (rows !== undefined) block.rows = rows;
    if (fieldPlacements !== undefined) block.fieldPlacements = fieldPlacements;

    await block.save();
    res.json({ success: true, block });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const block = await OdysseeBlock.findById(req.params.id);

    if (!block || !block.isActive) {
      return res
        .status(404)
        .json({ success: false, error: "Bloc introuvable" });
    }
    if (block.isDefault || block.userId !== userId) {
      return res.status(403).json({ success: false, error: "Non autorisé" });
    }

    block.isActive = false;
    await block.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
