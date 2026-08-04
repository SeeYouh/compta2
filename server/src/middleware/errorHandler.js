import { detail, detailFields, isVerbose } from "../utils/errorDetail.js";

// `_next` est inutilisé mais NE DOIT PAS être retiré : Express reconnaît un
// gestionnaire d'erreurs à son arité de 4. Avec 3 paramètres, ce middleware
// serait traité comme un middleware ordinaire et ne recevrait jamais d'erreur.
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;

  // La trace serveur est TOUJOURS complète, quel que soit l'environnement, et
  // porte l'identifiant de corrélation : une erreur ne doit jamais disparaître.
  console.error(
    `[${req?.id ?? "sans-id"}] ${req?.method ?? "?"} ${req?.originalUrl ?? "?"} → ${status}`,
    err.stack ?? err,
  );

  res.status(status).json({
    // Hors production : le message réel, pour diagnostiquer immédiatement.
    // En production : un message neutre — le détail reste dans les journaux,
    // retrouvable par l'identifiant ci-dessous.
    error: detail(
      err.message || "Erreur serveur interne",
      status === 500 ? "Erreur serveur interne" : err.message || "Requête refusée",
    ),
    // Toujours renvoyé, dans les deux environnements : c'est ce qui permet à un
    // utilisateur de signaler une erreur de façon exploitable.
    requestId: req?.id ?? null,
    ...detailFields({ stack: isVerbose() ? err.stack : undefined }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: detail(
      `Route non trouvée : ${req.method} ${req.originalUrl}`,
      "Route non trouvée",
    ),
    requestId: req?.id ?? null,
  });
};
