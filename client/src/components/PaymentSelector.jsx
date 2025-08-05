import React, { useState } from "react";

import payments from "../data/labelPayments.json"; // tableau simple ["CB", "Virement", etc.]
import styles from "./PaymentSelector.module.scss";

const PaymentSelector = ({ onChange }) => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setMenuOpen(false);
    if (onChange) onChange(payment);
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        value={selectedPayment}
        placeholder="Moyen de paiement"
        readOnly
        onClick={() => setMenuOpen((prev) => !prev)}
      />

      {menuOpen && (
        <ul className={styles.menu}>
          {payments.map((payment) => (
            <li
              key={payment}
              className={styles.menuItem}
              onClick={() => handleSelectPayment(payment)}
            >
              {payment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentSelector;
