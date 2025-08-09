import React, { useEffect, useState } from "react";

import styles from "../sass/components/AmountInput.module.scss";

const AmountInput = ({ value, defaultValue = "", onChange, ...rest }) => {
  const isControlled = value !== undefined;
  const [local, setLocal] = useState(defaultValue);
  const [error, setError] = useState("");

  // Sync externe -> interne en mode contrôlé
  useEffect(() => {
    if (isControlled) {
      const v = value === null || value === undefined ? "" : String(value);
      setLocal(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isControlled]);

  const normalize = (v) => (v ?? "").replace(",", ".");

  const handleChange = (e) => {
    const raw = e.target.value;
    if (!isControlled) setLocal(raw);
    else onChange?.(normalize(raw)); // en contrôlé, le parent doit refléter la frappe
  };

  const handleBlur = () => {
    const display = isControlled ? String(value ?? "") : local;
    if (display === "") {
      setError("");
      return;
    }

    // Accepte 12,34 ou 12.34 (0 à 2 décimales)
    const regex = /^-?\d+(?:[.,]\d{0,2})?$/;
    if (!regex.test(display)) {
      setError("Le montant doit avoir au maximum 2 décimales.");
      return;
    }

    const num = Number.parseFloat(normalize(display));
    if (Number.isNaN(num)) {
      setError("Valeur numérique invalide.");
      return;
    }

    const formatted = num.toFixed(2); // standardise en 2 décimales avec point
    setError("");

    if (isControlled) {
      onChange?.(formatted);
    } else {
      setLocal(formatted);
      onChange?.(formatted);
    }
  };

  const displayValue = isControlled ? String(value ?? "") : local;

  return (
    <div className={styles.wrapper}>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Montant"
        {...rest}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default AmountInput;
