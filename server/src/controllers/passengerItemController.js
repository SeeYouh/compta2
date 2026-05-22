import { OdysseeProductFolder } from "../models/OdysseeProductFolder.js";
import { PassengerItem } from "../models/PassengerItem.js";

export const createItem = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      alias,
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

    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || "Nouveau passager";

    const itemData = {
      name: fullName,
      tooltips: fullName,
      contentFilesData: {
        firstName: firstName || "",
        lastName: lastName || "",
        alias: alias || "",
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
      },
      categoryId,
      userId: req.userId,
      folderId: folderId || null,
    };

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
        alias,
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

      const fullName =
        [firstName, lastName].filter(Boolean).join(" ") || existing.name;

      updateData = {
        name: fullName,
        tooltips: fullName,
        contentFilesData: {
          firstName: firstName ?? existing.contentFilesData.firstName,
          lastName: lastName ?? existing.contentFilesData.lastName,
          alias: alias ?? existing.contentFilesData.alias,
          gender: gender ?? existing.contentFilesData.gender,
          birthDate: birthDate ?? existing.contentFilesData.birthDate,
          avatar: existing.contentFilesData.avatar,
          contact,
          address,
          infoSupp,
        },
      };

      if (categoryId) updateData.categoryId = categoryId;
      if (folderId !== undefined) updateData.folderId = folderId || null;

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
