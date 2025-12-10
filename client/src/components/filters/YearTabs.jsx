import styles from "../../sass/components/YearsTabs.module.scss";

const YearTabs = ({ years, selectedYear, onChange }) => {
  // years: number[] triées (ex: [2025, 2024, 2023])
  // selectedYear: number | null (null = "Tous")
  return (
    <nav className="year-tabs" role="tablist" aria-label="Années">
      <button
        type="button"
        role="tab"
        aria-selected={selectedYear === null}
        className={`${styles.tab} ${
          selectedYear === null ? styles.active : ""
        }`}
        onClick={() => onChange(null)}
      >
        Tous
      </button>

      {years.map((y) => (
        <button
          key={y}
          type="button"
          role="tab"
          aria-selected={selectedYear === y}
          className={`${styles.tab} ${selectedYear === y ? styles.active : ""}`}
          onClick={() => onChange(y)}
        >
          {y}
        </button>
      ))}
    </nav>
  );
};

export default YearTabs;
