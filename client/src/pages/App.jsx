import { useCallback, useMemo, useState } from "react";

import AppShell from "../components/AppShell";
import ThemeToggle from "../components/ThemeToggle";

import BalanceCalculator from "../components/BalanceCalculator";
import {
  filterByMonth,
  sortByFRDate,
} from "../components/utils/transactionsDerivers";
import { MONTHS, TABLE_HEADERS } from "../components/utils";
import MonthTabs from "../components/MonthTabs";
import TransactionForm from "../components/TransactionForm";
import TransactionsTable from "../components/TransactionsTable";
import { useTransactionForm } from "../components/hooks/useTransactionForm";
import { useTransactions } from "../components/hooks/useTransactions";

const App = () => {
  const { transactions, add, remove, update } = useTransactions();
  const { formData, errors, handleChange, validate, reset, toPayload } =
    useTransactionForm();

  const [selectedMonth, setSelectedMonth] = useState(null);

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

  const transactionsSorted = useMemo(
    () => sortByFRDate(transactions),
    [transactions]
  );
  const transactionsWithBalance = useMemo(
    () => BalanceCalculator({ transactions: transactionsSorted }),
    [transactionsSorted]
  );
  const filteredTransactions = useMemo(
    () => filterByMonth(transactionsWithBalance, selectedMonth),
    [transactionsWithBalance, selectedMonth]
  );

  return (
    <AppShell headerRight={<ThemeToggle />}>
      <MonthTabs
        months={MONTHS}
        selectedMonth={selectedMonth}
        onSelect={setSelectedMonth}
      />
      <TransactionForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
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
