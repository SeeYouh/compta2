import React from "react";

import AmountInput from "./AmountInput";
import PaymentSelector from "./PaymentSelector";
import ThemeSelector from "./ThemeSelector";

function TransactionForm({ formData, errors, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form-container">
      <input
        type="date"
        name="actionDate"
        value={formData.date}
        onChange={(e) => onChange("date", e.target.value)}
      />
      {errors.date && <p className="error">{errors.date}</p>}

      <ThemeSelector
        onChange={({ theme, subTheme }) => {
          onChange("theme", theme);
          onChange("subTheme", subTheme);
        }}
      />
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

export default TransactionForm;
