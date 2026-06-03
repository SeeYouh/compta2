import express from "express";
import multer from "multer";

import { authenticate } from "../middleware/auth.js";
import {
  confirmImport,
  getMapping,
  parseCSV,
  previewCSV,
  saveMapping,
} from "../controllers/importController.js";

const router = express.Router();

// Multer en mémoire — fichiers CSV uniquement, 5 Mo max
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers CSV sont acceptés."));
    }
  },
});

// POST /api/import/parse — analyse brute du CSV (colonnes + aperçu)
router.post("/parse", authenticate, upload.single("file"), parseCSV);

// POST /api/import/preview — applique le mapping et détecte doublons/suggestions
router.post("/preview", authenticate, upload.single("file"), previewCSV);

// POST /api/import/confirm — insère les transactions validées
router.post("/confirm", authenticate, confirmImport);

// GET  /api/import/mapping — récupère le mapping mémorisé
router.get("/mapping", authenticate, getMapping);

// POST /api/import/mapping — sauvegarde le mapping
router.post("/mapping", authenticate, saveMapping);

export default router;
