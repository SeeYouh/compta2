import React from 'react';

import { PERIOD_OPTIONS } from '../utils';

const PeriodFilter = ({ value, onChange }) => {
  return (
    <select
      id="period-select"
      value={value || "all"}
      onChange={(e) => onChange(e.target.value)}
      className="period-select"
    >
      {PERIOD_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default PeriodFilter;
