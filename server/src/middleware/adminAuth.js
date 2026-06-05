/**
 * Middleware pour vérifier les droits d'administrateur
 * Doit être utilisé après le middleware authenticate
 * Requiert que req.userRole soit défini
 */
export const adminAuth = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      error: "Accès refusé. Droits d'administrateur requis.",
    });
  }
  next();
};
