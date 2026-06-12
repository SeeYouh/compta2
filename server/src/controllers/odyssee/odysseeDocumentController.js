import { OdysseeDocument } from "../../models/odyssee/OdysseeDocument.js";
import { OdysseeProductFolder } from "../../models/odyssee/OdysseeProductFolder.js";
import { OdysseeTemplate } from "../../models/odyssee/OdysseeTemplate.js";
import { OdysseeProduct } from "../../models/odyssee/OdysseeProduct.js";
import { PassengerItem } from "../../models/odyssee/PassengerItem.js";

export const getDocumentByTemplateId = async (req, res) => {
  try {
    const document = await OdysseeDocument.findOne({
      templateId: req.params.templateId,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });

    if (!document) {
      return res.json({ success: true, document: null });
    }

    // Résolution des entités liées selon leur type (PassengerItem / OdysseeProduct)
    const passengerIds = document.bindings
      .filter((b) => b.sourceType === "passenger")
      .map((b) => b.sourceId);
    const productIds = document.bindings
      .filter((b) => b.sourceType === "product")
      .map((b) => b.sourceId);

    const [template, passengers, products] = await Promise.all([
      OdysseeTemplate.findById(document.templateId).populate("pages.blocks.blockId"),
      passengerIds.length
        ? PassengerItem.find({ _id: { $in: passengerIds } })
        : [],
      productIds.length
        ? OdysseeProduct.find({ _id: { $in: productIds } })
        : [],
    ]);

    const bindingEntities = Object.fromEntries(
      [...passengers, ...products].map((e) => [e._id.toString(), e]),
    );

    res.json({ success: true, document, template, bindingEntities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllUserDocuments = async (req, res) => {
  try {
    const documents = await OdysseeDocument.find({
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDocumentsByCategory = async (req, res) => {
  try {
    const documents = await OdysseeDocument.find({
      userId: req.userId,
      categoryId: req.params.categoryId,
      isActive: true,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOneDocument = async (req, res) => {
  try {
    const document = await OdysseeDocument.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document introuvable" });
    }

    // Charge également le template associé avec ses blocs
    const template = await OdysseeTemplate.findById(
      document.templateId,
    ).populate("pages.blocks.blockId");

    res.json({ success: true, document, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const {
      productName,
      aliasName,
      categoryId,
      folderId,
      color,
      templateId,
      bindings,
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
    if (!templateId) {
      return res
        .status(400)
        .json({ success: false, error: "templateId est requis" });
    }

    const template = await OdysseeTemplate.findOne({
      _id: templateId,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template introuvable" });
    }

    if (folderId) {
      const folder = await OdysseeProductFolder.findById(folderId);
      if (!folder) {
        return res
          .status(404)
          .json({ success: false, error: "Dossier introuvable" });
      }
    }

    // Vérification : 1 passager max
    const passengerBindings = (bindings || []).filter(
      (b) => b.sourceType === "passenger",
    );
    if (passengerBindings.length > 1) {
      return res.status(400).json({
        success: false,
        error: "Un document ne peut contenir qu'un seul passager",
      });
    }

    const document = await OdysseeDocument.create({
      name: productName,
      productName,
      aliasName: aliasName || { activate: false, name: "" },
      categoryId,
      folderId: folderId || null,
      userId: req.userId,
      color: color || "#969696",
      templateId,
      bindings: bindings || [],
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const document = await OdysseeDocument.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document introuvable" });
    }

    const { productName, aliasName, categoryId, folderId, color, bindings } =
      req.body;

    // Vérification : 1 passager max
    if (bindings !== undefined) {
      const passengerBindings = bindings.filter(
        (b) => b.sourceType === "passenger",
      );
      if (passengerBindings.length > 1) {
        return res.status(400).json({
          success: false,
          error: "Un document ne peut contenir qu'un seul passager",
        });
      }
      document.bindings = bindings;
    }

    if (productName !== undefined) {
      document.name = productName;
      document.productName = productName;
    }
    if (aliasName !== undefined) document.aliasName = aliasName;
    if (categoryId !== undefined) document.categoryId = categoryId;
    if (folderId !== undefined) document.folderId = folderId;
    if (color !== undefined) document.color = color;

    await document.save();
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await OdysseeDocument.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true,
      deletedAt: null,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document introuvable" });
    }

    document.isActive = false;
    document.deletedAt = new Date();
    await document.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, documents: [] });

    const documents = await OdysseeDocument.find({
      userId: req.userId,
      isActive: true,
      deletedAt: null,
      $text: { $search: q },
    });

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
