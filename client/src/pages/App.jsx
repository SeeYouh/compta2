// import { useCallback, useEffect, useMemo, useState } from "react";

// import BalanceCalculator from "../components/BalanceCalculator";
// import {
//   createTransaction,
//   deleteTransaction,
//   getTransactions,
// } from "../components/utils/transactionsApi";
// import { FIELD_RULES, MONTHS, TABLE_HEADERS } from "../components/utils/index";
// import MonthTabs from "../components/MonthTabs";
// import { parseFRDate } from "../components/utils/date";
// import TransactionForm from "../components/TransactionForm";
// import TransactionsTable from "../components/TransactionsTable";

// const App = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [hoveredRow, setHoveredRow] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(null);
//   const [formData, setFormData] = useState({
//     date: "",
//     theme: "",
//     subTheme: "",
//     payment: "",
//     designation: "",
//     amount: "",
//     bankMovement: "",
//   });

//   const fetchTransactions = useCallback(async () => {
//     try {
//       const data = await getTransactions();
//       setTransactions(data);
//     } catch (err) {
//       console.error("Erreur chargement transactions :", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchTransactions();
//   }, [fetchTransactions]);

//   const handleChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     return FIELD_RULES.reduce((errors, rule) => {
//       const isInvalid =
//         typeof rule.validate === "function"
//           ? rule.validate(formData)
//           : !formData[rule.field];

//       if (isInvalid) errors[rule.field] = rule.message;
//       return errors;
//     }, {});
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validateForm();
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     const [year, month, day] = formData.date.split("-");
//     const formattedDate = `${day}/${month}/${year}`;

//     const payload = {
//       date: formattedDate,
//       theme: formData.theme,
//       subTheme: formData.subTheme,
//       payment: formData.payment,
//       designation: formData.designation,
//       recette: formData.bankMovement === "recette" ? formData.amount : "",
//       depense: formData.bankMovement === "depense" ? formData.amount : "",
//     };

//     try {
//       await createTransaction(payload);
//       await fetchTransactions();
//       setFormData({
//         date: "",
//         theme: "",
//         subTheme: "",
//         payment: "",
//         designation: "",
//         amount: "",
//         bankMovement: "",
//       });
//       setErrors({});
//     } catch (err) {
//       console.error("Erreur ajout transaction :", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteTransaction(id);
//       await fetchTransactions();
//     } catch (err) {
//       console.error("Erreur suppression :", err);
//     }
//   };

//   const transactionsSorted = useMemo(() => {
//     return [...transactions].sort(
//       (a, b) => parseFRDate(a.date) - parseFRDate(b.date)
//     );
//   }, [transactions]);

//   const transactionsWithBalance = BalanceCalculator({
//     transactions: transactionsSorted,
//   });

//   const filteredTransactions = useMemo(() => {
//     if (selectedMonth === null) return transactionsWithBalance;
//     return transactionsWithBalance.filter(
//       (t) => parseFRDate(t.date).getMonth() === selectedMonth
//     );
//   }, [transactionsWithBalance, selectedMonth]);

//   return (
//     <>
//       <MonthTabs
//         months={MONTHS}
//         selectedMonth={selectedMonth}
//         onSelect={setSelectedMonth}
//       />

//       <TransactionForm
//         formData={formData}
//         errors={errors}
//         onChange={handleChange}
//         onSubmit={handleSubmit}
//       />

//       <TransactionsTable
//         transactions={filteredTransactions}
//         headers={TABLE_HEADERS}
//         hoveredRow={hoveredRow}
//         onHover={setHoveredRow}
//         onDelete={handleDelete}
//       />
//     </>
//   );
// };

// export default App;

import { useCallback, useMemo, useState } from "react";

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
  const { transactions, add, remove } = useTransactions();
  const { formData, errors, handleChange, validate, reset, toPayload } =
    useTransactionForm();

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

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
    <>
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
        hoveredRow={hoveredRow}
        onHover={setHoveredRow}
        onDelete={onDelete}
      />
    </>
  );
};

export default App;
