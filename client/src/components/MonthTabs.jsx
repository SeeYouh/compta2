import { useEffect, useRef, useState } from "react";

const MonthTabs = ({ months, selectedMonth, onSelect }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const columns = [
    [{ label: "Tous", value: null }, ...months.slice(0, 4).map((m, i) => ({ label: m, value: i }))],
    months.slice(4, 8).map((m, i) => ({ label: m, value: i + 4 })),
    months.slice(8).map((m, i) => ({ label: m, value: i + 8 })),
  ];

  const currentLabel =
    selectedMonth === null ? "Tous" : months[selectedMonth] || "";

  const toggleOpen = () => setOpen((o) => !o);

  const handleSelect = (value) => {
    onSelect(value);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="month-tabs" ref={containerRef}>
      <div className="month-tabs__header" onClick={toggleOpen}>
        <div className="month-tabs__label">Mois</div>
        <div className="month-tabs__current">{currentLabel}</div>
      </div>
      {open && (
        <div className="month-tabs__grid">
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="month-tabs__col">
              {col.map(({ label, value }) => (
                <div
                  key={label}
                  className={`month-tabs__btn ${
                    selectedMonth === value ? "active" : ""
                  }`}
                  onClick={() => handleSelect(value)}
                >
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthTabs;
