// ============================================
// CONFIGURATION GÉNÉRALE DE L'APPLICATION
// ============================================
// Tous les textes et labels de l'application sont centralisés ici
// pour faciliter la maintenance et la réutilisation du code

// ============================================
// 1. DONNÉES TEMPORELLES
// ============================================
export const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// ============================================
// 2. EN-TÊTES DE TABLEAU
// ============================================
export const TABLE_HEADERS = [
  "Thèmes",
  "Moyens de paiement",
  "Désignations",
  "Recettes",
  "Dépenses",
  "Soldes",
  "Actions",
];

// ============================================
// 3. FILTRES DE PÉRIODE
// ============================================
export const PERIOD_OPTIONS = [
  { value: "all", label: "Tous les mouvements" },
  { value: "6weeks", label: "6 dernières semaines" },
  { value: "2months", label: "2 derniers mois" },
  { value: "3months", label: "3 derniers mois" },
  { value: "currentMonth", label: "Mois en cours" },
  { value: "previousMonth", label: "Mois précédent" },
  { value: "currentYear", label: "Année en cours" },
];

// ============================================
// 4. LIBELLÉS DE L'APPLICATION
// ============================================
export const APP_LABELS = {
  // En-tête
  appTitle: "Compte courant",
  lastUpdatePrefix: "Dernière MAJ", // Sera suivi de la date calculée dynamiquement

  // Filtres
  filterTheme: "Thèmes",
  filterPayment: "Paiement",
  filterReset: "Réinitialiser",

  // Formulaire
  formTitle: "Ajouter un mouvement bancaire",
  formCancel: "Annuler",
  formDesignationPlaceholder: "Désignation",
  formRecette: "Recette",
  formDepense: "Dépense",
  formSubmit: "Ajouter",

  // Table
  noTransactions: "Aucune action bancaire pour ce mois.",
  ariaDesignation: "Désignation",
  ariaSave: "Enregistrer",
  ariaCancel: "Annuler",
  ariaEdit: "Modifier",
  ariaDelete: "Supprimer",
  ariaEnableTransaction: "Activer le mouvement",
  ariaDisableTransaction: "Désactiver le mouvement",

  // Graphiques
  chartComparison: "Comparaison",
  chartRepartition: "Répartition",
  chartRecettes: "Recettes",
  chartDepenses: "Dépenses",
  chartLabelRecettes: "📈", // Emoji pour les recettes
  chartLabelDepenses: "📉", // Emoji pour les dépenses

  // Catégories par défaut
  defaultCategory: "Inclassables",
  defaultTheme: "Autres",

  // Scroll
  scrollToTop: "Aller en haut de la page",
  scrollToBottom: "Aller en bas de la page",

  // Modal de confirmation
  confirmTitle: "Confirmer la suppression",
  confirmMessage: "Êtes-vous sûr de vouloir supprimer ce mouvement ?",
  confirmButton: "Supprimer",
  confirmCancelButton: "Annuler",

  // Thème
  ariaThemeToggle: "Changer de thème",

  // Sélecteur de mois
  ariaMonthPicker: "Choisir un mois",
  monthLabel: "Mois",

  // Temps écoulé (Dernière MAJ)
  timeUnknown: "Date inconnue",
  timeNow: "À l'instant",
  timeMinuteSingular: "Il y a 1 min",
  timeMinutesPlural: "Il y a {count} min",
  timeHourSingular: "Il y a 1 heure",
  timeHoursPlural: "Il y a {count} heures",
  timeDaySingular: "Il y a 1 jour",
  timeDaysPlural: "Il y a {count} jours",
  timeWeekSingular: "Il y a 1 semaine",
  timeWeeksPlural: "Il y a {count} semaines",
  timeMonthSingular: "Il y a 1 mois",
  timeMonthsPlural: "Il y a {count} mois",
  timeYearSingular: "Il y a 1 an",
  timeYearsPlural: "Il y a {count} ans",
  timeNoData: "Aucune donnée",
};

// ============================================
// 5. MESSAGES D'ERREUR API
// ============================================
export const API_ERRORS = {
  loadTransactions: "Erreur chargement transactions",
  addTransaction: "Erreur ajout transaction",
  deleteTransaction: "Erreur suppression transaction",
  updateTransaction: "Erreur mise à jour transaction",
  updatePeriodFilter: "Erreur lors de la mise à jour du filtre de période",
};

// ============================================
// 6. RÈGLES DE VALIDATION DU FORMULAIRE
// ============================================
export const FIELD_RULES = [
  { field: "date", message: "La date est obligatoire." },
  {
    field: "themeId",
    validate: (data) => !data.themeId || !data.subThemeId,
    message: "Le thème et le sous-thème sont obligatoires.",
  },
  { field: "payment", message: "Le moyen de paiement est obligatoire." },
  { field: "designation", message: "La désignation est obligatoire." },
  {
    field: "amount",
    validate: (data) => !data.amount || !data.bankMovement,
    message: "Le montant et le type (recette ou dépense) sont obligatoires.",
  },
];

// ============================================
// 7. VALEURS CONSTANTES
// ============================================
export const TRANSACTION_TYPES = {
  recette: "recette",
  depense: "depense",
};

// Fonction helper pour récupérer les variables CSS
const getCSSVariable = (variableName) => {
  if (typeof window === "undefined") return "#000000"; // Fallback pour SSR
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

// Fonction pour générer les couleurs dynamiquement depuis les variables CSS
// Les couleurs sont alternées pour créer un contraste prononcé entre barres adjacentes
const getChartColors = () => ({
  recettes: {
    primary: getCSSVariable("--color-success-900"),
    secondary: getCSSVariable("--color-success-600"),
    palette: [
      getCSSVariable("--color-success-900"), // Très foncé
      getCSSVariable("--color-success-400"), // Moyen clair
      getCSSVariable("--color-success-700"), // Foncé
      getCSSVariable("--color-success-200"), // Très clair
      getCSSVariable("--color-success-800"), // Très foncé
      getCSSVariable("--color-success-300"), // Clair
      getCSSVariable("--color-success-600"), // Base (moyen)
      getCSSVariable("--color-success-100"), // Très très clair
      getCSSVariable("--color-success-500"), // Moyen
      getCSSVariable("--color-success"), // Base alternative
    ],
  },
  depenses: {
    primary: getCSSVariable("--color-danger-900"),
    secondary: getCSSVariable("--color-danger-600"),
    palette: [
      getCSSVariable("--color-danger-900"), // Rouge très foncé
      getCSSVariable("--color-danger-300"), // Orange clair (contraste fort)
      getCSSVariable("--color-danger-700"), // Rouge foncé
      getCSSVariable("--color-danger-100"), // Orange très pâle (contraste fort)
      getCSSVariable("--color-danger-800"), // Rouge très foncé
      getCSSVariable("--color-danger-400"), // Orange-rouge (contraste moyen)
      getCSSVariable("--color-danger-600"), // Rouge base
      getCSSVariable("--color-danger-200"), // Orange pâle (contraste fort)
      getCSSVariable("--color-danger-500"), // Rouge vers orange
      getCSSVariable("--color-danger"), // Rouge base alternative
    ],
  },
});

export const CHART_COLORS = getChartColors();
