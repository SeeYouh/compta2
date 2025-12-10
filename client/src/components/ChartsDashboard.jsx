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

import { APP_LABELS, CHART_COLORS, MONTHS } from "./utils";
import { filterByMonth } from "./utils/transactionsDerivers";
import FormatCurrency from "./utils/FormatCurrency";
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
  const monthSelected = filters ? filters.month !== null : false;
  const yearSelected = filters ? filters.year !== null : false;

  // Règles de comparaison :
  // - Si un mois est sélectionné : comparer des années pour ce mois
  // - Si une année est sélectionnée (sans mois) : comparer des mois de cette année
  // - Sinon : comparer des années globales
  const compareMonths = yearSelected && !monthSelected; // Si année sélectionnée sans mois, on compare des mois

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
    // CAS 1 : Comparaison de MOIS (quand une année spécifique est sélectionnée)
    if (compareMonths) {
      const selectedYear = filters.year;
      const txA = filterByMonth(
        transactions.filter((t) => {
          const d = parseFRDate(t.date);
          return !Number.isNaN(d) && d.getFullYear() === selectedYear;
        }),
        monthA
      );
      const txB = filterByMonth(
        transactions.filter((t) => {
          const d = parseFRDate(t.date);
          return !Number.isNaN(d) && d.getFullYear() === selectedYear;
        }),
        monthB
      );

      if (themeSelected) {
        // Mode détaillé : barres = sous-thèmes, segments = désignations
        const dataByMonthSubThemeDesignation = {};

        [
          { txs: txA, key: "A" },
          { txs: txB, key: "B" },
        ].forEach(({ txs, key }) => {
          dataByMonthSubThemeDesignation[key] = {};

          for (const t of txs) {
            if (t.disabled === true) continue;

            const subTheme = t.subTheme || APP_LABELS.defaultCategory;
            const designation = t.designation || "Sans désignation";
            const recette = Number(t.recette || 0);
            const depense = Number(t.depense || 0);

            if (!dataByMonthSubThemeDesignation[key][subTheme]) {
              dataByMonthSubThemeDesignation[key][subTheme] = {
                recettes: {},
                depenses: {},
              };
            }

            if (recette) {
              dataByMonthSubThemeDesignation[key][subTheme].recettes[
                designation
              ] =
                (dataByMonthSubThemeDesignation[key][subTheme].recettes[
                  designation
                ] || 0) + recette;
            }
            if (depense) {
              dataByMonthSubThemeDesignation[key][subTheme].depenses[
                designation
              ] =
                (dataByMonthSubThemeDesignation[key][subTheme].depenses[
                  designation
                ] || 0) + depense;
            }
          }
        });

        // Collecter tous les sous-thèmes et désignations
        const allSubThemes = new Set();
        const allDesignations = new Set();

        ["A", "B"].forEach((monthKey) => {
          Object.keys(dataByMonthSubThemeDesignation[monthKey]).forEach(
            (st) => {
              allSubThemes.add(st);
              Object.keys(
                dataByMonthSubThemeDesignation[monthKey][st].recettes
              ).forEach((d) => allDesignations.add(d));
              Object.keys(
                dataByMonthSubThemeDesignation[monthKey][st].depenses
              ).forEach((d) => allDesignations.add(d));
            }
          );
        });

        const labels = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr")
        );
        const designations = Array.from(allDesignations).sort((a, b) =>
          a.localeCompare(b, "fr")
        );

        const datasets = [];

        // D'abord toutes les recettes pour Month A
        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${MONTHS[monthA]} - ${designation} (R)`,
            data: labels.map((st) => {
              const monthData = dataByMonthSubThemeDesignation["A"];
              return monthData?.[st]?.recettes?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackA",
          });
        });

        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${MONTHS[monthA]} - ${designation} (D)`,
            data: labels.map((st) => {
              const monthData = dataByMonthSubThemeDesignation["A"];
              return monthData?.[st]?.depenses?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackA",
          });
        });

        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${MONTHS[monthB]} - ${designation} (R)`,
            data: labels.map((st) => {
              const monthData = dataByMonthSubThemeDesignation["B"];
              return monthData?.[st]?.recettes?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackB",
          });
        });

        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${MONTHS[monthB]} - ${designation} (D)`,
            data: labels.map((st) => {
              const monthData = dataByMonthSubThemeDesignation["B"];
              return monthData?.[st]?.depenses?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackB",
          });
        });

        return { labels, datasets };
      } else {
        // Mode sans filtre thème : barres = thèmes, segments = sous-thèmes
        const dataByMonthThemeSubTheme = {};

        [
          { txs: txA, key: "A" },
          { txs: txB, key: "B" },
        ].forEach(({ txs, key }) => {
          dataByMonthThemeSubTheme[key] = {};

          for (const t of txs) {
            if (t.disabled === true) continue;

            const theme = t.theme || APP_LABELS.defaultTheme;
            const subTheme = t.subTheme || APP_LABELS.defaultCategory;
            const recette = Number(t.recette || 0);
            const depense = Number(t.depense || 0);

            if (!dataByMonthThemeSubTheme[key][theme]) {
              dataByMonthThemeSubTheme[key][theme] = {
                recettes: {},
                depenses: {},
              };
            }

            if (recette) {
              dataByMonthThemeSubTheme[key][theme].recettes[subTheme] =
                (dataByMonthThemeSubTheme[key][theme].recettes[subTheme] || 0) +
                recette;
            }
            if (depense) {
              dataByMonthThemeSubTheme[key][theme].depenses[subTheme] =
                (dataByMonthThemeSubTheme[key][theme].depenses[subTheme] || 0) +
                depense;
            }
          }
        });

        // Collecter tous les thèmes et sous-thèmes
        const allThemes = new Set();
        const allSubThemes = new Set();

        ["A", "B"].forEach((monthKey) => {
          Object.keys(dataByMonthThemeSubTheme[monthKey]).forEach((th) => {
            allThemes.add(th);
            Object.keys(
              dataByMonthThemeSubTheme[monthKey][th].recettes
            ).forEach((st) => allSubThemes.add(st));
            Object.keys(
              dataByMonthThemeSubTheme[monthKey][th].depenses
            ).forEach((st) => allSubThemes.add(st));
          });
        });

        const labels = Array.from(allThemes).sort((a, b) =>
          a.localeCompare(b, "fr")
        );
        const subThemes = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr")
        );

        const datasets = [];

        // D'abord toutes les recettes pour Month A
        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${MONTHS[monthA]} - ${subTheme} (R)`,
            data: labels.map((th) => {
              const monthData = dataByMonthThemeSubTheme["A"];
              return monthData?.[th]?.recettes?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackA",
          });
        });

        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${MONTHS[monthA]} - ${subTheme} (D)`,
            data: labels.map((th) => {
              const monthData = dataByMonthThemeSubTheme["A"];
              return monthData?.[th]?.depenses?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackA",
          });
        });

        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${MONTHS[monthB]} - ${subTheme} (R)`,
            data: labels.map((th) => {
              const monthData = dataByMonthThemeSubTheme["B"];
              return monthData?.[th]?.recettes?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackB",
          });
        });

        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${MONTHS[monthB]} - ${subTheme} (D)`,
            data: labels.map((th) => {
              const monthData = dataByMonthThemeSubTheme["B"];
              return monthData?.[th]?.depenses?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackB",
          });
        });

        return { labels, datasets };
      }
    } else {
      // CAS 2 & 3 : Comparaison d'ANNÉES (soit pour un mois spécifique, soit globales)
      if (themeSelected) {
        // Mode détaillé : barres = sous-thèmes, segments = désignations
        const dataByYearSubThemeDesignation = {};

        for (const t of transactions) {
          if (t.disabled === true) continue;
          const d = parseFRDate(t.date);
          if (Number.isNaN(d)) continue;

          // Si un mois est sélectionné, filtrer par ce mois
          if (monthSelected && d.getMonth() !== filters.month) continue;

          const y = d.getFullYear();
          if (y !== yearA && y !== yearB) continue;

          const subTheme = t.subTheme || APP_LABELS.defaultCategory;
          const designation = t.designation || "Sans désignation";
          const recette = Number(t.recette || 0);
          const depense = Number(t.depense || 0);

          const yearKey = y === yearA ? "A" : "B";
          if (!dataByYearSubThemeDesignation[yearKey]) {
            dataByYearSubThemeDesignation[yearKey] = {};
          }
          if (!dataByYearSubThemeDesignation[yearKey][subTheme]) {
            dataByYearSubThemeDesignation[yearKey][subTheme] = {
              recettes: {},
              depenses: {},
            };
          }

          if (recette) {
            dataByYearSubThemeDesignation[yearKey][subTheme].recettes[
              designation
            ] =
              (dataByYearSubThemeDesignation[yearKey][subTheme].recettes[
                designation
              ] || 0) + recette;
          }
          if (depense) {
            dataByYearSubThemeDesignation[yearKey][subTheme].depenses[
              designation
            ] =
              (dataByYearSubThemeDesignation[yearKey][subTheme].depenses[
                designation
              ] || 0) + depense;
          }
        }

        // Collecter tous les sous-thèmes et désignations
        const allSubThemes = new Set();
        const allDesignations = new Set();

        ["A", "B"].forEach((yearKey) => {
          if (dataByYearSubThemeDesignation[yearKey]) {
            Object.keys(dataByYearSubThemeDesignation[yearKey]).forEach(
              (st) => {
                allSubThemes.add(st);
                Object.keys(
                  dataByYearSubThemeDesignation[yearKey][st].recettes
                ).forEach((d) => allDesignations.add(d));
                Object.keys(
                  dataByYearSubThemeDesignation[yearKey][st].depenses
                ).forEach((d) => allDesignations.add(d));
              }
            );
          }
        });

        const labels = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr")
        );
        const designations = Array.from(allDesignations).sort((a, b) =>
          a.localeCompare(b, "fr")
        );

        // Créer un dataset par désignation - Recettes d'abord (en bas), puis dépenses (au-dessus)
        const datasets = [];

        // D'abord toutes les recettes pour Year A
        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${yearA} - ${designation} (R)`,
            data: labels.map((st) => {
              const yearData = dataByYearSubThemeDesignation["A"];
              return yearData?.[st]?.recettes?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackA",
          });
        });

        // Puis toutes les dépenses pour Year A
        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${yearA} - ${designation} (D)`,
            data: labels.map((st) => {
              const yearData = dataByYearSubThemeDesignation["A"];
              return yearData?.[st]?.depenses?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackA",
          });
        });

        // Toutes les recettes pour Year B
        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${yearB} - ${designation} (R)`,
            data: labels.map((st) => {
              const yearData = dataByYearSubThemeDesignation["B"];
              return yearData?.[st]?.recettes?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackB",
          });
        });

        // Toutes les dépenses pour Year B
        designations.forEach((designation, idx) => {
          datasets.push({
            label: `${yearB} - ${designation} (D)`,
            data: labels.map((st) => {
              const yearData = dataByYearSubThemeDesignation["B"];
              return yearData?.[st]?.depenses?.[designation] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackB",
          });
        });

        return { labels, datasets };
      } else {
        // Mode sans filtre thème : barres = thèmes, segments = sous-thèmes
        const dataByYearThemeSubTheme = {};

        for (const t of transactions) {
          if (t.disabled === true) continue;
          const d = parseFRDate(t.date);
          if (Number.isNaN(d)) continue;

          // Si un mois est sélectionné, filtrer par ce mois
          if (monthSelected && d.getMonth() !== filters.month) continue;

          const y = d.getFullYear();
          if (y !== yearA && y !== yearB) continue;

          const theme = t.theme || APP_LABELS.defaultTheme;
          const subTheme = t.subTheme || APP_LABELS.defaultCategory;
          const recette = Number(t.recette || 0);
          const depense = Number(t.depense || 0);

          const yearKey = y === yearA ? "A" : "B";
          if (!dataByYearThemeSubTheme[yearKey]) {
            dataByYearThemeSubTheme[yearKey] = {};
          }
          if (!dataByYearThemeSubTheme[yearKey][theme]) {
            dataByYearThemeSubTheme[yearKey][theme] = {
              recettes: {},
              depenses: {},
            };
          }

          if (recette) {
            dataByYearThemeSubTheme[yearKey][theme].recettes[subTheme] =
              (dataByYearThemeSubTheme[yearKey][theme].recettes[subTheme] ||
                0) + recette;
          }
          if (depense) {
            dataByYearThemeSubTheme[yearKey][theme].depenses[subTheme] =
              (dataByYearThemeSubTheme[yearKey][theme].depenses[subTheme] ||
                0) + depense;
          }
        }

        // Collecter tous les thèmes et sous-thèmes
        const allThemes = new Set();
        const allSubThemes = new Set();

        ["A", "B"].forEach((yearKey) => {
          if (dataByYearThemeSubTheme[yearKey]) {
            Object.keys(dataByYearThemeSubTheme[yearKey]).forEach((th) => {
              allThemes.add(th);
              Object.keys(
                dataByYearThemeSubTheme[yearKey][th].recettes
              ).forEach((st) => allSubThemes.add(st));
              Object.keys(
                dataByYearThemeSubTheme[yearKey][th].depenses
              ).forEach((st) => allSubThemes.add(st));
            });
          }
        });

        const labels = Array.from(allThemes).sort((a, b) =>
          a.localeCompare(b, "fr")
        );
        const subThemes = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr")
        );

        // Créer un dataset par sous-thème - Recettes d'abord (en bas), puis dépenses (au-dessus)
        const datasets = [];

        // D'abord toutes les recettes pour Year A
        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${yearA} - ${subTheme} (R)`,
            data: labels.map((th) => {
              const yearData = dataByYearThemeSubTheme["A"];
              return yearData?.[th]?.recettes?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackA",
          });
        });

        // Puis toutes les dépenses pour Year A
        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${yearA} - ${subTheme} (D)`,
            data: labels.map((th) => {
              const yearData = dataByYearThemeSubTheme["A"];
              return yearData?.[th]?.depenses?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackA",
          });
        });

        // Toutes les recettes pour Year B
        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${yearB} - ${subTheme} (R)`,
            data: labels.map((th) => {
              const yearData = dataByYearThemeSubTheme["B"];
              return yearData?.[th]?.recettes?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.recettes.palette[
                idx % CHART_COLORS.recettes.palette.length
              ],
            stack: "stackB",
          });
        });

        // Toutes les dépenses pour Year B
        subThemes.forEach((subTheme, idx) => {
          datasets.push({
            label: `${yearB} - ${subTheme} (D)`,
            data: labels.map((th) => {
              const yearData = dataByYearThemeSubTheme["B"];
              return yearData?.[th]?.depenses?.[subTheme] || 0;
            }),
            backgroundColor:
              CHART_COLORS.depenses.palette[
                idx % CHART_COLORS.depenses.palette.length
              ],
            stack: "stackB",
          });
        });

        return { labels, datasets };
      }
    }
  }, [
    transactions,
    compareMonths,
    monthA,
    monthB,
    yearA,
    yearB,
    themeSelected,
    filters,
    monthSelected,
  ]);

  // -------------------------
  // PIE (Répartition)
  // -------------------------
  // Suit EXACTEMENT la liste "transactions" fournie par App (donc année/mois/thème/paiement déjà pris en compte).
  const pieData = useMemo(() => {
    const keyOf = (t) =>
      themeSelected
        ? t.subTheme || APP_LABELS.defaultCategory
        : t.theme || APP_LABELS.defaultCategory;

    const recettes = {};
    const depenses = {};

    for (const t of transactions) {
      if (t.disabled === true) continue;

      const recette = Number(t.recette || 0);
      const depense = Number(t.depense || 0);
      const k = keyOf(t);

      if (recette) recettes[k] = (recettes[k] || 0) + recette;
      if (depense) depenses[k] = (depenses[k] || 0) + depense;
    }

    // Créer des labels séparés avec préfixe
    const recetteLabels = Object.keys(recettes).map(
      (k) => `${APP_LABELS.chartLabelRecettes} ${k}`
    );
    const depenseLabels = Object.keys(depenses).map(
      (k) => `${APP_LABELS.chartLabelDepenses} ${k}`
    );
    const labels = [...recetteLabels, ...depenseLabels];

    const recetteData = Object.values(recettes);
    const depenseData = Object.values(depenses);
    const data = [...recetteData, ...depenseData];

    // Couleurs vertes pour recettes, rouges pour dépenses
    const recetteColors = recetteLabels.map(
      (_, i) =>
        CHART_COLORS.recettes.palette[i % CHART_COLORS.recettes.palette.length]
    );
    const depenseColors = depenseLabels.map(
      (_, i) =>
        CHART_COLORS.depenses.palette[i % CHART_COLORS.depenses.palette.length]
    );
    const backgroundColor = [...recetteColors, ...depenseColors];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
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
          {APP_LABELS.chartComparison}
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPie}
            onChange={() => setShowPie((v) => !v)}
          />
          {APP_LABELS.chartRepartition}
        </label>
      </div>

      <div className="charts-dashboard_group">
        {showBar && (
          <div
            className="charts-dashboard__chart"
            style={{ maxWidth: "700px", maxHeight: "500px" }}
          >
            <div className="charts-dashboard__filters">
              {compareMonths ? (
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
              ) : (
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
              )}
            </div>

            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                borderRadius: 100,
                responsive: true,
                plugins: {
                  legend: { display: false },
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
                  legend: { display: false },
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
