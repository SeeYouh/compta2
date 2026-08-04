import UserColorPreferences from "../../models/synapse/UserColorPreferences.js";

const MAX_HISTORY = 30;

// Validation basique du format hex
const isValidHex = (color) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);

// GET /api/color-preferences
// Retourne history + variables + defaults de l'utilisateur connecté
export const getColorPreferences = async (req, res) => {
  try {
    let prefs = await UserColorPreferences.findOne({ userId: req.userId });

    if (!prefs) {
      prefs = await UserColorPreferences.create({ userId: req.userId });
    }

    res.json({
      history: prefs.history,
      variables: Object.fromEntries(prefs.variables),
      defaults: Object.fromEntries(prefs.defaults),
    });
  } catch {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des préférences de couleur.",
      });
  }
};

// PATCH /api/color-preferences/variable
// Body : { cssVar: "--color-primary", value: "#3b82f6" }
export const updateVariable = async (req, res) => {
  const { cssVar, value } = req.body;

  if (!cssVar || typeof cssVar !== "string") {
    return res.status(400).json({ error: "cssVar est requis." });
  }
  if (!isValidHex(value)) {
    return res.status(400).json({ error: "Valeur hex invalide." });
  }

  try {
    const prefs = await UserColorPreferences.findOneAndUpdate(
      { userId: req.userId },
      { $set: { [`variables.${cssVar}`]: value } },
      { upsert: true, new: true },
    );

    res.json({ variables: Object.fromEntries(prefs.variables) });
  } catch {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la variable." });
  }
};

// PATCH /api/color-preferences/history
// Body : { color: "#ff0000" }
// Ajoute la couleur à l'historique (FIFO, sans doublon, max 30)
export const addToHistory = async (req, res) => {
  const { color } = req.body;

  if (!isValidHex(color)) {
    return res.status(400).json({ error: "Valeur hex invalide." });
  }

  try {
    let prefs = await UserColorPreferences.findOne({ userId: req.userId });

    if (!prefs) {
      prefs = await UserColorPreferences.create({ userId: req.userId });
    }

    // Supprimer si déjà présent (évite les doublons)
    prefs.history = prefs.history.filter((c) => c !== color);

    // Ajouter en tête
    prefs.history.unshift(color);

    // Limiter à MAX_HISTORY
    if (prefs.history.length > MAX_HISTORY) {
      prefs.history = prefs.history.slice(0, MAX_HISTORY);
    }

    await prefs.save();

    res.json({ history: prefs.history });
  } catch {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'historique." });
  }
};

// PATCH /api/color-preferences/default/:contextKey
// Body : { color: "#000000" }
export const setDefault = async (req, res) => {
  const { contextKey } = req.params;
  const { color } = req.body;

  if (!contextKey || typeof contextKey !== "string") {
    return res.status(400).json({ error: "contextKey est requis." });
  }
  if (!isValidHex(color)) {
    return res.status(400).json({ error: "Valeur hex invalide." });
  }

  try {
    const prefs = await UserColorPreferences.findOneAndUpdate(
      { userId: req.userId },
      { $set: { [`defaults.${contextKey}`]: color } },
      { upsert: true, new: true },
    );

    res.json({ defaults: Object.fromEntries(prefs.defaults) });
  } catch {
    res
      .status(500)
      .json({
        error: "Erreur lors de la mise à jour de la couleur par défaut.",
      });
  }
};
