// import React, { useEffect, useMemo, useRef, useState } from "react";

// const MONTHS_FR = Array.from({ length: 12 }, (_, i) =>
//   new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(
//     new Date(2025, i, 1)
//   )
// ).map((m) => m.charAt(0).toUpperCase() + m.slice(1));

const MonthTabs = ({ months, selectedMonth, onSelect }) => {
  return (
    <div className="month-tabs">
      {months.map((month, index) => (
        <div
          key={index}
          className={`month-tabs__btn ${
            selectedMonth === index ? "active" : ""
          }`}
          onClick={() => onSelect(index)}
        >
          {month}
        </div>
      ))}
      <div
        className={`month-tabs__btn ${selectedMonth === null ? "active" : ""}`}
        onClick={() => onSelect(null)}
      >
        Tous
      </div>
    </div>
  );
  // const [open, setOpen] = useState(false);
  // const ref = useRef(null);

  // const options = useMemo(
  //   () => [
  //     { key: "all", label: "Tous" },
  //     ...MONTHS_FR.map((m, i) => ({ key: i, label: m })),
  //   ],
  //   []
  // );

  // // Click outside to close
  // useEffect(() => {
  //   function onDocClick(e) {
  //     if (!ref.current) return;
  //     if (!ref.current.contains(e.target)) setOpen(false);
  //   }
  //   document.addEventListener("mousedown", onDocClick);
  //   return () => document.removeEventListener("mousedown", onDocClick);
  // }, []);

  // const currentLabel = value === "all" ? "Tous" : MONTHS_FR[value];

  // return (
  //   <div className="month-picker" ref={ref}>
  //     <div className="month-picker__bar">
  //       <button
  //         type="button"
  //         className="chip"
  //         aria-haspopup="true"
  //         aria-expanded={open}
  //         onClick={() => setOpen((s) => !s)}
  //       >
  //         {currentLabel}
  //       </button>
  //     </div>

  //     {open && (
  //       <div
  //         className="month-picker__panel"
  //         role="listbox"
  //         aria-label="Choisir un mois"
  //       >
  //         {options.map((opt) => {
  //           const active = String(opt.key) === String(value);
  //           return (
  //             <button
  //               key={opt.key}
  //               role="option"
  //               aria-selected={active}
  //               className={`chip month-option${active ? " chip--active" : ""}`}
  //               onClick={() => {
  //                 onChange?.(opt.key);
  //                 setOpen(false);
  //               }}
  //             >
  //               {opt.label}
  //             </button>
  //           );
  //         })}
  //       </div>
  //     )}
  //   </div>
  // );
};

export default MonthTabs;
