import { fileURLToPath } from "url";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_DIMENSION = 256;

export const validateCategoryImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const metadata = await sharp(req.file.buffer).metadata();

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      return res.status(400).json({
        message: `L'image doit faire au maximum ${MAX_DIMENSION}×${MAX_DIMENSION} pixels (reçu : ${metadata.width}×${metadata.height} px).`,
      });
    }

    // Dimensions valides — écriture sur le disque
    const ext = req.file.mimetype === "image/png" ? "png" : "jpg";
    const filename = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const categoryDir = path.join(__dirname, "../../odyssee-images/categories");

    await fs.mkdir(categoryDir, { recursive: true });
    await fs.writeFile(path.join(categoryDir, filename), req.file.buffer);

    req.savedImagePath = `/odyssee-images/categories/${filename}`;
    next();
  } catch {
    return res
      .status(400)
      .json({ message: "Fichier image invalide ou corrompu." });
  }
};
