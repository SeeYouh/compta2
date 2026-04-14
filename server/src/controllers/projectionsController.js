import { v4 as uuidv4 } from "uuid";

import { checkAccountAccess } from "../middleware/permissions.js";
import { Projection } from "../models/Projection.js";
import { ProjectionOccurrence } from "../models/ProjectionOccurrence.js";
import { Transaction } from "../models/Transaction.js";

// ============================================================
// ALGO UTILITAIRES
// ============================================================

/**
 * Distance de Levenshtein entre deux chaînes (insensible à la casse).
 * Retourne un ratio de similarité entre 0 et 1.
 */
function similarityRatio(a, b) {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;

  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const matrix = Array.from({ length: len1 + 1 }, (_, i) =>
    Array.from({ length: len2 + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = matrix[len1][len2];
  return 1 - distance / Math.max(len1, len2);
}

/** Parse une date DD/MM/YYYY → objet Date */
function parseFRDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

/** Formate une date Date → DD/MM/YYYY */
function formatFRDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Convertit un horizon en nombre de mois */
function horizonToMonths(horizon) {
  const map = { "3m": 3, "6m": 6, "1y": 12, "2y": 24, "5y": 60, "10y": 120 };
  return map[horizon] ?? 12;
}

/**
 * Génère les dates d'occurrences futures pour un pattern.
 * @param {number} dayOfMonth  - Jour du mois (1-31)
 * @param {number|null} annualMonth - Si récurrence annuelle, mois (0-11)
 * @param {number} horizonMonths - Nombre de mois à projeter
 * @returns {Date[]}
 */
function generateOccurrenceDates(dayOfMonth, annualMonth, horizonMonths) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + horizonMonths);

  const dates = [];
  const cursor = new Date(today);

  if (annualMonth !== null) {
    // Récurrence annuelle
    cursor.setMonth(annualMonth);
    cursor.setDate(dayOfMonth);
    if (cursor <= today) cursor.setFullYear(cursor.getFullYear() + 1);

    while (cursor <= endDate) {
      dates.push(new Date(cursor));
      cursor.setFullYear(cursor.getFullYear() + 1);
    }
  } else {
    // Récurrence mensuelle
    cursor.setDate(1);
    while (cursor <= endDate) {
      const lastDay = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        0,
      ).getDate();
      const day = Math.min(dayOfMonth, lastDay);
      const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      if (candidate > today) dates.push(candidate);
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return dates;
}

/**
 * Algorithme de détection des patterns récurrents.
 * Retourne un tableau de patterns détectés.
 */
function detectPatterns(transactions) {
  const SIMILARITY_THRESHOLD = 0.8;
  const MIN_OCCURRENCES = 2;
  const AMOUNT_TOLERANCE = 0.12; // ±12% — couvre salaires variables, heures sup, etc.

  // On ne travaille que sur les transactions actives (non désactivées)
  const active = transactions.filter((t) => !t.disabled);

  const patterns = [];
  const used = new Set();

  for (let i = 0; i < active.length; i++) {
    if (used.has(i)) continue;
    const ref = active[i];
    // ?? au lieu de || : évite que recette=0 soit falsy
    const refAmount = ref.recette ?? ref.depense;
    const refDate = parseFRDate(ref.date);
    if (!refAmount || !refDate) continue;

    const group = [i];
    // NE PAS marquer i comme used ici — on le fait seulement si le groupe est valide,
    // sinon i disparaît de la recherche et peut créer des doublons en cascade.

    for (let j = i + 1; j < active.length; j++) {
      if (used.has(j)) continue;
      const cand = active[j];
      const candAmount = cand.recette ?? cand.depense;
      const candDate = parseFRDate(cand.date);
      if (!candAmount || !candDate) continue;

      // Même type (recette ou dépense)
      const sameType =
        (ref.recette != null && cand.recette != null) ||
        (ref.depense != null && cand.depense != null);
      if (!sameType) continue;

      // Montant proche ±12%
      if (Math.abs(candAmount - refAmount) / refAmount > AMOUNT_TOLERANCE)
        continue;

      // Désignation similaire
      if (
        similarityRatio(ref.designation, cand.designation) <
        SIMILARITY_THRESHOLD
      )
        continue;

      // Pas dans le même mois qu'une transaction déjà dans le groupe.
      // On remplace la contrainte "même jour exact" par cette règle : elle capture
      // les salaires décalés de quelques jours ET les virements sans date fixe.
      const candYM = candDate.getFullYear() * 12 + candDate.getMonth();
      const alreadyInMonth = group.some((idx) => {
        const d = parseFRDate(active[idx].date);
        return d && d.getFullYear() * 12 + d.getMonth() === candYM;
      });
      if (alreadyInMonth) continue;

      group.push(j);
    }

    if (group.length < MIN_OCCURRENCES) continue;

    // Groupe valide : marquer toutes ses transactions comme utilisées
    for (const idx of group) used.add(idx);

    const tx = active[i];
    const dates = group.map((idx) => parseFRDate(active[idx].date));
    const months = dates.map((d) => d.getMonth());
    const days = dates.map((d) => d.getDate());

    // Jour moyen du mois pour la projection (arrondi)
    const avgDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length);

    // Déterminer si mensuel ou annuel
    const uniqueMonths = new Set(months);
    const frequency = uniqueMonths.size >= 2 ? "monthly" : "annual";
    const annualMonth = frequency === "annual" ? months[0] : null;

    // Montant moyen (arrondi à 2 décimales)
    const amounts = group.map(
      (idx) => active[idx].recette ?? active[idx].depense,
    );
    const avgAmount =
      Math.round((amounts.reduce((a, b) => a + b, 0) / amounts.length) * 100) /
      100;

    patterns.push({
      designation: tx.designation,
      dayOfMonth: avgDay,
      annualMonth,
      frequency,
      recette: tx.recette != null ? avgAmount : null,
      depense: tx.depense != null ? avgAmount : null,
      themeId: tx.themeId,
      subThemeId: tx.subThemeId,
      payment: tx.payment,
    });
  }

  // Dédoublonnage final : si deux patterns ont une désignation très similaire,
  // même type et même fréquence, on garde uniquement le premier.
  return patterns.filter((p, i) => {
    for (let j = 0; j < i; j++) {
      const q = patterns[j];
      if (
        q.frequency === p.frequency &&
        ((q.recette != null && p.recette != null) ||
          (q.depense != null && p.depense != null)) &&
        similarityRatio(q.designation, p.designation) >= 0.9
      ) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================
// CONTROLLERS
// ============================================================

/**
 * POST /api/projections/compute
 * Lance le calcul des projections pour un compte.
 * Body: { accountId, horizon: "3m"|"6m"|"1y"|"2y"|"5y"|"10y" }
 */
export const computeProjections = async (req, res) => {
  try {
    const { accountId, horizon = "1y" } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: "accountId requis" });
    }

    const { hasAccess } = await checkAccountAccess(req.userId, accountId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const horizonMonths = horizonToMonths(horizon);
    const horizonMap = {
      "3m": 3,
      "6m": 6,
      "1y": 12,
      "2y": 24,
      "5y": 60,
      "10y": 120,
    };

    // Récupérer toutes les transactions du compte
    const transactions = await Transaction.find({ accountId }).lean();

    // Détecter les patterns
    const patterns = detectPatterns(transactions);

    // Supprimer les anciennes projections et occurrences du compte
    const existingProjections = await Projection.find({ accountId }).lean();
    const existingIds = existingProjections.map((p) => p.id);
    await ProjectionOccurrence.deleteMany({
      projectionId: { $in: existingIds },
    });
    await Projection.deleteMany({ accountId });

    const createdProjections = [];

    for (const pattern of patterns) {
      const projId = `proj-${uuidv4()}`;

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + horizonMonths);

      const projection = await Projection.create({
        id: projId,
        accountId,
        userId: req.userId,
        designation: pattern.designation,
        dayOfMonth: pattern.dayOfMonth,
        annualMonth: pattern.annualMonth,
        frequency: pattern.frequency,
        recette: pattern.recette,
        depense: pattern.depense,
        themeId: pattern.themeId,
        subThemeId: pattern.subThemeId,
        payment: pattern.payment,
        horizonMonths: horizonMap[horizon] ?? 12,
        calculatedUntil: endDate.toISOString(),
        loop: false,
        active: true,
      });

      // Générer les occurrences
      const dates = generateOccurrenceDates(
        pattern.dayOfMonth,
        pattern.annualMonth,
        horizonMonths,
      );

      const occurrences = dates.map((d) => ({
        id: `pocc-${uuidv4()}`,
        projectionId: projId,
        accountId,
        date: formatFRDate(d),
        designation: pattern.designation,
        recette: pattern.recette,
        depense: pattern.depense,
        themeId: pattern.themeId,
        subThemeId: pattern.subThemeId,
        payment: pattern.payment,
      }));

      if (occurrences.length > 0) {
        await ProjectionOccurrence.insertMany(occurrences);
      }

      createdProjections.push(projection.toJSON());
    }

    res.json({
      count: createdProjections.length,
      projections: createdProjections,
    });
  } catch (error) {
    console.error("Erreur computeProjections:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du calcul des projections" });
  }
};

/**
 * GET /api/projections?accountId=...
 * Récupère tous les patterns de projection d'un compte.
 */
export const getProjections = async (req, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: "accountId requis" });
    }

    const { hasAccess } = await checkAccountAccess(req.userId, accountId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const projections = await Projection.find({ accountId }).sort({
      designation: 1,
    });
    res.json(projections);
  } catch (error) {
    console.error("Erreur getProjections:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * PATCH /api/projections/:id
 * Met à jour les paramètres d'une projection (horizon, loop, active, designation).
 * Si l'horizon change, recalcule les occurrences.
 */
export const updateProjection = async (req, res) => {
  try {
    const { id } = req.params;
    const { horizonMonths, loop, active, designation, recette, depense } =
      req.body;

    const projection = await Projection.findOne({ id });
    if (!projection) {
      return res.status(404).json({ error: "Projection introuvable" });
    }

    const { hasAccess } = await checkAccountAccess(
      req.userId,
      projection.accountId,
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const oldHorizon = projection.horizonMonths;

    if (horizonMonths !== undefined) projection.horizonMonths = horizonMonths;
    if (loop !== undefined) projection.loop = loop;
    if (active !== undefined) projection.active = active;
    if (designation !== undefined) projection.designation = designation;
    if (recette !== undefined) projection.recette = recette;
    if (depense !== undefined) projection.depense = depense;

    // Recalcul des occurrences si l'horizon a changé
    if (horizonMonths !== undefined && horizonMonths !== oldHorizon) {
      await ProjectionOccurrence.deleteMany({ projectionId: id });

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + horizonMonths);
      projection.calculatedUntil = endDate.toISOString();

      const dates = generateOccurrenceDates(
        projection.dayOfMonth,
        projection.annualMonth,
        horizonMonths,
      );

      const occurrences = dates.map((d) => ({
        id: `pocc-${uuidv4()}`,
        projectionId: id,
        accountId: projection.accountId,
        date: formatFRDate(d),
        designation: projection.designation,
        recette: projection.recette,
        depense: projection.depense,
        themeId: projection.themeId,
        subThemeId: projection.subThemeId,
        payment: projection.payment,
      }));

      if (occurrences.length > 0) {
        await ProjectionOccurrence.insertMany(occurrences);
      }
    } else if (recette !== undefined || depense !== undefined) {
      // Montant modifié sans changement d'horizon : propager aux occurrences existantes
      const updateFields = {};
      if (recette !== undefined) updateFields.recette = recette;
      if (depense !== undefined) updateFields.depense = depense;
      await ProjectionOccurrence.updateMany(
        { projectionId: id },
        { $set: updateFields },
      );
    }

    await projection.save();
    res.json(projection.toJSON());
  } catch (error) {
    console.error("Erreur updateProjection:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * DELETE /api/projections/:id
 * Supprime une projection et toutes ses occurrences.
 */
export const deleteProjection = async (req, res) => {
  try {
    const { id } = req.params;

    const projection = await Projection.findOne({ id });
    if (!projection) {
      return res.status(404).json({ error: "Projection introuvable" });
    }

    const { hasAccess } = await checkAccountAccess(
      req.userId,
      projection.accountId,
    );
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await ProjectionOccurrence.deleteMany({ projectionId: id });
    await Projection.deleteOne({ id });

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur deleteProjection:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * GET /api/projections/occurrences?accountId=...&displayMonths=3
 * Récupère les occurrences actives à afficher dans la liste des mouvements.
 * displayMonths : nombre de mois à afficher (parmi ce qui est calculé).
 */
export const getOccurrences = async (req, res) => {
  try {
    const { accountId, displayMonths } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: "accountId requis" });
    }

    const { hasAccess } = await checkAccountAccess(req.userId, accountId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Récupérer uniquement les projections actives
    const activeProjections = await Projection.find({
      accountId,
      active: true,
    }).lean();

    if (activeProjections.length === 0) {
      return res.json([]);
    }

    const activeIds = activeProjections.map((p) => p.id);

    // Calculer la date limite d'affichage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const months = parseInt(displayMonths, 10);
    // displayMonths=0 → l'utilisateur a désactivé l'affichage
    if (!months || months <= 0) {
      return res.json([]);
    }
    // Dernier jour du N-ième mois suivant le mois en cours.
    // Ex : aujourd'hui = 8 avril, months=1 → 31 mai (avril restant + tout mai).
    const displayUntil = new Date(
      today.getFullYear(),
      today.getMonth() + months + 1,
      0, // jour 0 du mois suivant = dernier jour du mois ciblé
      23,
      59,
      59,
    );

    // Récupérer les occurrences dans la fenêtre d'affichage
    const allOccurrences = await ProjectionOccurrence.find({
      projectionId: { $in: activeIds },
      accountId,
    }).lean();

    const filtered = allOccurrences.filter((occ) => {
      const d = parseFRDate(occ.date);
      return d && d >= today && d <= displayUntil;
    });

    // Gérer le mode loop : si une projection a loop=true et que ses
    // occurrences calculées sont épuisées dans la fenêtre, on en génère à la volée
    const loopProjections = activeProjections.filter((p) => p.loop);
    for (const proj of loopProjections) {
      const projOccs = filtered.filter((o) => o.projectionId === proj.id);
      if (projOccs.length === 0) {
        const extraDates = generateOccurrenceDates(
          proj.dayOfMonth,
          proj.annualMonth,
          months,
        );
        for (const d of extraDates) {
          filtered.push({
            id: `loop-${uuidv4()}`,
            projectionId: proj.id,
            accountId,
            date: formatFRDate(d),
            designation: proj.designation,
            recette: proj.recette,
            depense: proj.depense,
            themeId: proj.themeId,
            subThemeId: proj.subThemeId,
            payment: proj.payment,
          });
        }
      }
    }

    res.json(filtered);
  } catch (error) {
    console.error("Erreur getOccurrences:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
