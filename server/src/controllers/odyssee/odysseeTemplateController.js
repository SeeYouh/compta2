import { OdysseeProductFolder } from "../../models/odyssee/OdysseeProductFolder.js";
import { OdysseeTemplate } from "../../models/odyssee/OdysseeTemplate.js";

export const getAllUserTemplates = async (req, res) => {
  try {
    const templates = await OdysseeTemplate.find({
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTemplatesByCategory = async (req, res) => {
  try {
    const templates = await OdysseeTemplate.find({
      userId: req.userId,
      categoryId: req.params.categoryId,
      isActive: true,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOneTemplate = async (req, res) => {
  try {
    const template = await OdysseeTemplate.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    }).populate("pages.blocks.blockId");

    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template introuvable" });
    }
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const {
      productName,
      aliasName,
      categoryId,
      folderId,
      color,
      margins,
      pages,
    } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, error: "categoryId est requis" });
    }
    if (!productName) {
      return res
        .status(400)
        .json({ success: false, error: "productName est requis" });
    }

    // Vérification du dossier si fourni
    if (folderId) {
      const folder = await OdysseeProductFolder.findById(folderId);
      if (!folder) {
        return res
          .status(404)
          .json({ success: false, error: "Dossier introuvable" });
      }
    }

    const template = await OdysseeTemplate.create({
      name: productName,
      productName,
      aliasName: aliasName || { activate: false, name: "" },
      categoryId,
      folderId: folderId || null,
      userId: req.userId,
      color: color || "#969696",
      margins: margins || { top: 10, bottom: 10, left: 10, right: 10 },
      pages: pages || [{ columns: 4, rows: 10, blocks: [] }],
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const template = await OdysseeTemplate.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });

    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template introuvable" });
    }

    const {
      productName,
      aliasName,
      categoryId,
      folderId,
      color,
      margins,
      pages,
    } = req.body;

    if (productName !== undefined) {
      template.name = productName;
      template.productName = productName;
    }
    if (aliasName !== undefined) template.aliasName = aliasName;
    if (categoryId !== undefined) template.categoryId = categoryId;
    if (folderId !== undefined) template.folderId = folderId;
    if (color !== undefined) template.color = color;
    if (margins !== undefined) template.margins = margins;
    if (pages !== undefined) template.pages = pages;

    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await OdysseeTemplate.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });

    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template introuvable" });
    }

    template.isActive = false;
    template.deletedAt = new Date();
    await template.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchTemplates = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, templates: [] });

    const templates = await OdysseeTemplate.find({
      userId: req.userId,
      isActive: true,
      deletedAt: null,
      $text: { $search: q },
    });

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
