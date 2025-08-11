import { useState, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { MONTHS } from "./utils";
import { filterByMonth } from "./utils/transactionsDerivers";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

export default function ChartsDashboard({ transactions }) {
  const [showBar, setShowBar] = useState(true);
  const [showPie, setShowPie] = useState(true);
  const [monthA, setMonthA] = useState(0);
  const [monthB, setMonthB] = useState(1);
  const [monthPie, setMonthPie] = useState(0);

  const monthTotals = useMemo(
    () =>
      (month) => {
        const txs = filterByMonth(transactions, month);
        return txs.reduce((s, t) => s + Number(t.depense || 0), 0);
      },
    [transactions]
  );

  const barData = useMemo(
    () => ({
      labels: [MONTHS[monthA].slice(0, 3), MONTHS[monthB].slice(0, 3)],
      datasets: [
        {
          label: "Dépenses",
          data: [monthTotals(monthA), monthTotals(monthB)],
          backgroundColor: ["#4e79a7", "#f28e2b"],
        },
      ],
    }),
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
    const labels = Object.keys(totals);
    const data = Object.values(totals);
    const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949"];
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        },
      ],
    };
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
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
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
          <Pie data={pieData} />
        </div>
      )}
    </div>
  );
}

