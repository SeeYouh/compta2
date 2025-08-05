import React, { useState } from "react";

import styles from "./AmountInput.module.scss";

const AmountInput = ({ onChange }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleBlur = () => {
    if (amount === "") return;

    // Vérifie si la valeur a max 2 décimales
    const regex = /^\d+(\.\d{1,2})?$/;

    if (regex.test(amount)) {
      // Formate avec 2 décimales
      const formatted = parseFloat(amount).toFixed(2);
      setAmount(formatted);
      setError("");
      if (onChange) onChange(formatted);
    } else {
      setError("Le montant doit avoir au maximum 2 décimales.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={handleBlur}
        placeholder="Montant"
        step="0.01"
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default AmountInput;
