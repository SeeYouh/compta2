import { OdysseeProductFolder } from '../../models/odyssee/OdysseeProductFolder.js';
import { PassengerItem } from '../../models/odyssee/PassengerItem.js';

export const createItem = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      aliasName,
      gender,
      birthDate,
      categoryId,
      folderId,
    } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, error: "categoryId est requis" });
    }

    const contact = req.body.contact ? JSON.parse(req.body.contact) : {};
    const address = req.body.address ? JSON.parse(req.body.address) : {};
    const infoSupp = req.body.infoSupp ? JSON.parse(req.body.infoSupp) : [];
    const infoSuppLayout = req.body.infoSuppLayout
      ? JSON.parse(req.body.infoSuppLayout)
      : [];
    const infoSuppFolders = req.body.infoSuppFolders
      ? JSON.parse(req.body.infoSuppFolders)
      : [];

    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || "Nouveau passager";

    const itemData = {
      name: fullName,
      tooltips: fullName,
      contentFilesData: {
        firstName: firstName || "",
        lastName: lastName || "",
        aliasName: { activate: !!aliasName, name: aliasName || "" },
        gender: gender || "NC",
        birthDate: birthDate || null,
        avatar: null,
        contact: {
          phone: contact.phone || "",
          email: contact.email || "",
          socialNetworks: contact.socialNetworks || [],
        },
        address: {
          country: address.country || "FR",
          postalCode: address.postalCode || "",
          city: address.city || "",
          address: address.address || "",
          addressComplement: address.addressComplement || "",
        },
        infoSupp,
        infoSuppLayout,
        infoSuppFolders,
      },
      categoryId,
      userId: req.userId,
      folderId: folderId || null,
    };

    if (req.body.color) itemData.color = req.body.color;

    if (req.file) {
      itemData.contentFilesData.avatar = `${req.protocol}://${req.get("host")}/odyssee-images/${req.file.filename}`;
    }

    const item = new PassengerItem(itemData);
    const savedItem = await item.save();

    res.status(201).json({
      success: true,
      message: "Passager créé avec succès !",
      product: savedItem,
    });
  } catch (error) {
    console.error("Erreur création passager:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur lors de la création du passager",
    });
  }
};

export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [products, folders] = await Promise.all([
      PassengerItem.findByUserAndCategory(req.userId, categoryId),
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
    console.error("Erreur récupération passagers par catégorie:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la récupération des passagers",
    });
  }
};

export const getAllUserItems = async (req, res) => {
  try {
    const items = await PassengerItem.findByUser(req.userId);

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
    console.error("Erreur récupération tous les passagers:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la récupération des passagers",
    });
  }
};

export const getOneItem = async (req, res) => {
  try {
    const item = await PassengerItem.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({ error: "Passager non trouvé" });
    }

    res.status(200).json({ success: true, product: item });
  } catch (error) {
    console.error("Erreur récupération passager:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await PassengerItem.findOne({
      _id: id,
      userId: req.userId,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "Passager non trouvé ou non autorisé" });
    }

    let updateData;

    if (req.body.firstName !== undefined || req.file) {
      // Soumission formulaire (FormData multipart)
      const {
        firstName,
        lastName,
        aliasName,
        gender,
        birthDate,
        categoryId,
        folderId,
      } = req.body;
      const contact = req.body.contact
        ? JSON.parse(req.body.contact)
        : existing.contentFilesData.contact;
      const address = req.body.address
        ? JSON.parse(req.body.address)
        : existing.contentFilesData.address;
      const infoSupp = req.body.infoSupp
        ? JSON.parse(req.body.infoSupp)
        : existing.contentFilesData.infoSupp;
      const infoSuppLayout = req.body.infoSuppLayout
        ? JSON.parse(req.body.infoSuppLayout)
        : existing.contentFilesData.infoSuppLayout;
      const infoSuppFolders = req.body.infoSuppFolders
        ? JSON.parse(req.body.infoSuppFolders)
        : existing.contentFilesData.infoSuppFolders;

      const fullName =
        [firstName, lastName].filter(Boolean).join(" ") || existing.name;

      updateData = {
        name: fullName,
        tooltips: fullName,
        contentFilesData: {
          firstName: firstName ?? existing.contentFilesData.firstName,
          lastName: lastName ?? existing.contentFilesData.lastName,
          aliasName:
            aliasName !== undefined
              ? { activate: !!aliasName, name: aliasName || "" }
              : existing.contentFilesData.aliasName,
          gender: gender ?? existing.contentFilesData.gender,
          birthDate: birthDate ?? existing.contentFilesData.birthDate,
          avatar: existing.contentFilesData.avatar,
          contact,
          address,
          infoSupp,
          infoSuppLayout,
          infoSuppFolders,
        },
      };

      if (categoryId) updateData.categoryId = categoryId;
      if (folderId !== undefined) updateData.folderId = folderId || null;
      if (req.body.color !== undefined) updateData.color = req.body.color;

      if (req.file) {
        updateData.contentFilesData.avatar = `${req.protocol}://${req.get("host")}/odyssee-images/${req.file.filename}`;
      }
    } else {
      // Mise à jour partielle JSON (DnD, repositionnement)
      updateData = { ...req.body };
      delete updateData._id;
    }

    const updated = await PassengerItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Passager mis à jour !",
      product: updated,
    });
  } catch (error) {
    console.error("Erreur mise à jour passager:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await PassengerItem.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!item) {
      return res
        .status(404)
        .json({ error: "Passager non trouvé ou non autorisé" });
    }

    await PassengerItem.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Passager supprimé !" });
  } catch (error) {
    console.error("Erreur suppression passager:", error);
    res.status(400).json({ error: error.message });
  }
};

export const createInfoSuppFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, categoryIds, name, color } = req.body;

    const newFolder = {
      _id: _id || `isf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name || "Nouveau dossier",
      color: color || "#5A8F7B",
      categoryIds: categoryIds || [],
      isOpen: true,
    };

    const updated = await PassengerItem.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $push: { "contentFilesData.infoSuppFolders": newFolder } },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "Passager non trouvé" });

    res.status(201).json({ success: true, folder: newFolder });
  } catch (error) {
    console.error("Erreur création dossier info supp:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateInfoSuppFolder = async (req, res) => {
  try {
    const { id, folderId } = req.params;
    const updates = req.body;

    const item = await PassengerItem.findOne({ _id: id, userId: req.userId });
    if (!item) return res.status(404).json({ error: "Passager non trouvé" });

    const folders = item.contentFilesData.infoSuppFolders || [];
    const idx = folders.findIndex((f) => f._id === folderId);
    if (idx === -1)
      return res.status(404).json({ error: "Dossier non trouvé" });

    folders[idx] = { ...folders[idx], ...updates };
    item.markModified("contentFilesData.infoSuppFolders");
    await item.save();

    res.status(200).json({ success: true, folder: folders[idx] });
  } catch (error) {
    console.error("Erreur mise à jour dossier info supp:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteInfoSuppFolder = async (req, res) => {
  try {
    const { id, folderId } = req.params;

    const item = await PassengerItem.findOne({ _id: id, userId: req.userId });
    if (!item) return res.status(404).json({ error: "Passager non trouvé" });

    item.contentFilesData.infoSuppFolders = (
      item.contentFilesData.infoSuppFolders || []
    ).filter((f) => f._id !== folderId);
    item.contentFilesData.infoSuppLayout = (
      item.contentFilesData.infoSuppLayout || []
    ).filter((i) => i.id !== folderId);
    item.markModified("contentFilesData.infoSuppFolders");
    item.markModified("contentFilesData.infoSuppLayout");
    await item.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur suppression dossier info supp:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateInfoSuppLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const item = await PassengerItem.findOne({ _id: id, userId: req.userId });
    if (!item) return res.status(404).json({ error: "Passager non trouvé" });

    item.contentFilesData.infoSuppLayout = items;
    item.markModified("contentFilesData.infoSuppLayout");
    await item.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour layout info supp:", error);
    res.status(400).json({ error: error.message });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Terme de recherche requis" });
    }

    const items = await PassengerItem.searchItems(q, req.userId);

    res
      .status(200)
      .json({ success: true, products: items, count: items.length });
  } catch (error) {
    console.error("Erreur recherche passagers:", error);
    res.status(500).json({ error: error.message });
  }
};
