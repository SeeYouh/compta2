import React, { useMemo, useRef, useState } from "react";

import { useClickOutside } from "../hooks/useClickOutside";

const PaymentFilterMenu = ({
  transactions,
  value,
  onChange,
  label = "Paiement",
}) => {
  // value: string | null (null = Tous)
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const payments = useMemo(() => {
    const set = new Set();
    for (const t of transactions) if (t?.payment) set.add(t.payment);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [transactions]);

  // Répartition en 3 colonnes (après la colonne "Tous") pour suivre MonthTabs
  const columns = useMemo(() => {
    const item = (label, value) => ({ label, value });
    const count = payments.length;
    const perCol = count > 0 ? Math.ceil(count / 3) : 0;
    return [
      [item("Tous", null)],
      payments.slice(0, perCol).map((p) => item(p, p)),
      payments.slice(perCol, perCol * 2).map((p) => item(p, p)),
      payments.slice(perCol * 2).map((p) => item(p, p)),
    ];
  }, [payments]);

  const currentLabel = value ?? "Tous";

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const onHeaderKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const onOptionKey = (val) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(val);
    }
  };

  return (
    <div ref={ref} className="month-tabs">
      <div
        className="month-tabs__header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="payment-filter-panel"
        id="payment-filter-trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onHeaderKey}
      >
        <div className="month-tabs__label">{label}</div>
        <div className="month-tabs__current">{currentLabel}</div>
      </div>

      <div
        id="payment-filter-panel"
        className="month-tabs__grid"
        role="listbox"
        aria-labelledby="payment-filter-trigger"
        hidden={!open}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="month-tabs__col">
            {col.map((opt) => {
              const active = value === opt.value;
              const key = opt.value ?? "all";
              return (
                <div
                  key={key}
                  className={`month-tabs__btn${active ? " active" : ""}`}
                  role="option"
                  aria-selected={active}
                  tabIndex={0}
                  onClick={() => handleSelect(opt.value)}
                  onKeyDown={onOptionKey(opt.value)}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentFilterMenu;
