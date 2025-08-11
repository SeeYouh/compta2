import { useState, useMemo } from "react";
import { MONTHS } from "./utils";
import { filterByMonth } from "./utils/transactionsDerivers";

// Simple SVG based charts to avoid extra dependencies
const BarChart = ({ data, width = 300, height = 150 }) => {
  const max = Math.max(...data.map((d) => d.value), 0);
  const barWidth = width / data.length;
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const barHeight = max ? (d.value / max) * (height - 20) : 0;
        return (
          <g key={d.label}>
            <rect
              x={i * barWidth + 5}
              y={height - barHeight - 20}
              width={barWidth - 10}
              height={barHeight}
              fill="#4e79a7"
            />
            <text
              x={i * barWidth + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const PieChart = ({ data, size = 160 }) => {
  const radius = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>\n      {data.map((d, i) => {
        const startAngle = (cumulative / total) * 2 * Math.PI;
        cumulative += d.value;
        const endAngle = (cumulative / total) * 2 * Math.PI;
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const x1 = radius + radius * Math.cos(startAngle);
        const y1 = radius + radius * Math.sin(startAngle);
        const x2 = radius + radius * Math.cos(endAngle);
        const y2 = radius + radius * Math.sin(endAngle);
        return (
          <path
            key={d.name}
            d={`M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} z`}
            fill={colors[i % colors.length]}
          />
        );
      })}
    </svg>
  );
};

export default function ChartsDashboard({ transactions }) {
  const [showBar, setShowBar] = useState(true);
  const [showPie, setShowPie] = useState(true);
  const [monthA, setMonthA] = useState(0);
  const [monthB, setMonthB] = useState(1);
  const [monthPie, setMonthPie] = useState(0);

  const monthTotals = useMemo(() => (month) => {
    const txs = filterByMonth(transactions, month);
    return txs.reduce((s, t) => s + Number(t.depense || 0), 0);
  }, [transactions]);

  const barData = useMemo(
    () => [
      { label: MONTHS[monthA].slice(0, 3), value: monthTotals(monthA) },
      { label: MONTHS[monthB].slice(0, 3), value: monthTotals(monthB) },
    ],
    [monthA, monthB, monthTotals]
  );

  const pieData = useMemo(() => {
    const txs = filterByMonth(transactions, monthPie);
    const totals = {};
    txs.forEach((t) => {
      const amount = Number(t.depense || 0);
      if (!amount) return;
      totals[t.theme] = (totals[t.theme] || 0) + amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions, monthPie]);

  return (
    <div className="charts-dashboard">
      <div className="charts-dashboard__controls">
        <label>
          <input
            type="checkbox"
            checked={showBar}
            onChange={() => setShowBar((v) => !v)}
          />
          Comparaison
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPie}
            onChange={() => setShowPie((v) => !v)}
          />
          Répartition
        </label>
      </div>

      {showBar && (
        <div className="charts-dashboard__chart">
          <div className="charts-dashboard__filters">
            <select value={monthA} onChange={(e) => setMonthA(Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select value={monthB} onChange={(e) => setMonthB(Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <BarChart data={barData} />
        </div>
      )}

      {showPie && (
        <div className="charts-dashboard__chart">
          <div className="charts-dashboard__filters">
            <select value={monthPie} onChange={(e) => setMonthPie(Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <PieChart data={pieData} />
        </div>
      )}
    </div>
  );
}

