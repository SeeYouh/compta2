const durationOptions = [
  { display: "1 jour", value: 1 },
  { display: "2 jours", value: 2 },
  { display: "3 jours", value: 3 },
  { display: "4 jours", value: 4 },
  { display: "5 jours", value: 5 },
  { display: "6 jours", value: 6 },
  { display: "1 semaine", value: 7 },
  { display: "2 semaines", value: 14 },
  { display: "3 semaines", value: 21 },
  { display: "1 mois", value: 30 },
  { display: "2 mois", value: 60 },
  { display: "3 mois", value: 90 },
  { display: "4 mois", value: 120 },
  { display: "5 mois", value: 150 },
  { display: "6 mois", value: 180 },
];

const RangeDays = ({ value, onChange }) => {
  const idx = durationOptions.findIndex((opt) => opt.value === value);

  return (
    <div className="range-value">
      <input
        type="range"
        min={0}
        max={durationOptions.length - 1}
        step={1}
        value={idx === -1 ? 0 : idx}
        onChange={(e) => onChange(durationOptions[+e.target.value].value)}
      />
      <label>
        {durationOptions[idx]?.display ?? durationOptions[0].display}
      </label>
    </div>
  );
};

export default RangeDays;
