import cors from "cors";
import express from "express";
import { fileURLToPath } from "url";
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";

import { config } from "./config/index.js";
import { connectDB } from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

// Configuration pour ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connexion à MongoDB
await connectDB();

// Middlewares de sécurité
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
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

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: "Trop de requêtes, veuillez réessayer plus tard",
});
app.use("/api/", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

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
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${config.server.env}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Gestion de l'arrêt propre
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM reçu, arrêt du serveur...");
  process.exit(0);
});
