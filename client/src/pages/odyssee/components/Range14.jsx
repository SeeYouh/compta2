import { numberArray } from './utils/numberArray';

const fractions = [
  { display: "1/4", value: 1 / 4 },
  { display: "1/3", value: 1 / 3 },
  { display: "1/2", value: 1 / 2 },
  { display: "3/4", value: 3 / 4 },
];

const entiers = numberArray(1, 20);

const options = [...fractions, ...entiers];

const Range14 = ({ value, onChange }) => {
  const idx = options.findIndex((opt) => opt.value === value);
  return (
    <div className="range-value">
      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(options[+e.target.value].value)}
      />
      <label>{options[idx]?.display}</label>
    </div>
  );
};

export default Range14;
