import React from "react";

import MonthFilterMenu from "./MonthFilterMenu";
import PaymentFilterMenu from "./PaymentFilterMenu";
import ThemeFilterMenu from "./ThemeFilterMenu";

const FiltersBar = ({
  transactions,
  month,
  onMonthChange,
  theme,
  onThemeChange,
  payment,
  onPaymentChange,
  onReset,
  rightSlot, // ex: bouton "Ajouter un mouvement"
}) => {
  return (
    <div className="filters-bar">
      <div className="filters-left">
        <MonthFilterMenu value={month} onChange={onMonthChange} />
        <ThemeFilterMenu
          transactions={transactions}
          value={theme}
          onChange={onThemeChange}
        />
        <PaymentFilterMenu
          transactions={transactions}
          value={payment}
          onChange={onPaymentChange}
        />
        <button type="button" className="reset-filters" onClick={onReset}>
          Réinitialiser
        </button>
      </div>

      <div className="filters-right">{rightSlot}</div>
    </div>
  );
};

export default FiltersBar;
