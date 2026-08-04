import cors from 'cors';
import cron from 'node-cron';
import express from 'express';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import {
  errorHandler,
  notFound,
} from './middleware/errorHandler.js';
import { OdysseeProduct } from './models/odyssee/OdysseeProduct.js';
import { OdysseeProductFolder } from './models/odyssee/OdysseeProductFolder.js';
import { requestId } from './middleware/requestId.js';
import routes from './routes/index.js';

// Configuration pour ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Faire confiance au reverse proxy (nécessaire pour express-rate-limit sur hébergeur)
app.set("trust proxy", 1);

// Connexion à MongoDB
await connectDB();

// Middlewares de sécurité
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS - Autoriser toutes les origines en développement
const corsOptions = {
  origin: config.server.env === "development" ? true : config.cors.origin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400,
};

console.log("🔒 Configuration CORS:", {
  env: config.server.env,
  origin: corsOptions.origin,
  corsOriginFromEnv: config.cors.origin,
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: "Trop de requ\u00eates, veuillez r\u00e9essayer plus tard",
    });
  },
});
app.use("/api/", limiter);

// Limiteur dédié à l'authentification (SEC-10).
// Le limiteur global partage son budget avec tout le trafic applicatif légitime :
// le régler assez bas pour freiner une attaque par force brute pénaliserait
// l'usage normal. Deux limiteurs, deux objectifs.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // seules les tentatives ratées comptent
  handler: (req, res) => {
    console.warn(
      `[${req.id ?? "sans-id"}] Limite d'authentification atteinte — ${req.ip} sur ${req.originalUrl}`,
    );
    res.status(429).json({
      error: "Trop de tentatives d'authentification, réessayez dans 15 minutes",
      requestId: req.id ?? null,
    });
  },
});

// Identifiant de corrélation — posé avant tout le reste pour que les journaux
// d'erreur et les réponses puissent s'y référer.
app.use(requestId);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/resend-verification", authLimiter);
app.use("/api", routes);

// Servir les images Odyssée (toujours actif)
const odysseeImagesPath = path.join(__dirname, "../odyssee-images");
app.use("/odyssee-images", express.static(odysseeImagesPath));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// En production : servir les fichiers statiques React
if (config.server.env === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");

  // Servir les fichiers statiques
  app.use(express.static(clientBuildPath));

  // Wildcard pour React Router : toutes les routes non-API renvoient index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });

  console.log("📦 Fichiers React servis depuis:", clientBuildPath);
}

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${config.server.env}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Purge quotidienne à 3h du matin : suppression définitive des éléments en corbeille depuis > 30 jours
cron.schedule("0 3 * * *", async () => {
  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const [products, folders] = await Promise.all([
      OdysseeProduct.deleteMany({ deletedAt: { $lt: threshold } }),
      OdysseeProductFolder.deleteMany({ deletedAt: { $lt: threshold } }),
    ]);
    console.log(
      `🗑️  Purge corbeille : ${products.deletedCount} produit(s), ${folders.deletedCount} dossier(s) supprimés définitivement`,
    );
  } catch (err) {
    console.error("❌ Erreur purge corbeille:", err);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Le port ${PORT} est déjà utilisé. Arrêtez le processus existant avant de relancer.`,
    );
    process.exit(1);
  } else {
    throw err;
  }
});

// Filet de sécurité : toute promesse rejetée qui échappe aux handlers enveloppés
// par asyncHandler est journalisée au lieu de disparaître silencieusement.
process.on("unhandledRejection", (reason) => {
  console.error("❌ Promesse rejetée non gérée:", reason);
});

// Gestion de l'arrêt propre
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM reçu, arrêt du serveur...");
  server.close(() => process.exit(0));
});
