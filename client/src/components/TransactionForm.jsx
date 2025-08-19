import { useRef, useState } from "react";

import AmountInput from "./AmountInput";
import PaymentSelector from "./PaymentSelector";
import ThemeSelector from "./ThemeSelector";

function TransactionForm({ formData, errors, onChange, onSubmit }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const handleToggle = () => setOpen((v) => !v);

  return (
    <section ref={rootRef} className="txn-form">
      {/* Header toggle */}
      <div
        className="txn-form__header"
        role="button"
        aria-expanded={open}
        aria-controls="txn-form-panel"
        id="txn-form-trigger"
        onClick={handleToggle}
      >
        <div className="txn-form__label">Ajouter un mouvement bancaire</div>
        <div className="txn-form__action" hidden={!open}>
          Annuler
        </div>
      </div>

      {/* Form panel */}
      <div
        id="txn-form-panel"
        className="txn-form__panel"
        role="region"
        aria-labelledby="txn-form-trigger"
        hidden={!open}
      >
        <form onSubmit={onSubmit} className="form-container">
          <div className="form-cell form-date">
            <input
              type="date"
              name="actionDate"
              value={formData.date}
              onChange={(e) => onChange("date", e.target.value)}
            />
            {errors.date && <p className="error">{errors.date}</p>}
          </div>

          <div className="form-cell form-theme">
            <ThemeSelector
              onChange={({ theme, subTheme }) => {
                onChange("theme", theme);
                onChange("subTheme", subTheme);
              }}
            />
            {errors.theme && <p className="error">{errors.theme}</p>}
          </div>

          <div className="form-cell form-payment">
            <PaymentSelector
              onChange={(payment) => onChange("payment", payment)}
            />
            {errors.payment && <p className="error">{errors.payment}</p>}
          </div>

          <div className="form-cell form-designation">
            <input
              type="text"
              name="designation"
              placeholder="Désignation"
              value={formData.designation}
              onChange={(e) => onChange("designation", e.target.value)}
            />
            {errors.designation && (
              <p className="error">{errors.designation}</p>
            )}
          </div>

          <div className="form-cell form-amount">
            <AmountInput onChange={(val) => onChange("amount", val)} />
          </div>

          <div className="form-cell form-movement">
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
                <label htmlFor="bankIncomeMovement">Recette</label>
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
                <label htmlFor="bankExpenseMovement">Dépense</label>
              </li>
            </ul>
            {errors.amount && <p className="error">{errors.amount}</p>}
          </div>

          <div className="form-cell form-submit">
            <button type="submit">Ajouter</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default TransactionForm;
