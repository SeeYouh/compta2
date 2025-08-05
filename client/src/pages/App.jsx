// import AmountInput from "../components/AmountInput";
// import PaymentSelector from "../components/PaymentSelector";
// import ThemeSelector from "../components/ThemeSelector";

// function App() {
//   const labelNavBar = [
//     "Dates",
//     "Thèmes",
//     "Moyens de paiement",
//     "Désignations",
//     "Recettes",
//     "Dépenses",
//     "Soldes",
//   ];

//   return (
//     <>
//       <form action="post">
//         <input type="date" name="actionDate" id="actionDate" />
//         <ThemeSelector />
//         <PaymentSelector />
//         <input type="text" name="" id="" />
//         <AmountInput />
//         <ul>
//           <li>
//             <input type="radio" name="bankMovement" id="bankIncomeMovement" />
//             <label htmlFor="bankIncomeMovement"> Recette </label>
//           </li>
//           <li>
//             <input type="radio" name="bankMovement" id="bankExpenseMovement" />
//             <label htmlFor="bankExpenseMovement"> Dépense </label>
//           </li>
//         </ul>
//       </form>
//       {labelNavBar.map((item, label) => {
//         return (
//           <ul key={item + label}>
//             <li> {item} </li>
//           </ul>
//         );
//       })}
//     </>
//   );
// }

// export default App;

import { useEffect, useState } from "react";

import AmountInput from "../components/AmountInput";
import BalanceCalculator from "../components/BalanceCalculator";
import FormatCurrency from "../components/utils/FormatCurrency";
import PaymentSelector from "../components/PaymentSelector";
import ThemeSelector from "../components/ThemeSelector";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [errors, setErrors] = useState({}); // état pour stocker les erreurs

  const labelNavBar = [
    "Dates",
    "Thèmes",
    "Moyens de paiement",
    "Désignations",
    "Recettes",
    "Dépenses",
    "Soldes",
    "Actions",
  ];

  // Charger les transactions depuis json-server
  useEffect(() => {
    fetch("http://localhost:3001/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Erreur chargement transactions :", err));
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR"); // → JJ/MM/AAAA
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const newTransaction = {
      date: formatDate(form.get("actionDate")),
      theme: form.get("theme"),
      payment: form.get("payment"),
      designation: form.get("designation"),
      recette: form.get("bankMovement") === "recette" ? form.get("amount") : "",
      depense: form.get("bankMovement") === "depense" ? form.get("amount") : "",
    };

    // Validation
    const newErrors = {};
    if (!newTransaction.date) newErrors.date = "La date est obligatoire.";
    if (!newTransaction.theme) newErrors.theme = "Le thème est obligatoire.";
    if (!newTransaction.payment)
      newErrors.payment = "Le moyen de paiement est obligatoire.";
    if (!newTransaction.designation)
      newErrors.designation = "La désignation est obligatoire.";
    if (!newTransaction.recette && !newTransaction.depense)
      newErrors.amount =
        "Le montant et le type (recette ou dépense) sont obligatoires.";

    // Si erreurs, on stoppe l'envoi
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sinon, envoi vers json-server
    await fetch("http://localhost:3001/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction),
    });

    // Recharge la liste
    fetch("http://localhost:3001/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Erreur rechargement transactions :", err));

    // Reset form & erreurs
    e.target.reset();
    setErrors({});
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/transactions/${id}`, {
      method: "DELETE",
    });

    // Recharger après suppression
    fetch("http://localhost:3001/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Erreur suppression :", err));
  };

  const transactionsSorted = [...transactions].sort((a, b) => {
    // Convertit les dates JJ/MM/AAAA en objets Date pour comparer
    const [dayA, monthA, yearA] = a.date.split("/");
    const [dayB, monthB, yearB] = b.date.split("/");

    const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
    const dateB = new Date(`${yearB}-${monthB}-${dayB}`);

    return dateA - dateB; // tri croissant
  });

  const transactionsWithBalance = BalanceCalculator({
    transactions: transactionsSorted,
  });
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Date */}
        <input type="date" name="actionDate" />
        {errors.date && <p className="error">{errors.date}</p>}

        {/* Thème */}
        <ThemeSelector
          onChange={({ theme }) => {
            document.querySelector('input[name="theme"]').value = theme;
          }}
        />
        <input type="hidden" name="theme" />
        {errors.theme && <p className="error">{errors.theme}</p>}

        {/* Moyen de paiement */}
        <PaymentSelector
          onChange={(payment) => {
            document.querySelector('input[name="payment"]').value = payment;
          }}
        />
        <input type="hidden" name="payment" />
        {errors.payment && <p className="error">{errors.payment}</p>}

        {/* Désignation */}
        <input type="text" name="designation" placeholder="Désignation" />
        {errors.designation && <p className="error">{errors.designation}</p>}

        {/* Montant + Recette/Dépense */}
        <AmountInput
          onChange={(val) => {
            document.querySelector('input[name="amount"]').value = val;
          }}
        />
        <input type="hidden" name="amount" />

        <ul>
          <li>
            <input
              type="radio"
              name="bankMovement"
              id="bankIncomeMovement"
              value="recette"
            />
            <label htmlFor="bankIncomeMovement"> Recette </label>
          </li>
          <li>
            <input
              type="radio"
              name="bankMovement"
              id="bankExpenseMovement"
              value="depense"
            />
            <label htmlFor="bankExpenseMovement"> Dépense </label>
          </li>
        </ul>
        {errors.amount && <p className="error">{errors.amount}</p>}

        <button type="submit">Ajouter</button>
      </form>

      {/* Tableau */}
      <div className="table-grid">
        <div className="table-header">
          {labelNavBar.map((item, index) => (
            <div key={index} className="table-cell header">
              {item}
            </div>
          ))}
        </div>

        {transactionsWithBalance.map((t, i) => (
          <div
            key={i}
            className="table-row"
            onMouseEnter={() => setHoveredRow(t.id)}
            onMouseLeave={() => setHoveredRow(null)}
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
                <button onClick={() => handleDelete(t.id)}>✖</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
