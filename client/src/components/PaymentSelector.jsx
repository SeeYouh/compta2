import React, { useEffect, useRef, useState } from "react";

import payments from "../data/labelPayments.json";
import styles from "../sass/components/PaymentSelector.module.scss";

const PaymentSelector = ({ onChange }) => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null); // Référence sur le conteneur

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setMenuOpen(false);
    if (onChange) onChange(payment);
  };

  // Gestion clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
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

// import React, { useMemo, useState } from "react";

// import payments from "../data/labelPayments.json";
// import Select from "./ui/Select";
// import styles from "../sass/components/PaymentSelector.module.scss";

// const PaymentSelector = ({ onChange, defaultValue = "" }) => {
//   const [value, setValue] = useState(defaultValue || "");
//   const opts = useMemo(() => payments, []);

//   const handleChange = (opt) => {
//     setValue(opt);
//     onChange?.(opt);
//   };

//   return (
//     <Select
//       value={value}
//       onChange={handleChange}
//       options={opts}
//       placeholder="Moyen de paiement"
//       getKey={(v) => v}
//       getLabel={(v) => v}
//       classNames={{
//         wrapper: styles.wrapper,
//         trigger: styles.selector,
//         menu: styles.menu,
//         menuItem: styles.menuItem,
//         active: styles.active,
//       }}
//     />
//   );
// };

// export default PaymentSelector;
