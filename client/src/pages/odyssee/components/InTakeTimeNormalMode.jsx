import { daysTime, inTakeTimeMoment } from "../utils/variable";
import NightTime from "./NightTime";
import RangeHours from "./RangeHours";

const InTakeTimeNormalMode = ({
  checkedMoments,
  selectedTime,
  durationBefore,
  durationAfter,
  onMomentChange,
  onTimeChange,
  onBeforeChange,
  onAfterChange,
  nightDuration,
  onNightDurationChange,
}) => {
  const toggleMoment = (moment) => {
    const isChecked = checkedMoments.includes(moment);
    if (isChecked && checkedMoments.length === 1) return;

    const newMoments = isChecked
      ? checkedMoments.filter((m) => m !== moment)
      : [...checkedMoments, moment];

    onMomentChange(newMoments);
  };

  const hasMomentJournée = checkedMoments.some((m) => m !== "Nuit");
  const hasNuit = checkedMoments.includes("Nuit");

  return (
    <div>
      <ul className="inTakeTime-moment">
        {inTakeTimeMoment.map((item, index) => {
          const isChecked = checkedMoments.includes(item);
          const isDisabled = isChecked && checkedMoments.length === 1;

          return (
            <li key={"iTTM" + item + index}>
              <input
                className="input-dysplay-none"
                type="checkbox"
                name="inTakeTimeMoment"
                id={item}
                checked={isChecked}
                onChange={() => toggleMoment(item)}
                disabled={isDisabled}
              />
              <label htmlFor={item}> {item} </label>
            </li>
          );
        })}
      </ul>

      {hasMomentJournée && (
        <div className="inTakeTime-container_moment">
          <h4>Journée</h4>
          <ul>
            {daysTime.map(({ id, label, hasRange, index }) => {
              const isActive = selectedTime === id;
              const rangeValue =
                id === "beforeMeal" ? durationBefore : durationAfter;

              const handleChange = () => {
                onTimeChange(id);
              };

              const handleRangeChange =
                id === "beforeMeal" ? onBeforeChange : onAfterChange;

              return (
                <li key={id + index}>
                  <input
                    className="input-dysplay-none"
                    type="radio"
                    name="daysTime"
                    id={id}
                    checked={isActive}
                    onChange={handleChange}
                  />
                  <label htmlFor={id}>
                    <div className="inTakeTime-container_moment__label">
                      {label}
                    </div>
                    {hasRange && (
                      <div className="custom-range">
                        <RangeHours
                          value={rangeValue}
                          onChange={handleRangeChange}
                          disabled={!isActive}
                        />
                      </div>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="inTakeTime-container_moment">
        {hasNuit && (
          <NightTime value={nightDuration} onChange={onNightDurationChange} />
        )}
      </div>
    </div>
  );
};

export default InTakeTimeNormalMode;
