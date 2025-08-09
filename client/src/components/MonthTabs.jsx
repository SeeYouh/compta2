const MonthTabs = ({ months, selectedMonth, onSelect }) => {
  const columns = [
    [{ label: "Tous", value: null }, ...months.slice(0, 4).map((m, i) => ({ label: m, value: i }))],
    months.slice(4, 8).map((m, i) => ({ label: m, value: i + 4 })),
    months.slice(8).map((m, i) => ({ label: m, value: i + 8 })),
  ];

  const currentLabel =
    selectedMonth === null ? "Tous" : months[selectedMonth] || "";

  return (
    <div className="month-tabs">
      <div className="month-tabs__header">
        <div className="month-tabs__label">Mois</div>
        <div className="month-tabs__current">{currentLabel}</div>
      </div>
      <div className="month-tabs__grid">
        {columns.map((col, cIdx) => (
          <div key={cIdx} className="month-tabs__col">
            {col.map(({ label, value }) => (
              <div
                key={label}
                className={`month-tabs__btn ${
                  selectedMonth === value ? "active" : ""
                }`}
                onClick={() => onSelect(value)}
              >
                {label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthTabs;
