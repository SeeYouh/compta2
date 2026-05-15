import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

import { OdysseeProduct } from "../models/OdysseeProduct.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      aliasName,
      treatmentDuration,
      amountToAdminister,
      intakeTime,
      folder = "dossier1",
    } = req.body;

    const productData = {
      name: productName || "Nouveau produit",
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
      folder,
      userId: req.userId,
    };

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/odyssee-images/${req.file.filename}`;
      productData.img = [imageUrl];
      productData.contentFilesData.img = [
        { adress: imageUrl, alt: productName },
      ];
    }

    const product = new OdysseeProduct(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Produit créé avec succès !",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Erreur création produit Odyssée:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur lors de la création du produit",
    });
  }
};

export const getProductsByFolder = async (req, res) => {
  try {
    const { folder } = req.params;
    const products = await OdysseeProduct.findByUserAndFolder(
      req.userId,
      folder,
    );

    res.status(200).json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Erreur récupération produits par dossier:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la récupération des produits",
    });
  }
};

export const getAllUserProducts = async (req, res) => {
  try {
    const products = await OdysseeProduct.findByUser(req.userId);

    const productsByFolder = {
      dossier1: [],
      dossier2: [],
      dossier3: [],
      dossier4: [],
      dossier5: [],
      dossier6: [],
    };

    products.forEach((product) => {
      if (productsByFolder[product.folder]) {
        productsByFolder[product.folder].push(product);
      }
    });

    res.status(200).json({
      success: true,
      productsByFolder,
      totalCount: products.length,
    });
  } catch (error) {
    console.error("Erreur récupération tous les produits:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la récupération des produits",
    });
  }
};

export const getOneProduct = async (req, res) => {
  try {
    const product = await OdysseeProduct.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let productObject = req.body.product
      ? JSON.parse(req.body.product)
      : { ...req.body };
    delete productObject._id;

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/odyssee-images/${req.file.filename}`;
      productObject.img = [imageUrl];
    }

    const existing = await OdysseeProduct.findOne({
      _id: id,
      userId: req.userId,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "Produit non trouvé ou non autorisé" });
    }

    const updated = await OdysseeProduct.findByIdAndUpdate(id, productObject, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Produit mis à jour !",
        product: updated,
      });
  } catch (error) {
    console.error("Erreur mise à jour produit:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await OdysseeProduct.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ error: "Produit non trouvé ou non autorisé" });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({ success: true, message: "Produit supprimé !" });
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    res.status(400).json({ error: error.message });
  }
};

export const hardDeleteProduct = async (req, res) => {
  try {
    const product = await OdysseeProduct.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ error: "Produit non trouvé ou non autorisé" });
    }

    // Nettoyage des images
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
      .json({ success: true, message: "Produit supprimé définitivement !" });
  } catch (error) {
    console.error("Erreur suppression définitive produit:", error);
    res.status(400).json({ error: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Terme de recherche requis" });
    }

    const products = await OdysseeProduct.searchProducts(q, req.userId);

    res.status(200).json({ success: true, products, count: products.length });
  } catch (error) {
    console.error("Erreur recherche produits:", error);
    res.status(500).json({ error: error.message });
  }
};
