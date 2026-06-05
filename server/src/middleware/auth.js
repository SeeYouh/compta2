import jwt from "jsonwebtoken";

/**
 * Middleware d'authentification JWT
 * Vérifie le token et ajoute userId à req
 */
export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token d'authentification manquant",
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter l'userId et le rôle à la requête
    req.userId = decoded.userId;
    req.userRole = decoded.role || "user";

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token invalide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expiré",
      });
    }

    console.error("Erreur authenticate:", error);
    res.status(500).json({
      error: "Erreur serveur lors de l'authentification",
    });
  }
};

/**
 * Middleware optionnel d'authentification
 * N'échoue pas si pas de token, mais ajoute userId si présent
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role || "user";
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans userId
    next();
  }
};
