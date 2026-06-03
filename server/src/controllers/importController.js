import { v4 as uuidv4 } from "uuid";

import { CsvMapping } from "../models/CsvMapping.js";
import { Transaction } from "../models/Transaction.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Supprime les guillemets RFC 4180 entourant une cellule CSV.
 * "valeur" → valeur   |   "" dans la valeur → " (guillemet échappé)
 */
function stripQuotes(str) {
  const s = str.trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}

/**
 * Détecte le séparateur le plus probable en comptant les occurrences
 * sur la première ligne du CSV.
 */
function detectSeparator(firstLine) {
  const candidates = [";", ",", "\t"];
  let best = ";";
  let max = 0;
  for (const sep of candidates) {
    const count = firstLine.split(sep).length - 1;
    if (count > max) {
      max = count;
      best = sep;
    }
  }
  return best;
}

/**
 * Parse un fichier CSV (Buffer) en tableau de lignes (tableaux de cellules).
 * Retourne { separator, headers, rows }.
 */
function parseBuffer(buffer) {
  const text = buffer
    .toString("utf-8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  if (lines.length === 0) return { separator: ";", headers: [], rows: [] };

  const separator = detectSeparator(lines[0]);
  const headers = lines[0].split(separator).map((h) => stripQuotes(h));
  const rows = lines
    .slice(1)
    .map((line) => line.split(separator).map((cell) => stripQuotes(cell)));

  return { separator, headers, rows };
}

/**
 * Nettoie une désignation bancaire brute :
 * - CHQ 1234567 → "Chèque 1234567"
 * - Retire le préfixe de moyen de paiement (CARTE, VIR, PRLV…)
 * - Retire les dates JJ/MM intégrées dans le libellé
 */
function cleanDesignation(raw) {
  const s = raw.trim();

  // Chèque : CHQ / CHEQUE → "Chèque XXXXXXX"
  const chequeMatch = s.match(/^(?:CHQ|CHEQUE|CH[EÈ]QUE)\s+(.+)$/i);
  if (chequeMatch) return `Chèque ${chequeMatch[1].trim()}`;

  // Retirer le préfixe de moyen de paiement, puis éventuel "SEPA"
  let cleaned = s
    .replace(
      /^(CARTE|CB|VIR|VIREMENT|PRLV|PR[EÉ]L[EÈ]VEMENT|PRELEVEMENT)\s+/i,
      "",
    )
    .replace(/^SEPA\s+/i, "");

  // Retirer les dates JJ/MM
  cleaned = cleaned.replace(/\b\d{2}\/\d{2}\b\s*/g, "");

  const result = cleaned.trim();
  return result || s; // fallback sur l'original si le nettoyage produit une chaîne vide
}

/**
 * Détecte le moyen de paiement depuis la désignation brute.
 * Retourne la valeur exacte utilisée par PaymentSelector, ou null.
 */
function detectPayment(raw) {
  const s = raw.trim();
  if (/^(CARTE|CB)\s/i.test(s)) return "Carte";
  if (/^(VIR|VIREMENT)\s/i.test(s)) return "Virement";
  if (/^(PRLV|PR[EÉ]L[EÈ]VEMENT|PRELEVEMENT)\s/i.test(s)) return "Prélèvement";
  if (/^(CHQ|CHEQUE|CH[EÈ]QUE)\s/i.test(s)) return "Chèque";
  return null;
}

/**
 * Applique le mapping pour extraire { date, designation, recette, depense }
 * depuis une ligne CSV brute (tableau de cellules).
 */
function extractFromRow(row, headers, mapping) {
  const cell = (colName) => {
    // Normalise le nom de colonne : supprime les guillemets éventuels d'un mapping sauvegardé
    const normalized = stripQuotes(colName);
    const idx = headers.indexOf(normalized);
    return idx >= 0 ? (row[idx] || "").trim() : "";
  };

  // Normalise un montant : retire espaces/insécables (séparateurs de milliers)
  // et convertit la virgule décimale en point.
  const parseAmount = (raw) => {
    const cleaned = raw.replace(/[\s\u00a0]/g, "").replace(",", ".");
    return parseFloat(cleaned);
  };

  const date = cell(mapping.colDate);
  const designation = cell(mapping.colDesignation);

  let recette = null;
  let depense = null;

  if (mapping.montantType === "double") {
    const debit = parseAmount(cell(mapping.colDebit));
    const credit = parseAmount(cell(mapping.colCredit));
    if (!isNaN(debit) && debit > 0) depense = debit;
    if (!isNaN(credit) && credit > 0) recette = credit;
  } else {
    const val = parseAmount(cell(mapping.colMontant));
    if (!isNaN(val)) {
      if (val < 0) depense = Math.abs(val);
      else recette = val;
    }
  }

  return { date, designation, recette, depense };
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/import/parse
 * Reçoit un fichier CSV via multipart/form-data (champ "file").
 * Retourne : séparateur, colonnes, aperçu 5 premières lignes, mapping sauvegardé.
 */
export const parseCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  const { separator, headers, rows } = parseBuffer(req.file.buffer);
  const preview = rows.slice(0, 5).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });

  // Récupérer le mapping sauvegardé de cet utilisateur
  const savedMapping = await CsvMapping.findOne({ userId: req.userId }).lean();

  res.json({ separator, headers, preview, savedMapping: savedMapping || null });
};

/**
 * POST /api/import/preview
 * Reçoit : CSV + mapping + accountId.
 * Retourne : lignes parsées avec statut (doublon, suggestion thème).
 */
export const previewCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  const { accountId, mapping: mappingRaw } = req.body;
  if (!accountId) {
    return res.status(400).json({ error: "accountId manquant." });
  }

  let mapping;
  try {
    mapping =
      typeof mappingRaw === "string" ? JSON.parse(mappingRaw) : mappingRaw;
  } catch {
    return res.status(400).json({ error: "Mapping invalide." });
  }

  const { headers, rows } = parseBuffer(req.file.buffer);

  // Charger les transactions existantes du compte pour détecter doublons et suggestions
  const existing = await Transaction.find({ accountId }).lean();

  // Index par clé de doublon (designation|date|montant)
  const duplicateKeys = new Set();
  // Index par désignation pour suggestions (désignation → transaction la plus récente)
  const byDesignation = new Map();

  for (const tx of existing) {
    const montant = tx.recette ?? tx.depense ?? 0;
    const key = `${tx.designation}|${tx.date}|${montant}`;
    duplicateKeys.add(key);

    const cleanedDes = cleanDesignation(tx.designation);
    const prev = byDesignation.get(cleanedDes);
    if (!prev || (tx.updatedAt ?? 0) > (prev.updatedAt ?? 0)) {
      byDesignation.set(cleanedDes, tx);
    }
  }

  const parsed = rows.map((row, idx) => {
    const {
      date,
      designation: rawDesignation,
      recette,
      depense,
    } = extractFromRow(row, headers, mapping);

    const designation = cleanDesignation(rawDesignation);
    const payment = detectPayment(rawDesignation);

    const montant = recette ?? depense ?? 0;
    const key = `${designation}|${date}|${montant}`;
    const isDuplicate = duplicateKeys.has(key);

    let suggestedThemeId = null;
    let suggestedSubThemeId = null;
    const match = byDesignation.get(designation);
    if (match && !isDuplicate) {
      suggestedThemeId = match.themeId;
      suggestedSubThemeId = match.subThemeId;
    }

    return {
      _rowIndex: idx,
      date,
      designation,
      recette,
      depense,
      status: isDuplicate ? "duplicate" : "new",
      excluded: isDuplicate,
      themeId: suggestedThemeId,
      subThemeId: suggestedSubThemeId,
      payment,
    };
  });

  res.json({ rows: parsed });
};

/**
 * POST /api/import/confirm
 * Reçoit un tableau de transactions enrichies (themeId, subThemeId, payment).
 * Insère en masse dans Transaction.
 */
export const confirmImport = async (req, res) => {
  const { transactions, accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "accountId manquant." });
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: "Aucune transaction à importer." });
  }

  const now = Date.now();
  const docs = transactions.map((tx) => ({
    id: uuidv4(),
    accountId,
    date: tx.date,
    themeId: tx.themeId,
    subThemeId: tx.subThemeId,
    payment: tx.payment,
    designation: tx.designation,
    recette: tx.recette ?? null,
    depense: tx.depense ?? null,
    disabled: false,
    transferId: null,
    linkedAccountId: null,
    updatedAt: now,
  }));

  await Transaction.insertMany(docs, { ordered: false });

  res.status(201).json({ imported: docs.length });
};

/**
 * GET /api/import/mapping
 * Retourne le mapping CSV sauvegardé pour l'utilisateur courant.
 */
export const getMapping = async (req, res) => {
  const mapping = await CsvMapping.findOne({ userId: req.userId }).lean();
  res.json(mapping || null);
};

/**
 * POST /api/import/mapping
 * Sauvegarde (upsert) le mapping CSV de l'utilisateur courant.
 */
export const saveMapping = async (req, res) => {
  const {
    separator,
    colDate,
    colDesignation,
    montantType,
    colMontant,
    colDebit,
    colCredit,
  } = req.body;

  const doc = await CsvMapping.findOneAndUpdate(
    { userId: req.userId },
    {
      userId: req.userId,
      separator,
      colDate,
      colDesignation,
      montantType,
      colMontant,
      colDebit,
      colCredit,
      savedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  res.json(doc);
};
