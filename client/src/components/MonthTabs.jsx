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
};

export default MonthTabs;
