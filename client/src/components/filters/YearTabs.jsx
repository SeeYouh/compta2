import React from "react";

import cn from "classnames";

const YearTabs = ({ years, selectedYear, onChange }) => {
  // years: number[] triées (ex: [2025, 2024, 2023])
  // selectedYear: number | null (null = "Tous")
  return (
    <nav className="year-tabs" role="tablist" aria-label="Années">
      <button
        type="button"
        role="tab"
        aria-selected={selectedYear === null}
        className={cn("tab", { active: selectedYear === null })}
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
          className={cn("tab", { active: selectedYear === y })}
          onClick={() => onChange(y)}
        >
          {y}
        </button>
      ))}
    </nav>
  );
};

export default YearTabs;
