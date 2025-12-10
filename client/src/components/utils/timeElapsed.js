import { APP_LABELS } from './index';

/**
 * Calcule le temps écoulé depuis une date donnée
 * @param {Date} date - La date de référence
 * @returns {string} Le temps écoulé formaté
 */
export const getTimeElapsed = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return APP_LABELS.timeUnknown;
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Moins d'1 heure
  if (diffMinutes < 60) {
    if (diffMinutes < 1) return APP_LABELS.timeNow;
    if (diffMinutes === 1) return APP_LABELS.timeMinuteSingular;
    return APP_LABELS.timeMinutesPlural.replace("{count}", diffMinutes);
  }

  // Moins d'1 jour (affichage par heures)
  if (diffHours < 24) {
    if (diffHours === 1) return APP_LABELS.timeHourSingular;
    return APP_LABELS.timeHoursPlural.replace("{count}", diffHours);
  }

  // Moins d'1 semaine (affichage par jours)
  if (diffDays < 7) {
    if (diffDays === 1) return APP_LABELS.timeDaySingular;
    return APP_LABELS.timeDaysPlural.replace("{count}", diffDays);
  }

  // Moins d'1 mois (affichage par semaines)
  if (diffWeeks < 4) {
    if (diffWeeks === 1) return APP_LABELS.timeWeekSingular;
    return APP_LABELS.timeWeeksPlural.replace("{count}", diffWeeks);
  }

  // Moins d'1 an (affichage par mois)
  if (diffMonths < 12) {
    if (diffMonths === 1) return APP_LABELS.timeMonthSingular;
    return APP_LABELS.timeMonthsPlural.replace("{count}", diffMonths);
  }

  // Plus d'1 an (affichage par années)
  if (diffYears === 1) return APP_LABELS.timeYearSingular;
  return APP_LABELS.timeYearsPlural.replace("{count}", diffYears);
};

/**
 * Trouve la date de dernière modification parmi les transactions
 * @param {Array} transactions - Liste des transactions
 * @returns {Date|null} La date de dernière modification
 */
export const getLastModificationDate = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  // On cherche la transaction avec le timestamp le plus récent
  // Si les transactions ont un champ 'updatedAt' ou 'createdAt'
  const dates = transactions
    .map((t) => {
      // Priorité : updatedAt, puis createdAt, puis id (si c'est un timestamp)
      if (t.updatedAt) return new Date(t.updatedAt);
      if (t.createdAt) return new Date(t.createdAt);
      // Si l'id est un nombre, on suppose que c'est un timestamp
      if (typeof t.id === "number") return new Date(t.id);
      return null;
    })
    .filter((d) => d && !isNaN(d));

  if (dates.length === 0) return null;

  // Retourner la date la plus récente
  return new Date(Math.max(...dates.map((d) => d.getTime())));
};
