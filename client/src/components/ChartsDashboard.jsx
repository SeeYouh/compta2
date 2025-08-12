import { useMemo, useState } from "react";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import { filterByMonth } from "./utils/transactionsDerivers";
import FormatCurrency from "./utils/FormatCurrency";
import { MONTHS } from "./utils";

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

  // Données pour le Bar (comparaison par thème entre deux mois)
  const barData = useMemo(() => {
    const txA = filterByMonth(transactions, monthA);
    const txB = filterByMonth(transactions, monthB);

    const totalsA = {};
    const totalsB = {};

    for (const t of txA) {
      const amount = Number(t.depense || 0);
      if (!amount) continue;
      totalsA[t.theme] = (totalsA[t.theme] || 0) + amount;
    }

    for (const t of txB) {
      const amount = Number(t.depense || 0);
      if (!amount) continue;
      totalsB[t.theme] = (totalsB[t.theme] || 0) + amount;
    }

    const labels = Array.from(
      new Set([...Object.keys(totalsA), ...Object.keys(totalsB)])
    ).sort();

    return {
      labels,
      datasets: [
        {
          label: MONTHS[monthA],
          data: labels.map((l) => totalsA[l] ?? 0),
          backgroundColor: "#4e79a7",
        },
        {
          label: MONTHS[monthB],
          data: labels.map((l) => totalsB[l] ?? 0),
          backgroundColor: "#e15759",
        },
      ],
    };
  }, [transactions, monthA, monthB]);

  // Données pour le Pie (répartition par thème sur un mois)
  const pieData = useMemo(() => {
    const txs = filterByMonth(transactions, monthPie);
    const totals = {};

    for (const t of txs) {
      const amount = Number(t.depense || 0);
      if (!amount) continue;
      totals[t.theme] = (totals[t.theme] || 0) + amount;
    }

    const labels = Object.keys(totals);
    const data = Object.values(totals);
    const colors = [
      "#4e79a7",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc949",
      "#bab0ab",
      "#86bc86",
      "#c4b7e3",
      "#f3c7a7",
      "#d37295",
      "#e57373",
      "#6baed6",
      "#a6d854",
      "#f2cf5b",
      "#f28e2b",
      "#b5cf6b",
      "#ffb6c1",
      "#c6a49a",
    ];

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
      <div className="charts-dashboard_group">
        {showBar && (
          <div
            className="charts-dashboard__chart"
            style={{ maxWidth: "700px", maxHeight: "500px" }}
          >
            <div className="charts-dashboard__filters">
              <select
                value={monthA}
                onChange={(e) => setMonthA(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={monthB}
                onChange={(e) => setMonthB(Number(e.target.value))}
              >
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
                maintainAspectRatio: false,
                borderRadius: 100,
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `${context.dataset.label}: ${FormatCurrency(
                          context.parsed.y
                        )}`,
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => FormatCurrency(value),
                    },
                  },
                },
              }}
            />
          </div>
        )}

        {showPie && (
          <div
            className="charts-dashboard__chart"
            style={{ maxWidth: "500px", maxHeight: "500px" }}
          >
            <div className="charts-dashboard__filters">
              <select
                value={monthPie}
                onChange={(e) => setMonthPie(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Doughnut
              data={pieData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `${context.label}: ${FormatCurrency(context.parsed)}`,
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
