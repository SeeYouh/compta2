import RangeHours from "./RangeHours";

const NightTime = ({ value, onChange }) => {
  return (
    <>
      <h4>Nuit</h4>
      <label
        htmlFor="nightBefore"
        className="inTakeTime-container_moment__label"
      >
        Avant le coucher
      </label>
      <div className="custom-range">
        <RangeHours value={value} onChange={onChange} />
      </div>
    </>
  );
};

export default NightTime;
