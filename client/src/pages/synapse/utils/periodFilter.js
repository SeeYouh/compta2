import { parseFRDate } from './date';

/**
 * Filtre les transactions selon une période définie
 * @param {Array} transactions - Liste des transactions
 * @param {string} period - Type de période ('all', '6weeks', '2months', '3months', 'currentMonth', 'previousMonth', 'currentYear')
 * @returns {Array} Transactions filtrées
 */
export const filterByPeriod = (transactions, period) => {
  if (!period || period === "all") {
    return transactions;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let startDate;

  switch (period) {
    case "6weeks": {
      // 6 semaines = 42 jours
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 42);
      break;
    }
    case "2months": {
      // 2 mois en arrière
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 2);
      break;
    }
    case "3months": {
      // 3 mois en arrière
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    }
    case "currentMonth": {
      // Du 1er du mois en cours jusqu'à la fin du mois en cours
      startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0); // Dernier jour du mois en cours

      return transactions.filter((t) => {
        const d = parseFRDate(t.date);
        if (Number.isNaN(d)) return false;
        return d >= startDate && d <= endDate;
      });
    }
    case "previousMonth": {
      // Tout le mois précédent
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      startDate = new Date(prevYear, prevMonth, 1);
      const endDate = new Date(currentYear, currentMonth, 0); // Dernier jour du mois précédent

      return transactions.filter((t) => {
        const d = parseFRDate(t.date);
        if (Number.isNaN(d)) return false;
        return d >= startDate && d <= endDate;
      });
    }
    case "currentYear": {
      // Depuis le 1er janvier de l'année en cours
      startDate = new Date(currentYear, 0, 1);
      break;
    }
    default:
      return transactions;
  }

  // Filtrage pour les cas avec seulement startDate
  return transactions.filter((t) => {
    const d = parseFRDate(t.date);
    if (Number.isNaN(d)) return false;
    return d >= startDate;
  });
};
