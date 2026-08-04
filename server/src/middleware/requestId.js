import { randomUUID } from "crypto";

/**
 * Attache un identifiant de corrélation à chaque requête.
 *
 * C'est la pièce qui rend une erreur remontée par un utilisateur exploitable :
 * il communique l'identifiant affiché, on retrouve la trace serveur exacte.
 * Sans lui, « ça a planté » reste ininterprétable.
 *
 * L'identifiant est aussi renvoyé en en-tête `X-Request-Id`, déjà exposé par la
 * configuration CORS du projet.
 */
export const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] ?? randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
};
