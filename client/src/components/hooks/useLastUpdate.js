import {
  useEffect,
  useState,
} from 'react';

import { APP_LABELS } from '../utils';
import {
  getLastModificationDate,
  getTimeElapsed,
} from '../utils/timeElapsed';

/**
 * Hook qui retourne le temps écoulé depuis la dernière modification
 * et se met à jour automatiquement
 * @param {Array} transactions - Liste des transactions
 * @returns {string} Le temps écoulé formaté
 */
export const useLastUpdate = (transactions) => {
  const [timeText, setTimeText] = useState("Chargement...");

  useEffect(() => {
    const updateTimeText = () => {
      const lastDate = getLastModificationDate(transactions);
      if (lastDate) {
        setTimeText(getTimeElapsed(lastDate));
      } else {
        setTimeText(APP_LABELS.timeNoData);
      }
    };

    // Mise à jour immédiate
    updateTimeText();

    // Mise à jour toutes les minutes
    const interval = setInterval(updateTimeText, 60000);

    return () => clearInterval(interval);
  }, [transactions]);

  return timeText;
};
