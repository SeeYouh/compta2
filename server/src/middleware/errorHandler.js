export const errorHandler = (err, req, res, next) => {
  console.error("Erreur:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
};
