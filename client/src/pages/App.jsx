// import {
//   useEffect,
//   useState,
// } from 'react';

// import AmountInput from '../components/AmountInput';
// import BalanceCalculator from '../components/BalanceCalculator';
// import FormatCurrency from '../components/utils/FormatCurrency';
// import PaymentSelector from '../components/PaymentSelector';
// import ThemeSelector from '../components/ThemeSelector';

// function App() {
//   const [transactions, setTransactions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [hoveredRow, setHoveredRow] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(null); // Mois filtré

//   const labelNavBar = [
//     "Dates",
//     "Thèmes",
//     "Moyens de paiement",
//     "Désignations",
//     "Recettes",
//     "Dépenses",
//     "Soldes",
//     "Actions",
//   ];

//   const months = [
//     "Janvier",
//     "Février",
//     "Mars",
//     "Avril",
//     "Mai",
//     "Juin",
//     "Juillet",
//     "Août",
//     "Septembre",
//     "Octobre",
//     "Novembre",
//     "Décembre",
//   ];

//   // Charger les transactions depuis json-server
//   useEffect(() => {
//     fetch("http://localhost:3001/transactions")
//       .then((res) => res.json())
//       .then((data) => setTransactions(data))
//       .catch((err) => console.error("Erreur chargement transactions :", err));
//   }, []);

//   const formatDate = (isoDate) => {
//     if (!isoDate) return "";
//     const date = new Date(isoDate);
//     return date.toLocaleDateString("fr-FR");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const form = new FormData(e.target);
//     const newTransaction = {
//       date: formatDate(form.get("actionDate")),
//       theme: form.get("theme"),
//       payment: form.get("payment"),
//       designation: form.get("designation"),
//       recette: form.get("bankMovement") === "recette" ? form.get("amount") : "",
//       depense: form.get("bankMovement") === "depense" ? form.get("amount") : "",
//     };

//     // Validation
//     const newErrors = {};
//     if (!newTransaction.date) newErrors.date = "La date est obligatoire.";
//     if (!newTransaction.theme) newErrors.theme = "Le thème est obligatoire.";
//     if (!newTransaction.payment)
//       newErrors.payment = "Le moyen de paiement est obligatoire.";
//     if (!newTransaction.designation)
//       newErrors.designation = "La désignation est obligatoire.";
//     if (!newTransaction.recette && !newTransaction.depense)
//       newErrors.amount =
//         "Le montant et le type (recette ou dépense) sont obligatoires.";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     await fetch("http://localhost:3001/transactions", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newTransaction),
//     });

//     fetch("http://localhost:3001/transactions")
//       .then((res) => res.json())
//       .then((data) => setTransactions(data))
//       .catch((err) => console.error("Erreur rechargement transactions :", err));

//     e.target.reset();
//     setErrors({});
//   };

//   const handleDelete = async (id) => {
//     await fetch(`http://localhost:3001/transactions/${id}`, {
//       method: "DELETE",
//     });

//     fetch("http://localhost:3001/transactions")
//       .then((res) => res.json())
//       .then((data) => setTransactions(data))
//       .catch((err) => console.error("Erreur suppression :", err));
//   };

//   // Tri par date
//   const transactionsSorted = [...transactions].sort((a, b) => {
//     const [dayA, monthA, yearA] = a.date.split("/");
//     const [dayB, monthB, yearB] = b.date.split("/");
//     const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
//     const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
//     return dateA - dateB;
//   });

//   const transactionsWithBalance = BalanceCalculator({
//     transactions: transactionsSorted,
//   });

//   // Filtrage par mois sélectionné
//   const filteredTransactions =
//     selectedMonth === null
//       ? transactionsWithBalance
//       : transactionsWithBalance.filter((t) => {
//           const month = parseInt(t.date.split("/")[1], 10);
//           return month === selectedMonth + 1;
//         });

//   return (
//     <>
//       {/* Onglets mois */}
//       <div className="month-tabs">
//         {months.map((month, index) => (
//           <button
//             key={index}
//             className={selectedMonth === index ? "active" : ""}
//             onClick={() => setSelectedMonth(index)}
//           >
//             {month}
//           </button>
//         ))}
//         <button
//           className={selectedMonth === null ? "active" : ""}
//           onClick={() => setSelectedMonth(null)}
//         >
//           Tous
//         </button>
//       </div>

//       {/* Formulaire */}
//       <form onSubmit={handleSubmit}>
//         <input type="date" name="actionDate" />
//         {errors.date && <p className="error">{errors.date}</p>}

//         <ThemeSelector
//           onChange={({ theme }) => {
//             document.querySelector('input[name="theme"]').value = theme;
//           }}
//         />
//         <input type="hidden" name="theme" />
//         {errors.theme && <p className="error">{errors.theme}</p>}

//         <PaymentSelector
//           onChange={(payment) => {
//             document.querySelector('input[name="payment"]').value = payment;
//           }}
//         />
//         <input type="hidden" name="payment" />
//         {errors.payment && <p className="error">{errors.payment}</p>}

//         <input type="text" name="designation" placeholder="Désignation" />
//         {errors.designation && <p className="error">{errors.designation}</p>}

//         <AmountInput
//           onChange={(val) => {
//             document.querySelector('input[name="amount"]').value = val;
//           }}
//         />
//         <input type="hidden" name="amount" />

//         <ul>
//           <li>
//             <input
//               type="radio"
//               name="bankMovement"
//               id="bankIncomeMovement"
//               value="recette"
//             />
//             <label htmlFor="bankIncomeMovement"> Recette </label>
//           </li>
//           <li>
//             <input
//               type="radio"
//               name="bankMovement"
//               id="bankExpenseMovement"
//               value="depense"
//             />
//             <label htmlFor="bankExpenseMovement"> Dépense </label>
//           </li>
//         </ul>
//         {errors.amount && <p className="error">{errors.amount}</p>}

//         <button type="submit">Ajouter</button>
//       </form>

//       {/* Tableau filtré ou message si vide */}
//       {filteredTransactions.length === 0 ? (
//         <p className="no-data">Aucune action bancaire pour ce mois.</p>
//       ) : (
//         <div className="table-grid">
//           <div className="table-header">
//             {labelNavBar.map((item, index) => (
//               <div key={index} className="table-cell header">
//                 {item}
//               </div>
//             ))}
//           </div>

//           {filteredTransactions.map((t) => (
//             <div
//               key={t.id}
//               className="table-row"
//               onMouseEnter={() => setHoveredRow(t.id)}
//               onMouseLeave={() => setHoveredRow(null)}
//             >
//               <div className="table-cell">{t.date}</div>
//               <div className="table-cell">{t.theme}</div>
//               <div className="table-cell">{t.payment}</div>
//               <div className="table-cell">{t.designation}</div>
//               <div className="table-cell">
//                 {t.recette ? FormatCurrency(t.recette) : ""}
//               </div>
//               <div className="table-cell">
//                 {t.depense ? FormatCurrency(t.depense) : ""}
//               </div>
//               <div className="table-cell">{FormatCurrency(t.solde)}</div>
//               <div className="table-cell actions">
//                 {hoveredRow === t.id && (
//                   <button onClick={() => handleDelete(t.id)}>✖</button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// }

// export default App;

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AmountInput from '../components/AmountInput';
import BalanceCalculator from '../components/BalanceCalculator';
import FormatCurrency from '../components/utils/FormatCurrency';
import PaymentSelector from '../components/PaymentSelector';
import ThemeSelector from '../components/ThemeSelector';

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const TABLE_HEADERS = [
  "Dates",
  "Thèmes",
  "Moyens de paiement",
  "Désignations",
  "Recettes",
  "Dépenses",
  "Soldes",
  "Actions",
];

// Parse une date FR JJ/MM/AAAA en objet Date
const parseFRDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [errors, setErrors] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    theme: "",
    payment: "",
    designation: "",
    amount: "",
    bankMovement: "",
  });

  // Centralisation du fetch
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Erreur chargement transactions :", err);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "La date est obligatoire.";
    if (!formData.theme) newErrors.theme = "Le thème est obligatoire.";
    if (!formData.payment)
      newErrors.payment = "Le moyen de paiement est obligatoire.";
    if (!formData.designation)
      newErrors.designation = "La désignation est obligatoire.";
    if (!formData.amount || !formData.bankMovement)
      newErrors.amount =
        "Le montant et le type (recette ou dépense) sont obligatoires.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // On récupère la date depuis l'input type date et on la convertit en format FR (JJ/MM/AAAA)
    const [year, month, day] = formData.date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    const newTransaction = {
      date: formattedDate,
      theme: formData.theme,
      payment: formData.payment,
      designation: formData.designation,
      recette: formData.bankMovement === "recette" ? formData.amount : "",
      depense: formData.bankMovement === "depense" ? formData.amount : "",
    };

    try {
      await fetch("http://localhost:3001/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });
      await fetchTransactions();
      setFormData({
        date: "",
        theme: "",
        payment: "",
        designation: "",
        amount: "",
        bankMovement: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Erreur ajout transaction :", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3001/transactions/${id}`, {
        method: "DELETE",
      });
      await fetchTransactions();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  // Tri des transactions par date FR
  const transactionsSorted = useMemo(() => {
    return [...transactions].sort(
      (a, b) => parseFRDate(a.date) - parseFRDate(b.date)
    );
  }, [transactions]);

  // Calcul des soldes
  const transactionsWithBalance = BalanceCalculator({
    transactions: transactionsSorted,
  });

  // Filtrage par mois FR
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === null) return transactionsWithBalance;
    return transactionsWithBalance.filter(
      (t) => parseFRDate(t.date).getMonth() === selectedMonth
    );
  }, [transactionsWithBalance, selectedMonth]);

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
        onSubmit={handleSubmit}
      />

      {filteredTransactions.length === 0 ? (
        <p className="no-data">Aucune action bancaire pour ce mois.</p>
      ) : (
        <TransactionsTable
          transactions={filteredTransactions}
          headers={TABLE_HEADERS}
          hoveredRow={hoveredRow}
          onHover={setHoveredRow}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

// Composant des onglets mois
function MonthTabs({ months, selectedMonth, onSelect }) {
  return (
    <div className="month-tabs">
      {months.map((month, index) => (
        <button
          key={index}
          className={selectedMonth === index ? "active" : ""}
          onClick={() => onSelect(index)}
        >
          {month}
        </button>
      ))}
      <button
        className={selectedMonth === null ? "active" : ""}
        onClick={() => onSelect(null)}
      >
        Tous
      </button>
    </div>
  );
}

// Composant formulaire
function TransactionForm({ formData, errors, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="date"
        name="actionDate"
        value={formData.date}
        onChange={(e) => onChange("date", e.target.value)}
      />
      {errors.date && <p className="error">{errors.date}</p>}

      <ThemeSelector onChange={({ theme }) => onChange("theme", theme)} />
      {errors.theme && <p className="error">{errors.theme}</p>}

      <PaymentSelector onChange={(payment) => onChange("payment", payment)} />
      {errors.payment && <p className="error">{errors.payment}</p>}

      <input
        type="text"
        name="designation"
        placeholder="Désignation"
        value={formData.designation}
        onChange={(e) => onChange("designation", e.target.value)}
      />
      {errors.designation && <p className="error">{errors.designation}</p>}

      <AmountInput onChange={(val) => onChange("amount", val)} />
      <ul>
        <li>
          <input
            type="radio"
            name="bankMovement"
            id="bankIncomeMovement"
            value="recette"
            checked={formData.bankMovement === "recette"}
            onChange={(e) => onChange("bankMovement", e.target.value)}
          />
          <label htmlFor="bankIncomeMovement"> Recette </label>
        </li>
        <li>
          <input
            type="radio"
            name="bankMovement"
            id="bankExpenseMovement"
            value="depense"
            checked={formData.bankMovement === "depense"}
            onChange={(e) => onChange("bankMovement", e.target.value)}
          />
          <label htmlFor="bankExpenseMovement"> Dépense </label>
        </li>
      </ul>
      {errors.amount && <p className="error">{errors.amount}</p>}

      <button type="submit">Ajouter</button>
    </form>
  );
}

// Composant tableau
function TransactionsTable({
  transactions,
  headers,
  hoveredRow,
  onHover,
  onDelete,
}) {
  return (
    <div className="table-grid">
      <div className="table-header">
        {headers.map((item, index) => (
          <div key={index} className="table-cell header">
            {item}
          </div>
        ))}
      </div>
      {transactions.map((t) => (
        <div
          key={t.id}
          className="table-row"
          onMouseEnter={() => onHover(t.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div className="table-cell">{t.date}</div>
          <div className="table-cell">{t.theme}</div>
          <div className="table-cell">{t.payment}</div>
          <div className="table-cell">{t.designation}</div>
          <div className="table-cell">
            {t.recette ? FormatCurrency(t.recette) : ""}
          </div>
          <div className="table-cell">
            {t.depense ? FormatCurrency(t.depense) : ""}
          </div>
          <div className="table-cell">{FormatCurrency(t.solde)}</div>
          <div className="table-cell actions">
            {hoveredRow === t.id && (
              <button onClick={() => onDelete(t.id)}>✖</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
