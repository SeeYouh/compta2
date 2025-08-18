// import { useEffect, useMemo, useState } from "react";

// import {
//   ArcElement,
//   BarElement,
//   CategoryScale,
//   Chart as ChartJS,
//   Legend,
//   LinearScale,
//   Tooltip,
// } from "chart.js";
// import { Bar, Doughnut } from "react-chartjs-2";

// import { filterByMonth } from "./utils/transactionsDerivers";
// import FormatCurrency from "./utils/FormatCurrency";
// import { MONTHS } from "./utils";
// import { parseFRDate } from "./utils/date";

// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// /**
//  * Props :
//  * - transactions : liste issue d'App.jsx APRÈS application des filtres (Année/Mois/Thème/Paiement)
//  * - filters : { year:null|number, month:null|0..11, theme?:string|null, payment?:string|null }
//  */
// export default function ChartsDashboard({ transactions, filters }) {
//   const [showBar, setShowBar] = useState(true);
//   const [showPie, setShowPie] = useState(true);

//   // Sélecteurs "mois" pour la comparaison (quand au moins un filtre est actif)
//   const [monthA, setMonthA] = useState(0);
//   const [monthB, setMonthB] = useState(1);

//   // État des filtres côté App
//   const themeSelected = Boolean(filters?.theme);
//   const paymentSelected = Boolean(filters?.payment);
//   const monthSelected = filters ? filters.month !== null : false;
//   const yearSelected = filters ? filters.year !== null : false;

//   // Tous les filtres neutres ?
//   const isAllNeutral =
//     !themeSelected && !paymentSelected && !monthSelected && !yearSelected;

//   // Années présentes dans le dataset reçu (multi-années si isAllNeutral)
//   const years = useMemo(() => {
//     const s = new Set();
//     for (const t of transactions) {
//       const d = parseFRDate(t.date);
//       if (!Number.isNaN(d)) s.add(d.getFullYear());
//     }
//     return Array.from(s).sort((a, b) => a - b);
//   }, [transactions]);

//   // Sélecteurs d'années pour la comparaison quand isAllNeutral = true
//   const [yearA, setYearA] = useState(null);
//   const [yearB, setYearB] = useState(null);

//   useEffect(() => {
//     if (years.length === 0) {
//       setYearA(null);
//       setYearB(null);
//       return;
//     }
//     if (!yearA || !years.includes(yearA)) setYearA(years[0]);
//     if (!yearB || !years.includes(yearB))
//       setYearB(years[Math.min(1, years.length - 1)]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [years]);

//   // -------------------------
//   // BAR (Comparaison)
//   // -------------------------
//   const barData = useMemo(() => {
//     const keyOf = (t) =>
//       themeSelected ? t.subTheme || "Inclassables" : t.theme || "Autres";

//     if (isAllNeutral) {
//       // Comparaison par ANNÉE (agrégation dépenses par [thème | sous-thème si thème sélectionné] — ici pas de thème sélectionné par définition)
//       const totalsA = {};
//       const totalsB = {};
//       for (const t of transactions) {
//         const d = parseFRDate(t.date);
//         if (Number.isNaN(d)) continue;
//         const y = d.getFullYear();
//         const amount = Number(t.depense || 0);
//         if (!amount) continue;

//         const k = keyOf(t);
//         if (y === yearA) totalsA[k] = (totalsA[k] || 0) + amount;
//         if (y === yearB) totalsB[k] = (totalsB[k] || 0) + amount;
//       }

//       const labels = Array.from(
//         new Set([...Object.keys(totalsA), ...Object.keys(totalsB)])
//       ).sort((a, b) => a.localeCompare(b, "fr"));

//       return {
//         labels,
//         datasets: [
//           {
//             label: yearA != null ? String(yearA) : "",
//             data: labels.map((l) => totalsA[l] ?? 0),
//             backgroundColor: "#4e79a7",
//           },
//           {
//             label: yearB != null ? String(yearB) : "",
//             data: labels.map((l) => totalsB[l] ?? 0),
//             backgroundColor: "#e15759",
//           },
//         ],
//       };
//     }

//     // Comparaison par MOIS (A vs B) à l'intérieur du dataset déjà filtré par App
//     const txA = filterByMonth(transactions, monthA);
//     const txB = filterByMonth(transactions, monthB);

//     const totalsA = {};
//     const totalsB = {};

//     for (const t of txA) {
//       const amount = Number(t.depense || 0);
//       if (!amount) continue;
//       const k = keyOf(t);
//       totalsA[k] = (totalsA[k] || 0) + amount;
//     }
//     for (const t of txB) {
//       const amount = Number(t.depense || 0);
//       if (!amount) continue;
//       const k = keyOf(t);
//       totalsB[k] = (totalsB[k] || 0) + amount;
//     }

//     const labels = Array.from(
//       new Set([...Object.keys(totalsA), ...Object.keys(totalsB)])
//     ).sort((a, b) => a.localeCompare(b, "fr"));

//     return {
//       labels,
//       datasets: [
//         {
//           label: MONTHS[monthA],
//           data: labels.map((l) => totalsA[l] ?? 0),
//           backgroundColor: "#4e79a7",
//         },
//         {
//           label: MONTHS[monthB],
//           data: labels.map((l) => totalsB[l] ?? 0),
//           backgroundColor: "#e15759",
//         },
//       ],
//     };
//   }, [transactions, isAllNeutral, monthA, monthB, yearA, yearB, themeSelected]);

//   // -------------------------
//   // PIE (Répartition)
//   // -------------------------
//   const pieData = useMemo(() => {
//     // IMPORTANT : on ne re-filtre plus par mois ici.
//     // On utilise exactement "transactions" (déjà filtrées côté App).
//     const baseTxs = transactions;

//     const keyOf = (t) =>
//       themeSelected ? t.subTheme || "Inclassables" : t.theme || "Inclassables";

//     const totals = {};
//     for (const t of baseTxs) {
//       const amount = Number(t.depense || 0);
//       if (!amount) continue;
//       const k = keyOf(t);
//       totals[k] = (totals[k] || 0) + amount;
//     }

//     const labels = Object.keys(totals).sort((a, b) => a.localeCompare(b, "fr"));
//     const data = labels.map((l) => totals[l]);

//     const colors = [
//       "#4e79a7",
//       "#e15759",
//       "#76b7b2",
//       "#59a14f",
//       "#edc949",
//       "#bab0ab",
//       "#86bc86",
//       "#c4b7e3",
//       "#f3c7a7",
//       "#d37295",
//       "#e57373",
//       "#6baed6",
//       "#a6d854",
//       "#f2cf5b",
//       "#f28e2b",
//       "#b5cf6b",
//       "#ffb6c1",
//       "#c6a49a",
//     ];

//     return {
//       labels,
//       datasets: [
//         {
//           data,
//           backgroundColor: labels.map((_, i) => colors[i % colors.length]),
//         },
//       ],
//     };
//   }, [transactions, themeSelected]);

//   return (
//     <div className="charts-dashboard">
//       <div className="charts-dashboard__controls">
//         <label>
//           <input
//             type="checkbox"
//             checked={showBar}
//             onChange={() => setShowBar((v) => !v)}
//           />
//           Comparaison
//         </label>
//         <label>
//           <input
//             type="checkbox"
//             checked={showPie}
//             onChange={() => setShowPie((v) => !v)}
//           />
//           Répartition
//         </label>
//       </div>

//       <div className="charts-dashboard_group">
//         {showBar && (
//           <div
//             className="charts-dashboard__chart"
//             style={{ maxWidth: "700px", maxHeight: "500px" }}
//           >
//             <div className="charts-dashboard__filters">
//               {isAllNeutral ? (
//                 <>
//                   <select
//                     value={yearA ?? ""}
//                     onChange={(e) => setYearA(Number(e.target.value))}
//                   >
//                     {years.map((y) => (
//                       <option key={`ya-${y}`} value={y}>
//                         {y}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={yearB ?? ""}
//                     onChange={(e) => setYearB(Number(e.target.value))}
//                   >
//                     {years.map((y) => (
//                       <option key={`yb-${y}`} value={y}>
//                         {y}
//                       </option>
//                     ))}
//                   </select>
//                 </>
//               ) : (
//                 <>
//                   <select
//                     value={monthA}
//                     onChange={(e) => setMonthA(Number(e.target.value))}
//                   >
//                     {MONTHS.map((m, i) => (
//                       <option key={`ma-${m}`} value={i}>
//                         {m}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={monthB}
//                     onChange={(e) => setMonthB(Number(e.target.value))}
//                   >
//                     {MONTHS.map((m, i) => (
//                       <option key={`mb-${m}`} value={i}>
//                         {m}
//                       </option>
//                     ))}
//                   </select>
//                 </>
//               )}
//             </div>

//             <Bar
//               data={barData}
//               options={{
//                 maintainAspectRatio: false,
//                 borderRadius: 100,
//                 responsive: true,
//                 plugins: {
//                   legend: { display: true },
//                   tooltip: {
//                     callbacks: {
//                       label: (ctx) =>
//                         `${ctx.dataset.label}: ${FormatCurrency(ctx.parsed.y)}`,
//                     },
//                   },
//                 },
//                 scales: {
//                   y: { ticks: { callback: (v) => FormatCurrency(v) } },
//                 },
//               }}
//             />
//           </div>
//         )}

//         {showPie && (
//           <div
//             className="charts-dashboard__chart"
//             style={{ maxWidth: "500px", maxHeight: "500px" }}
//           >
//             {/* Pas de select mois ici : le camembert suit exactement les filtres globaux */}
//             <Doughnut
//               data={pieData}
//               options={{
//                 responsive: true,
//                 plugins: {
//                   legend: { display: true },
//                   tooltip: {
//                     callbacks: {
//                       label: (ctx) =>
//                         `${ctx.label}: ${FormatCurrency(ctx.parsed)}`,
//                     },
//                   },
//                 },
//               }}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";

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
import { parseFRDate } from "./utils/date";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Props :
 * - transactions : liste issue d'App.jsx APRÈS application des filtres (Année/Mois/Thème/Paiement)
 * - filters : { year:null|number, month:null|0..11, theme?:string|null, payment?:string|null }
 */
export default function ChartsDashboard({ transactions, filters }) {
  const [showBar, setShowBar] = useState(true);
  const [showPie, setShowPie] = useState(true);

  // Sélecteurs "mois" pour la comparaison quand on est en mode mois
  const [monthA, setMonthA] = useState(0);
  const [monthB, setMonthB] = useState(1);

  // Infos filtres
  const themeSelected = Boolean(filters?.theme);
  const paymentSelected = Boolean(filters?.payment);
  const monthSelected = filters ? filters.month !== null : false;
  const yearSelected = filters ? filters.year !== null : false;

  // Règle demandée : le graphe comparaison passe en "année" TANT QUE le mois global n'est pas sélectionné
  const isYearMode = !monthSelected; // peu importe thème/paiement/année

  // Années présentes dans le dataset reçu
  const years = useMemo(() => {
    const s = new Set();
    for (const t of transactions) {
      const d = parseFRDate(t.date);
      if (!Number.isNaN(d)) s.add(d.getFullYear());
    }
    return Array.from(s).sort((a, b) => a - b);
  }, [transactions]);

  // Sélecteurs d'années (utilisés quand isYearMode === true)
  const [yearA, setYearA] = useState(null);
  const [yearB, setYearB] = useState(null);

  useEffect(() => {
    if (years.length === 0) {
      setYearA(null);
      setYearB(null);
      return;
    }
    if (!yearA || !years.includes(yearA)) setYearA(years[0]);
    if (!yearB || !years.includes(yearB))
      setYearB(years[Math.min(1, years.length - 1)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years]);

  // -------------------------
  // BAR (Comparaison)
  // -------------------------
  const barData = useMemo(() => {
    const keyOf = (t) =>
      themeSelected ? t.subTheme || "Inclassables" : t.theme || "Autres";

    if (isYearMode) {
      // Comparaison PAR ANNÉE (quel que soit thème/paiement/année globale si le mois n'est pas choisi)
      const totalsA = {};
      const totalsB = {};

      for (const t of transactions) {
        const d = parseFRDate(t.date);
        if (Number.isNaN(d)) continue;
        const y = d.getFullYear();
        const amount = Number(t.depense || 0);
        if (!amount) continue;

        const k = keyOf(t);
        if (y === yearA) totalsA[k] = (totalsA[k] || 0) + amount;
        if (y === yearB) totalsB[k] = (totalsB[k] || 0) + amount;
      }

      const labels = Array.from(
        new Set([...Object.keys(totalsA), ...Object.keys(totalsB)])
      ).sort((a, b) => a.localeCompare(b, "fr"));

      return {
        labels,
        datasets: [
          {
            label: yearA != null ? String(yearA) : "",
            data: labels.map((l) => totalsA[l] ?? 0),
            backgroundColor: "#4e79a7",
          },
          {
            label: yearB != null ? String(yearB) : "",
            data: labels.map((l) => totalsB[l] ?? 0),
            backgroundColor: "#e15759",
          },
        ],
      };
    }

    // Comparaison PAR MOIS (A vs B) quand un mois global est sélectionné
    const txA = filterByMonth(transactions, monthA);
    const txB = filterByMonth(transactions, monthB);

    const totalsA = {};
    const totalsB = {};

    for (const t of txA) {
      const amount = Number(t.depense || 0);
      if (!amount) continue;
      const k = keyOf(t);
      totalsA[k] = (totalsA[k] || 0) + amount;
    }
    for (const t of txB) {
      const amount = Number(t.depense || 0);
      if (!amount) continue;
      const k = keyOf(t);
      totalsB[k] = (totalsB[k] || 0) + amount;
    }

    const labels = Array.from(
      new Set([...Object.keys(totalsA), ...Object.keys(totalsB)])
    ).sort((a, b) => a.localeCompare(b, "fr"));

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
  }, [transactions, isYearMode, monthA, monthB, yearA, yearB, themeSelected]);

  // -------------------------
  // PIE (Répartition)
  // -------------------------
  // Suit EXACTEMENT la liste "transactions" fournie par App (donc année/mois/thème/paiement déjà pris en compte).
  const pieData = useMemo(() => {
    const keyOf = (t) =>
      themeSelected ? t.subTheme || "Inclassables" : t.theme || "Inclassables";

    const totals = {};
    for (const t of transactions) {
      const amount = Number(t.depense || 0);
      if (!amount) continue;
      const k = keyOf(t);
      totals[k] = (totals[k] || 0) + amount;
    }

    const labels = Object.keys(totals).sort((a, b) => a.localeCompare(b, "fr"));
    const data = labels.map((l) => totals[l]);

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
  }, [transactions, themeSelected]);

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
              {isYearMode ? (
                <>
                  <select
                    value={yearA ?? ""}
                    onChange={(e) => setYearA(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <option key={`ya-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <select
                    value={yearB ?? ""}
                    onChange={(e) => setYearB(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <option key={`yb-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <select
                    value={monthA}
                    onChange={(e) => setMonthA(Number(e.target.value))}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={`ma-${m}`} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={monthB}
                    onChange={(e) => setMonthB(Number(e.target.value))}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={`mb-${m}`} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                borderRadius: 100,
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.dataset.label}: ${FormatCurrency(ctx.parsed.y)}`,
                    },
                  },
                },
                scales: {
                  y: { ticks: { callback: (v) => FormatCurrency(v) } },
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
            <Doughnut
              data={pieData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.label}: ${FormatCurrency(ctx.parsed)}`,
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
