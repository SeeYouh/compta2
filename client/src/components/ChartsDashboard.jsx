import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import {
  Bar,
  Doughnut,
} from 'react-chartjs-2';

import {
  APP_LABELS,
  CHART_COLORS,
  MONTHS,
} from './utils';
import { filterByMonth } from './utils/transactionsDerivers';
import FormatCurrency from './utils/FormatCurrency';
import { parseFRDate } from './utils/date';

const TOOLTIP_LABELS_PLUGIN = {
  id: "tooltipInlineLabels",
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-text")
        .trim() || "#333";

    ctx.save();
    meta.data.forEach((arc, i) => {
      const arcSize = arc.endAngle - arc.startAngle;
      if (arcSize < 0.12) return;

      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      const labelRadius = arc.outerRadius + 28;
      const lx = arc.x + Math.cos(midAngle) * labelRadius;
      const ly = arc.y + Math.sin(midAngle) * labelRadius;

      const label = (data.labels[i] || "").toString();
      const truncated =
        label.length > 15 ? label.substring(0, 14) + "…" : label;
      const value = data.datasets[0].data[i];
      const color = data.datasets[0].backgroundColor[i];

      ctx.textAlign = Math.cos(midAngle) >= 0 ? "left" : "right";
      ctx.textBaseline = "middle";

      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(truncated, lx, ly - 9);

      ctx.font = "12px system-ui, sans-serif";
      ctx.fillStyle = textColor;
      ctx.fillText(FormatCurrency(value), lx, ly + 9);
    });
    ctx.restore();
  },
};

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
);

/**
 * Props :
 * - transactions : liste issue d'App.jsx APRÈS application des filtres (Année/Mois/Thème/Paiement)
 * - filters : { year:null|number, month:null|0..11, theme?:string|null, payment?:string|null }
 */
export default function ChartsDashboard({ transactions, filters }) {
  const [showBar, setShowBar] = useState(true);
  const [showPie, setShowPie] = useState(true);
  const [tooltipState, setTooltipState] = useState(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

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
        monthA,
      );
      const txB = filterByMonth(
        transactions.filter((t) => {
          const d = parseFRDate(t.date);
          return !Number.isNaN(d) && d.getFullYear() === selectedYear;
        }),
        monthB,
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
                dataByMonthSubThemeDesignation[monthKey][st].recettes,
              ).forEach((d) => allDesignations.add(d));
              Object.keys(
                dataByMonthSubThemeDesignation[monthKey][st].depenses,
              ).forEach((d) => allDesignations.add(d));
            },
          );
        });

        const labels = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr"),
        );
        const designations = Array.from(allDesignations).sort((a, b) =>
          a.localeCompare(b, "fr"),
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
              dataByMonthThemeSubTheme[monthKey][th].recettes,
            ).forEach((st) => allSubThemes.add(st));
            Object.keys(
              dataByMonthThemeSubTheme[monthKey][th].depenses,
            ).forEach((st) => allSubThemes.add(st));
          });
        });

        const labels = Array.from(allThemes).sort((a, b) =>
          a.localeCompare(b, "fr"),
        );
        const subThemes = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr"),
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
                  dataByYearSubThemeDesignation[yearKey][st].recettes,
                ).forEach((d) => allDesignations.add(d));
                Object.keys(
                  dataByYearSubThemeDesignation[yearKey][st].depenses,
                ).forEach((d) => allDesignations.add(d));
              },
            );
          }
        });

        const labels = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr"),
        );
        const designations = Array.from(allDesignations).sort((a, b) =>
          a.localeCompare(b, "fr"),
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
                dataByYearThemeSubTheme[yearKey][th].recettes,
              ).forEach((st) => allSubThemes.add(st));
              Object.keys(
                dataByYearThemeSubTheme[yearKey][th].depenses,
              ).forEach((st) => allSubThemes.add(st));
            });
          }
        });

        const labels = Array.from(allThemes).sort((a, b) =>
          a.localeCompare(b, "fr"),
        );
        const subThemes = Array.from(allSubThemes).sort((a, b) =>
          a.localeCompare(b, "fr"),
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
      (k) => `${APP_LABELS.chartLabelRecettes} ${k}`,
    );
    const depenseLabels = Object.keys(depenses).map(
      (k) => `${APP_LABELS.chartLabelDepenses} ${k}`,
    );
    const labels = [...recetteLabels, ...depenseLabels];

    const recetteData = Object.values(recettes);
    const depenseData = Object.values(depenses);
    const data = [...recetteData, ...depenseData];

    // Couleurs vertes pour recettes, rouges pour dépenses
    const recetteColors = recetteLabels.map(
      (_, i) =>
        CHART_COLORS.recettes.palette[i % CHART_COLORS.recettes.palette.length],
    );
    const depenseColors = depenseLabels.map(
      (_, i) =>
        CHART_COLORS.depenses.palette[i % CHART_COLORS.depenses.palette.length],
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

  const handleBarTooltip = useCallback(
    ({ tooltip }) => {
      if (tooltip.opacity === 0) {
        setTooltipState(null);
        return;
      }

      const categoryLabel = tooltip.dataPoints[0].label;
      const stack = tooltip.dataPoints[0].dataset.stack; // "stackA" ou "stackB"
      const isStackA = stack === "stackA";

      // Filtre temporel selon le stack survolé
      let periodFilter;
      if (compareMonths) {
        const targetMonth = isStackA ? monthA : monthB;
        periodFilter = (t) => {
          const d = parseFRDate(t.date);
          return (
            !Number.isNaN(d) &&
            d.getFullYear() === filters.year &&
            d.getMonth() === targetMonth
          );
        };
      } else {
        const targetYear = isStackA ? yearA : yearB;
        periodFilter = (t) => {
          const d = parseFRDate(t.date);
          if (Number.isNaN(d)) return false;
          if (d.getFullYear() !== targetYear) return false;
          if (monthSelected && d.getMonth() !== filters.month) return false;
          return true;
        };
      }

      const catFilter = themeSelected
        ? (t) => (t.subTheme || APP_LABELS.defaultCategory) === categoryLabel
        : (t) => (t.theme || APP_LABELS.defaultTheme) === categoryLabel;

      const recetteGroups = {};
      const depenseGroups = {};
      for (const t of transactions) {
        if (t.disabled) continue;
        if (!catFilter(t)) continue;
        if (!periodFilter(t)) continue;
        const des = t.designation || "Sans désignation";
        const r = Number(t.recette || 0);
        const d = Number(t.depense || 0);
        if (r > 0) recetteGroups[des] = (recetteGroups[des] || 0) + r;
        if (d > 0) depenseGroups[des] = (depenseGroups[des] || 0) + d;
      }

      const recetteSlices = Object.entries(recetteGroups).map(
        ([label, value], i) => ({
          label,
          value,
          color:
            CHART_COLORS.recettes.palette[
              i % CHART_COLORS.recettes.palette.length
            ],
        }),
      );
      const depenseSlices = Object.entries(depenseGroups).map(
        ([label, value], i) => ({
          label,
          value,
          color:
            CHART_COLORS.depenses.palette[
              i % CHART_COLORS.depenses.palette.length
            ],
        }),
      );
      const slices = [...recetteSlices, ...depenseSlices];

      if (slices.length === 0) {
        setTooltipState(null);
        return;
      }

      const periodLabel = compareMonths
        ? isStackA
          ? MONTHS[monthA]
          : MONTHS[monthB]
        : String(isStackA ? yearA : yearB);
      const tooltipTitle = `${categoryLabel} — ${periodLabel}`;

      setTooltipState((prev) => {
        const { x, y } = mousePosRef.current;
        if (prev?.title === tooltipTitle) return { ...prev, x, y };
        return { x, y, title: tooltipTitle, slices };
      });
    },
    [
      transactions,
      themeSelected,
      compareMonths,
      monthA,
      monthB,
      yearA,
      yearB,
      filters,
      monthSelected,
    ],
  );

  const handlePieTooltip = useCallback(
    ({ tooltip }) => {
      if (tooltip.opacity === 0) {
        setTooltipState(null);
        return;
      }

      const sliceLabel = tooltip.dataPoints[0].label;
      const isRecette = sliceLabel.startsWith(APP_LABELS.chartLabelRecettes);
      const prefix = `${
        isRecette
          ? APP_LABELS.chartLabelRecettes
          : APP_LABELS.chartLabelDepenses
      } `;
      const categoryLabel = sliceLabel.slice(prefix.length);

      const catFilter = themeSelected
        ? (t) => (t.subTheme || APP_LABELS.defaultCategory) === categoryLabel
        : (t) => (t.theme || APP_LABELS.defaultTheme) === categoryLabel;

      const groups = {};
      for (const t of transactions) {
        if (t.disabled) continue;
        if (!catFilter(t)) continue;
        const amt = isRecette ? Number(t.recette || 0) : Number(t.depense || 0);
        if (amt <= 0) continue;
        const des = t.designation || "Sans désignation";
        groups[des] = (groups[des] || 0) + amt;
      }

      const palette = isRecette
        ? CHART_COLORS.recettes.palette
        : CHART_COLORS.depenses.palette;
      const slices = Object.entries(groups).map(([label, value], i) => ({
        label,
        value,
        color: palette[i % palette.length],
      }));

      if (slices.length === 0) {
        setTooltipState(null);
        return;
      }

      setTooltipState((prev) => {
        const { x, y } = mousePosRef.current;
        if (prev?.title === categoryLabel) return { ...prev, x, y };
        return { x, y, title: categoryLabel, slices };
      });
    },
    [transactions, themeSelected],
  );

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
                    enabled: false,
                    external: handleBarTooltip,
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
                    enabled: false,
                    external: handlePieTooltip,
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {tooltipState && (
        <div
          className="chart-tooltip-pie"
          style={(() => {
            const W = 740;
            const H = 530;
            const gap = 16;
            const { x, y } = tooltipState;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let left = x + gap;
            if (left + W > vw - 10) left = x - gap - W;
            left = Math.max(10, left);
            let top = y - H / 2;
            top = Math.max(10, Math.min(top, vh - H - 10));
            return { position: "fixed", left, top };
          })()}
        >
          <p className="chart-tooltip-pie__title">{tooltipState.title}</p>
          <div className="chart-tooltip-pie__donut">
            <Doughnut
              data={{
                labels: tooltipState.slices.map((s) => s.label),
                datasets: [
                  {
                    data: tooltipState.slices.map((s) => s.value),
                    backgroundColor: tooltipState.slices.map((s) => s.color),
                    borderWidth: 1,
                  },
                ],
              }}
              plugins={[TOOLTIP_LABELS_PLUGIN]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                layout: {
                  padding: { top: 40, bottom: 70, left: 160, right: 160 },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: false },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
