// import React, { useEffect, useMemo, useRef, useState } from "react";

// const MONTHS_FR = Array.from({ length: 12 }, (_, i) =>
//   new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(
//     new Date(2025, i, 1)
//   )
// ).map((m) => m.charAt(0).toUpperCase() + m.slice(1));

// const MonthTabs = ({ months, selectedMonth, onSelect }) => {
//   const columns = [
//     [
//       { label: "Tous", value: null },
//       ...months.slice(0, 4).map((m, i) => ({ label: m, value: i })),
//     ],
//     months.slice(4, 8).map((m, i) => ({ label: m, value: i + 4 })),
//     months.slice(8).map((m, i) => ({ label: m, value: i + 8 })),
//   ];

//   const currentLabel =
//     selectedMonth === null ? "Tous" : months[selectedMonth] || "";

//   return (
//     <div className="month-tabs">
//       <div className="month-tabs__header">
//         <div className="month-tabs__label">Mois</div>
//         <div className="month-tabs__current">{currentLabel}</div>
//       </div>
//       <div className="month-tabs__grid">
//         {columns.map((col, cIdx) => (
//           <div key={cIdx} className="month-tabs__col">
//             {col.map(({ label, value }) => (
//               <div
//                 key={label}
//                 className={`month-tabs__btn ${
//                   selectedMonth === value ? "active" : ""
//                 }`}
//                 onClick={() => onSelect(value)}
//               >
//                 {label}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
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
// };

// export default MonthTabs;

// import { useEffect, useRef, useState } from "react";

// export default function MonthTabs({
//   columns,
//   currentLabel,
//   selectedMonth,
//   onSelect,
// }) {
//   const [open, setOpen] = useState(false);
//   const rootRef = useRef(null);

//   // Clic extérieur + Échap
//   useEffect(() => {
//     const onPointerDown = (e) => {
//       if (rootRef.current && !rootRef.current.contains(e.target))
//         setOpen(false);
//     };
//     const onKeyDown = (e) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("pointerdown", onPointerDown, { passive: true });
//     document.addEventListener("keydown", onKeyDown);
//     return () => {
//       document.removeEventListener("pointerdown", onPointerDown);
//       document.removeEventListener("keydown", onKeyDown);
//     };
//   }, []);

//   const toggle = () => setOpen((v) => !v);
//   const onHeaderKeyDown = (e) => {
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       toggle();
//     }
//   };

//   return (
//     <div
//       ref={rootRef}
//       className={`month-tabs ${open ? "is-open" : ""}`}
//       data-state={open ? "open" : "closed"}
//     >
//       <div
//         className="month-tabs__header"
//         role="button"
//         tabIndex={0}
//         aria-expanded={open}
//         aria-controls="month-tabs-panel"
//         onClick={toggle}
//         onKeyDown={onHeaderKeyDown}
//       >
//         <div className="month-tabs__label">Mois</div>
//         <div className="month-tabs__current">{currentLabel}</div>
//       </div>

//       <div
//         id="month-tabs-panel"
//         className="month-tabs__grid"
//         aria-hidden={!open}
//       >
//         {columns.map((col, cIdx) => (
//           <div key={cIdx} className="month-tabs__col">
//             {col.map(({ label, value }) => (
//               <div
//                 key={label}
//                 className={`month-tabs__btn ${
//                   selectedMonth === value ? "active" : ""
//                 }`}
//                 onClick={() => {
//                   onSelect(value);
//                   setOpen(false);
//                 }}
//               >
//                 {label}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";

export default function MonthTabs({ months, selectedMonth, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // === Tes définitions reprises à l’identique ===
  const columns = [
    [
      { label: "Tous", value: null },
      ...months.slice(0, 4).map((m, i) => ({ label: m, value: i })),
    ],
    months.slice(4, 8).map((m, i) => ({ label: m, value: i + 4 })),
    months.slice(8).map((m, i) => ({ label: m, value: i + 8 })),
  ];

  const currentLabel =
    selectedMonth === null ? "Tous" : months[selectedMonth] || "";

  // Clic extérieur + Échap
  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="month-tabs">
      <div
        className="month-tabs__header"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        aria-controls="month-tabs-panel"
      >
        <div className="month-tabs__label">Mois</div>
        <div className="month-tabs__current">{currentLabel}</div>
      </div>

      <div
        id="month-tabs-panel"
        className="month-tabs__grid"
        style={{ display: open ? "flex" : "none" }}
        aria-hidden={!open}
      >
        {columns.map((col, cIdx) => (
          <div key={cIdx} className="month-tabs__col">
            {col.map(({ label, value }) => (
              <div
                key={label}
                className={`month-tabs__btn ${
                  selectedMonth === value ? "active" : ""
                }`}
                onClick={() => {
                  onSelect(value);
                  setOpen(false); // ferme après sélection
                }}
              >
                {label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
