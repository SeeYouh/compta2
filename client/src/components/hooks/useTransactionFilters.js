import { useEffect, useMemo, useState } from "react";

import { parseFRDate } from "../utils/date";

export const useTransactionFilters = (transactions) => {
  // null = "Tous" (valeur neutre). month = 0..11 ou null
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [theme, setTheme] = useState(null);
  const [payment, setPayment] = useState(null);

  // Liste d'années disponible dynamiquement
  const years = useMemo(() => {
    const s = new Set();
    for (const t of transactions) {
      try {
        const d = parseFRDate(t.date);
        if (!Number.isNaN(d)) s.add(d.getFullYear());
      } catch {}
    }
    return Array.from(s).sort((a, b) => b - a);
  }, [transactions]);

  // Si l'année sélectionnée n'existe plus, on rebascule sur "Tous"
  useEffect(() => {
    if (year !== null && !years.includes(year)) {
      setYear(null);
    }
  }, [years, year]);

  // Liste filtrée
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = parseFRDate(t.date);
      if (Number.isNaN(d)) return false;

      if (year !== null && d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() !== month) return false;
      if (theme && t.theme !== theme) return false;
      if (payment && t.payment !== payment) return false;
      return true;
    });
  }, [transactions, year, month, theme, payment]);

  const reset = () => {
    setYear(null);
    setMonth(null);
    setTheme(null);
    setPayment(null);
  };

  return {
    filters: { year, month, theme, payment },
    setYear,
    setMonth,
    setTheme,
    setPayment,
    years,
    filteredTransactions,
    reset,
  };
};
