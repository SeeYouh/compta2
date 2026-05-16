import { fileURLToPath } from "url";
import multer from "multer";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "../../odyssee-images"));
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error("Type de fichier non supporté. Utilisez JPG ou PNG."));
  }
};

export const odysseeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo max
}).single("image");

// Upload en mémoire pour les catégories (validation des dimensions via Sharp)
export const categoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 500 * 1024 }, // 500 Ko max
}).single("image");
