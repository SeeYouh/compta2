import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import AccountTabs from "../components/AccountTabs";
import { APP_LABELS, TABLE_HEADERS } from "../components/utils";
import AppShell from "../components/AppShell";
import BalanceCalculator from "../components/BalanceCalculator";
import ChartsDashboard from "../components/ChartsDashboard";
import ConfirmationModal from "../components/ConfirmationModal";
import DrawerThemeManager from "../components/DrawerThemeManager";
import { enrichTransactions } from "../components/utils/themeResolver";
import {
  filterByMonth,
  sortByFRDate,
} from "../components/utils/transactionsDerivers";
import { filterByPeriod } from "../components/utils/periodFilter";
import { getProjectionOccurrences } from "../components/utils/projectionsApi";
import IconGraphActivated from "../assets/IconGraphActivated";
import IcongraphDisable from "../assets/IconGraph";
import { migrateTransactions } from "../components/utils/themeMigration";
import MonthTabs from "../components/MonthTabs";
import { parseFRDate } from "../components/utils/date";
import PaymentFilterMenu from "../components/filters/PaymentFilterMenu";
// Filtres
import PeriodFilter from "../components/filters/PeriodFilter";
import { saveThemes } from "../components/utils/themesApi";
import ScrollButton from "../components/ScrollButton";
import SynapseUserMenu from "../components/SynapseUserMenu";
import ThemeFilterMenu from "../components/filters/ThemeFilterMenu";
import ThemeToggle from "../components/ThemeToggle";
import TransactionForm from "../components/TransactionForm";
import TransactionsTable from "../components/TransactionsTable";
import { useAccounts } from "../contexts/useAccounts";
import { useLastUpdate } from "../components/hooks/useLastUpdate";
import { useSettings } from "../components/hooks/useSettings";
import { useThemes } from "../contexts/useThemes";
import { useTransactionForm } from "../components/hooks/useTransactionForm";
import { useTransactions } from "../components/hooks/useTransactions";
import YearTabs from "../components/filters/YearTabs";

const App = () => {
  const navigate = useNavigate();
  const {
    transactions: rawTransactions,
    add,
    remove,
    update,
  } = useTransactions();
  const { themes, refresh: refreshThemes } = useThemes();
  const { activeAccountId, activeAccount } = useAccounts();

  // Calcul des permissions de l'utilisateur courant sur le compte actif
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const accountPermissions = (() => {
    if (!activeAccount) return null;
    if (activeAccount.userId === currentUser.id) return null; // propriétaire : pas de restriction
    const shared = activeAccount.sharedWith?.find(
      (s) => s.userId === currentUser.id,
    );
    return shared?.permissions ?? null;
  })();
  const { formData, errors, handleChange, validate, reset, toPayload } =
    useTransactionForm();
  const {
    settings,
    loading: settingsLoading,
    updatePeriodFilter,
  } = useSettings();

  // Migrer puis enrichir les transactions
  const allTransactions = useMemo(() => {
    if (!themes) return rawTransactions;
    // 1. Migrer les anciennes transactions (noms -> IDs)
    const migrated = migrateTransactions(rawTransactions, themes);
    // 2. Enrichir avec les noms pour l'affichage
    return enrichTransactions(migrated, themes);
  }, [rawTransactions, themes]);

  // Filtrer par compte actif
  const transactions = useMemo(() => {
    if (!activeAccountId) return allTransactions;
    return allTransactions.filter((t) => t.accountId === activeAccountId);
  }, [allTransactions, activeAccountId]);

  // Hook pour le temps écoulé depuis la dernière modification
  const lastUpdateText = useLastUpdate(transactions);

  // État des filtres
  const [selectedYear, setSelectedYear] = useState(null); // null = "Tous"
  const [selectedMonth, setSelectedMonth] = useState(null); // 0..11 ou null
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [showCharts, setShowCharts] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);

  // Projections budgétaires
  const [showProjections, setShowProjections] = useState(false);
  const [projectionDisplayMonths, setProjectionDisplayMonths] = useState(6);
  const [rawProjectionOccurrences, setRawProjectionOccurrences] = useState([]);

  useEffect(() => {
    if (!showProjections || !activeAccountId) {
      setRawProjectionOccurrences([]);
      return;
    }
    getProjectionOccurrences(activeAccountId, projectionDisplayMonths)
      .then(setRawProjectionOccurrences)
      .catch(() => setRawProjectionOccurrences([]));
  }, [showProjections, activeAccountId, projectionDisplayMonths]);

  // État du modal de confirmation
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    transactionId: null,
    transactionData: null,
  });

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const newErrors = validate();
      if (Object.keys(newErrors).length) return;
      // Ajouter accountId à la transaction
      const payload = { ...toPayload(), accountId: activeAccountId };
      await add(payload);
      reset();
    },
    [add, toPayload, reset, validate, activeAccountId],
  );

  const onDelete = useCallback(
    async (id) => {
      // Trouver la transaction pour afficher ses détails dans le modal
      const transaction = transactions.find((t) => t.id === id);
      setConfirmModal({
        isOpen: true,
        transactionId: id,
        transactionData: transaction,
      });
    },
    [transactions],
  );

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = useCallback(async () => {
    if (confirmModal.transactionId) {
      await remove(confirmModal.transactionId);
      setConfirmModal({
        isOpen: false,
        transactionId: null,
        transactionData: null,
      });
    }
  }, [remove, confirmModal.transactionId]);

  // Fonction pour annuler la suppression
  const handleCancelDelete = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      transactionId: null,
      transactionData: null,
    });
  }, []);

  // Fonction pour sauvegarder les thèmes
  const handleSaveThemes = useCallback(
    async (updatedThemes) => {
      await saveThemes(updatedThemes);
      // Rafraîchir les thèmes après sauvegarde
      refreshThemes();
    },
    [refreshThemes],
  );
  const onUpdate = useCallback(
    async (id, patch) => {
      await update(id, patch);
    },
    [update],
  );

  // Années dynamiques
  const years = useMemo(() => {
    const s = new Set();
    for (const t of transactions) {
      const d = parseFRDate(t.date);
      if (!Number.isNaN(d)) s.add(d.getFullYear());
    }
    return Array.from(s).sort((a, b) => a - b);
  }, [transactions]);

  useEffect(() => {
    if (selectedYear !== null && !years.includes(selectedYear))
      setSelectedYear(null);
  }, [years, selectedYear]);

  // Tri + solde (inchangé)
  const enrichedProjectionOccurrences = useMemo(() => {
    if (!themes || rawProjectionOccurrences.length === 0) return [];
    return enrichTransactions(
      rawProjectionOccurrences.map((o) => ({ ...o, isProjection: true })),
      themes,
    );
  }, [rawProjectionOccurrences, themes]);

  const transactionsSorted = useMemo(
    () => sortByFRDate([...transactions, ...enrichedProjectionOccurrences]),
    [transactions, enrichedProjectionOccurrences],
  );
  const transactionsWithBalance = useMemo(
    () => BalanceCalculator({ transactions: transactionsSorted }),
    [transactionsSorted],
  );

  // Filtre permanent de période (appliqué en premier)
  const filteredByPeriod = useMemo(() => {
    if (settingsLoading || !settings) return transactionsWithBalance;
    return filterByPeriod(transactionsWithBalance, settings.periodFilter);
  }, [transactionsWithBalance, settings, settingsLoading]);

  // Filtrage: Année → Mois → Thème → Paiement
  const filteredByYear = useMemo(() => {
    if (selectedYear === null) return filteredByPeriod;
    return filteredByPeriod.filter((t) => {
      const d = parseFRDate(t.date);
      return !Number.isNaN(d) && d.getFullYear() === selectedYear;
    });
  }, [filteredByPeriod, selectedYear]);

  const filteredByMonth = useMemo(() => {
    if (selectedMonth === null) return filteredByYear;
    return filterByMonth(filteredByYear, selectedMonth);
  }, [filteredByYear, selectedMonth]);

  const filteredByTheme = useMemo(() => {
    if (!selectedTheme) return filteredByMonth;
    return filteredByMonth.filter((t) => t.theme === selectedTheme);
  }, [filteredByMonth, selectedTheme]);

  const filteredTransactions = useMemo(() => {
    if (!selectedPayment) return filteredByTheme;
    return filteredByTheme.filter((t) => t.payment === selectedPayment);
  }, [filteredByTheme, selectedPayment]);

  const resetFilters = useCallback(() => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedTheme(null);
    setSelectedPayment(null);
  }, []);

  return (
    <AppShell
      headerRight={
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ThemeToggle />
          <SynapseUserMenu />
          <button
            onClick={() => navigate("/")}
            aria-label="Retour aux applications"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(220,53,69,0.12)",
              color: "#dc3545",
              cursor: "pointer",
              fontSize: "1.25rem",
              lineHeight: 1,
              flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(220,53,69,0.25)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(220,53,69,0.12)")
            }
          >
            ✕
          </button>
        </div>
      }
      accountTabs={<AccountTabs />}
      lastUpdateText={lastUpdateText}
    >
      <div className="barSticky">
        <YearTabs
          years={years}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        />

        <div className="navBar">
          <PeriodFilter
            value={settings?.periodFilter}
            onChange={updatePeriodFilter}
          />

          <MonthTabs
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          <ThemeFilterMenu
            transactions={transactions}
            value={selectedTheme}
            onChange={setSelectedTheme}
            label={APP_LABELS.filterTheme}
          />

          <PaymentFilterMenu
            transactions={transactions}
            value={selectedPayment}
            onChange={setSelectedPayment}
            label={APP_LABELS.filterPayment}
          />

          <button
            type="button"
            className="reset-filters"
            onClick={resetFilters}
          >
            {APP_LABELS.filterReset}
          </button>

          <button
            type="button"
            className={`toggle-projections${showProjections ? " toggle-projections--active" : ""}`}
            onClick={() => setShowProjections((v) => !v)}
            title="Afficher / masquer les projections budgétaires"
          >
            📅 Projections
          </button>

          {showProjections && (
            <select
              className="projections-display-months"
              value={projectionDisplayMonths}
              onChange={(e) =>
                setProjectionDisplayMonths(Number(e.target.value))
              }
              aria-label="Horizon d'affichage des projections"
            >
              <option value={0}>Désactivé</option>
              <option value={1}>1 mois</option>
              <option value={3}>3 mois</option>
              <option value={6}>6 mois</option>
              <option value={12}>12 mois</option>
              <option value={24}>24 mois</option>
            </select>
          )}

          <TransactionForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>

      {showCharts && (
        <ChartsDashboard
          transactions={filteredTransactions}
          filters={{
            period: settings?.periodFilter,
            year: selectedYear,
            month: selectedMonth,
            theme: selectedTheme,
            payment: selectedPayment,
          }}
        />
      )}

      <TransactionsTable
        transactions={filteredTransactions}
        headers={TABLE_HEADERS}
        onDelete={onDelete}
        onUpdate={onUpdate}
        accountPermissions={accountPermissions}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={APP_LABELS.confirmTitle}
        message={
          confirmModal.transactionData
            ? `${APP_LABELS.confirmMessage}\n\nDate: ${confirmModal.transactionData.date}\nDésignation: ${confirmModal.transactionData.designation}\n\nCette action est irréversible.`
            : `${APP_LABELS.confirmMessage}\n\nCette action est irréversible.`
        }
        confirmText={APP_LABELS.confirmButton}
        cancelText={APP_LABELS.confirmCancelButton}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Gestionnaire de thèmes - Drawer */}
      <DrawerThemeManager
        isOpen={showThemeManager}
        onClose={() => setShowThemeManager(false)}
        themes={themes}
        onSave={handleSaveThemes}
      />

      {/* Boutons d'action en position fixe */}
      <div className="action-buttons-fixed">
        <button
          className="btnThemes"
          onClick={() => setShowThemeManager(true)}
          title="Gérer les thèmes"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </button>
        <div className="btnGraph" onClick={() => setShowCharts((v) => !v)}>
          {showCharts ? <IcongraphDisable /> : <IconGraphActivated />}
        </div>
        <ScrollButton />
      </div>
    </AppShell>
  );
};

export default App;
