import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  APP_LABELS,
  MONTHS,
} from './utils';

function MonthTabs({ selectedMonth, onMonthChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const columns = useMemo(() => {
    const item = (label, value) => ({ label, value });
    return [
      [item("Tous", null)],
      MONTHS.slice(0, 4).map((m, i) => item(m, i)),
      MONTHS.slice(4, 8).map((m, i) => item(m, i + 4)),
      MONTHS.slice(8).map((m, i) => item(m, i + 8)),
    ];
  }, []);

  const currentLabel = useMemo(
    () => (selectedMonth == null ? "Tous" : MONTHS[selectedMonth] ?? ""),
    [selectedMonth]
  );

  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onHeaderKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const onOptionKey = (value) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onMonthChange(value);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="month-tabs">
      <div
        className="month-tabs__header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="month-tabs-panel"
        id="month-tabs-trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onHeaderKey}
      >
        <div className="month-tabs__label">{APP_LABELS.monthLabel}</div>
        <div className="month-tabs__current">{currentLabel}</div>
      </div>

      <div
        className="month-tabs__grid"
        role="listbox"
        aria-labelledby="month-tabs-trigger"
        hidden={!open}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="month-tabs__col">
            {col.map((opt) => {
              const active = selectedMonth === opt.value;
              const key = opt.value ?? "all";
              return (
                <div
                  key={key}
                  className={`month-tabs__btn${active ? " active" : ""}`}
                  role="option"
                  aria-selected={active}
                  tabIndex={0}
                  onClick={() => {
                    onMonthChange(opt.value);
                    setOpen(false);
                  }}
                  onKeyDown={onOptionKey(opt.value)}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthTabs;
