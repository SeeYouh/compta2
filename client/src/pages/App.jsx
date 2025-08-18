import { useCallback, useEffect, useMemo, useState } from "react";

import AppShell from "../components/AppShell";
import BalanceCalculator from "../components/BalanceCalculator";
import ChartsDashboard from "../components/ChartsDashboard";
import {
  filterByMonth,
  sortByFRDate,
} from "../components/utils/transactionsDerivers";
import IconGraphActivated from "../assets/IconGraphActivated";
import IcongraphDisable from "../assets/IconGraph";
import { MONTHS, TABLE_HEADERS } from "../components/utils";
import MonthTabs from "../components/MonthTabs";
import { parseFRDate } from "../components/utils/date";
import PaymentFilterMenu from "../components/filters/PaymentFilterMenu";
import ThemeFilterMenu from "../components/filters/ThemeFilterMenu";
import ThemeToggle from "../components/ThemeToggle";
import TransactionForm from "../components/TransactionForm";
import TransactionsTable from "../components/TransactionsTable";
import { useTransactionForm } from "../components/hooks/useTransactionForm";
import { useTransactions } from "../components/hooks/useTransactions";
// Filtres
import YearTabs from "../components/filters/YearTabs";

const App = () => {
  const { transactions, add, remove, update } = useTransactions();
  const { formData, errors, handleChange, validate, reset, toPayload } =
    useTransactionForm();

  // État des filtres
  const [selectedYear, setSelectedYear] = useState(null); // null = "Tous"
  const [selectedMonth, setSelectedMonth] = useState(null); // 0..11 ou null
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [showCharts, setShowCharts] = useState(false);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const newErrors = validate();
      if (Object.keys(newErrors).length) return;
      await add(toPayload());
      reset();
    },
    [add, toPayload, reset, validate]
  );

  const onDelete = useCallback(
    async (id) => {
      await remove(id);
    },
    [remove]
  );
  const onUpdate = useCallback(
    async (id, patch) => {
      await update(id, patch);
    },
    [update]
  );

  // Années dynamiques
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

  useEffect(() => {
    if (selectedYear !== null && !years.includes(selectedYear))
      setSelectedYear(null);
  }, [years, selectedYear]);

  // Tri + solde (inchangé)
  const transactionsSorted = useMemo(
    () => sortByFRDate(transactions),
    [transactions]
  );
  const transactionsWithBalance = useMemo(
    () => BalanceCalculator({ transactions: transactionsSorted }),
    [transactionsSorted]
  );

  // Filtrage: Année → Mois → Thème → Paiement
  const filteredByYear = useMemo(() => {
    if (selectedYear === null) return transactionsWithBalance;
    return transactionsWithBalance.filter((t) => {
      const d = parseFRDate(t.date);
      return !Number.isNaN(d) && d.getFullYear() === selectedYear;
    });
  }, [transactionsWithBalance, selectedYear]);

  const filteredByMonth = useMemo(() => {
    if (selectedMonth === null) return filteredByYear;
    return filterByMonth(filteredByYear, selectedMonth);
  }, [filteredByYear, selectedMonth]);

  const filteredByTheme = useMemo(() => {
    if (!selectedTheme) return filteredByMonth;
    return filteredByMonth.filter((t) => t.theme === selectedTheme);
  }, [filteredByMonth, selectedTheme]);

  const filteredTransactions = useMemo(() => {
    if (!selectedPayment) return filteredByTheme;
    return filteredByTheme.filter((t) => t.payment === selectedPayment);
  }, [filteredByTheme, selectedPayment]);

  const resetFilters = useCallback(() => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedTheme(null);
    setSelectedPayment(null);
  }, []);

  return (
    <AppShell headerRight={<ThemeToggle />}>
      {/* Onglets Années */}
      <YearTabs
        years={years}
        selectedYear={selectedYear}
        onChange={setSelectedYear}
      />

      <div className="navBar">
        <div className="filtersRow">
          <MonthTabs
            months={MONTHS}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />

          <ThemeFilterMenu
            transactions={transactions}
            value={selectedTheme}
            onChange={setSelectedTheme}
            label="Thèmes"
          />

          <PaymentFilterMenu
            transactions={transactions}
            value={selectedPayment}
            onChange={setSelectedPayment}
            label="Paiement"
          />

          <button
            type="button"
            className="reset-filters"
            onClick={resetFilters}
          >
            Réinitialiser
          </button>
        </div>

        <TransactionForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onSubmit={onSubmit}
        />

        <div className="btnGraph" onClick={() => setShowCharts((v) => !v)}>
          {showCharts ? <IcongraphDisable /> : <IconGraphActivated />}
        </div>
      </div>

      {showCharts && (
        <ChartsDashboard
          transactions={filteredTransactions}
          filters={{
            year: selectedYear,
            month: selectedMonth,
            theme: selectedTheme,
            payment: selectedPayment,
          }}
        />
      )}

      <TransactionsTable
        transactions={filteredTransactions}
        headers={TABLE_HEADERS}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </AppShell>
  );
};

export default App;
