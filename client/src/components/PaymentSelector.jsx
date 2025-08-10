import React, { useEffect, useRef, useState } from "react";

import payments from "../data/labelPayments.json";
import styles from "../sass/components/PaymentSelector.module.scss";

const PaymentSelector = ({ value, onChange }) => {
  const [selectedPayment, setSelectedPayment] = useState(value || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Sync externe -> interne
  useEffect(() => {
    setSelectedPayment(value || "");
  }, [value]);

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setMenuOpen(false);
    onChange?.(payment);
  };

  // Gestion clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div
        className={`${styles.selector}`}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {selectedPayment || "Moyen de paiement"}
      </div>

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
