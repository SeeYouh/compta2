const durationOptions = [
  { display: "10 mn", value: 10 },
  { display: "20 mn", value: 20 },
  { display: "30 mn", value: 30 },
  { display: "1h", value: 60 },
  { display: "2h", value: 120 },
];

const RangeHours = ({ value, onChange, disabled }) => {
  const idx = durationOptions.findIndex((opt) => opt.value === value);

  return (
    <div className="range-value">
      <input
        type="range"
        min={0}
        max={durationOptions.length - 1}
        step={1}
        value={idx === -1 ? 0 : idx}
        onChange={(e) => {
          if (!disabled) onChange(durationOptions[+e.target.value].value);
        }}
        disabled={disabled}
        className={disabled ? "range-disabled" : ""}
      />
      <label>
        {durationOptions[idx]?.display ?? durationOptions[0].display}
      </label>
    </div>
  );
};

export default RangeHours;
