import { useCallback, useEffect, useState } from "react";

import { LabelsContext } from "./createLabelsContext";
import { authFetch } from "../components/utils/authFetch";
import {
  APP_LABELS as DEFAULT_APP_LABELS,
  MONTHS as DEFAULT_MONTHS,
  TABLE_HEADERS as DEFAULT_TABLE_HEADERS,
  PERIOD_OPTIONS as DEFAULT_PERIOD_OPTIONS,
  API_ERRORS as DEFAULT_API_ERRORS,
  FIELD_RULES as DEFAULT_FIELD_RULES,
} from "../components/utils/index";

/**
 * Récupère les labels personnalisés de l'utilisateur
 */
async function getLabels() {
  const response = await authFetch("/api/labels");
  if (!response.ok) throw new Error("Erreur lors du chargement des labels");
  return response.json();
}

/**
 * Met à jour les labels personnalisés
 */
async function updateLabels(labels) {
  const response = await authFetch("/api/labels", {
    method: "PUT",
    body: JSON.stringify(labels),
  });
  if (!response.ok)
    throw new Error("Erreur lors de la mise à jour des labels");
  return response.json();
}

/**
 * Réinitialise les labels aux valeurs par défaut
 */
async function resetLabels() {
  const response = await authFetch("/api/labels/reset", {
    method: "POST",
  });
  if (!response.ok)
    throw new Error("Erreur lors de la réinitialisation des labels");
  return response.json();
}

export function LabelsProvider({ children }) {
  const [rawLabels, setRawLabels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLabels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLabels();
      setRawLabels(data);
      setError(null);
    } catch (err) {
      console.error("Erreur chargement labels:", err);
      setError(err);
      // En cas d'erreur, utiliser les labels par défaut
      setRawLabels(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  /**
   * Met à jour les labels
   */
  const saveLabels = useCallback(async (updates) => {
    try {
      const data = await updateLabels(updates);
      setRawLabels(data);
      setError(null);
      return data;
    } catch (err) {
      console.error("Erreur mise à jour labels:", err);
      setError(err);
      throw err;
    }
  }, []);

  /**
   * Réinitialise tous les labels
   */
  const resetToDefaults = useCallback(async () => {
    try {
      const data = await resetLabels();
      setRawLabels(data);
      setError(null);
      return data;
    } catch (err) {
      console.error("Erreur réinitialisation labels:", err);
      setError(err);
      throw err;
    }
  }, []);

  // Transformer les labels bruts en structure utilisable par l'application
  const labels = rawLabels
    ? {
        // Application
        appTitle: rawLabels.appTitle,
        lastUpdatePrefix: rawLabels.lastUpdatePrefix,

        // Mois
        months: rawLabels.months || DEFAULT_MONTHS,

        // En-têtes de tableau
        tableHeaders: [
          rawLabels.tableHeaderThemes,
          rawLabels.tableHeaderPayment,
          rawLabels.tableHeaderDesignation,
          rawLabels.tableHeaderRecettes,
          rawLabels.tableHeaderDepenses,
          rawLabels.tableHeaderSoldes,
          rawLabels.tableHeaderActions,
        ],

        // Filtres
        filterTheme: rawLabels.filterTheme,
        filterPayment: rawLabels.filterPayment,
        filterReset: rawLabels.filterReset,

        // Options de période
        periodOptions: [
          { value: "all", label: rawLabels.periodAll },
          { value: "6weeks", label: rawLabels.period6Weeks },
          { value: "2months", label: rawLabels.period2Months },
          { value: "3months", label: rawLabels.period3Months },
          { value: "currentMonth", label: rawLabels.periodCurrentMonth },
          { value: "previousMonth", label: rawLabels.periodPreviousMonth },
          { value: "currentYear", label: rawLabels.periodCurrentYear },
        ],

        // Formulaire
        formTitle: rawLabels.formTitle,
        formCancel: rawLabels.formCancel,
        formDesignationPlaceholder: rawLabels.formDesignationPlaceholder,
        formRecette: rawLabels.formRecette,
        formDepense: rawLabels.formDepense,
        formSubmit: rawLabels.formSubmit,

        // Table
        noTransactions: rawLabels.noTransactions,
        ariaDesignation: rawLabels.ariaDesignation,
        ariaSave: rawLabels.ariaSave,
        ariaCancel: rawLabels.ariaCancel,
        ariaEdit: rawLabels.ariaEdit,
        ariaDelete: rawLabels.ariaDelete,
        ariaEnableTransaction: rawLabels.ariaEnableTransaction,
        ariaDisableTransaction: rawLabels.ariaDisableTransaction,

        // Graphiques
        chartComparison: rawLabels.chartComparison,
        chartRepartition: rawLabels.chartRepartition,
        chartRecettes: rawLabels.chartRecettes,
        chartDepenses: rawLabels.chartDepenses,
        chartLabelRecettes: rawLabels.chartLabelRecettes,
        chartLabelDepenses: rawLabels.chartLabelDepenses,

        // Catégories par défaut
        defaultCategory: rawLabels.defaultCategory,
        defaultTheme: rawLabels.defaultTheme,

        // Scroll
        scrollToTop: rawLabels.scrollToTop,
        scrollToBottom: rawLabels.scrollToBottom,

        // Modal de confirmation
        confirmTitle: rawLabels.confirmTitle,
        confirmMessage: rawLabels.confirmMessage,
        confirmButton: rawLabels.confirmButton,
        confirmCancelButton: rawLabels.confirmCancelButton,

        // Thème
        ariaThemeToggle: rawLabels.ariaThemeToggle,

        // Sélecteur de mois
        ariaMonthPicker: rawLabels.ariaMonthPicker,
        monthLabel: rawLabels.monthLabel,

        // Temps écoulé
        timeUnknown: rawLabels.timeUnknown,
        timeNow: rawLabels.timeNow,
        timeMinuteSingular: rawLabels.timeMinuteSingular,
        timeMinutesPlural: rawLabels.timeMinutesPlural,
        timeHourSingular: rawLabels.timeHourSingular,
        timeHoursPlural: rawLabels.timeHoursPlural,
        timeDaySingular: rawLabels.timeDaySingular,
        timeDaysPlural: rawLabels.timeDaysPlural,
        timeWeekSingular: rawLabels.timeWeekSingular,
        timeWeeksPlural: rawLabels.timeWeeksPlural,
        timeMonthSingular: rawLabels.timeMonthSingular,
        timeMonthsPlural: rawLabels.timeMonthsPlural,
        timeYearSingular: rawLabels.timeYearSingular,
        timeYearsPlural: rawLabels.timeYearsPlural,
        timeNoData: rawLabels.timeNoData,

        // Erreurs API
        apiErrors: {
          loadTransactions: rawLabels.errorLoadTransactions,
          addTransaction: rawLabels.errorAddTransaction,
          deleteTransaction: rawLabels.errorDeleteTransaction,
          updateTransaction: rawLabels.errorUpdateTransaction,
          updatePeriodFilter: rawLabels.errorUpdatePeriodFilter,
        },

        // Validation
        validationMessages: {
          dateRequired: rawLabels.validationDateRequired,
          themeRequired: rawLabels.validationThemeRequired,
          paymentRequired: rawLabels.validationPaymentRequired,
          designationRequired: rawLabels.validationDesignationRequired,
          amountRequired: rawLabels.validationAmountRequired,
        },

        // Authentification - Login
        authLogin: {
          title: rawLabels.authLoginTitle,
          subtitle: rawLabels.authLoginSubtitle,
          email: rawLabels.authLoginEmail,
          password: rawLabels.authLoginPassword,
          emailPlaceholder: rawLabels.authLoginEmailPlaceholder,
          passwordPlaceholder: rawLabels.authLoginPasswordPlaceholder,
          forgotPassword: rawLabels.authLoginForgotPassword,
          submit: rawLabels.authLoginSubmit,
          submitLoading: rawLabels.authLoginSubmitLoading,
          noAccount: rawLabels.authLoginNoAccount,
          createAccount: rawLabels.authLoginCreateAccount,
          errorDefault: rawLabels.authLoginErrorDefault,
        },

        // Authentification - Register
        authRegister: {
          title: rawLabels.authRegisterTitle,
          subtitle: rawLabels.authRegisterSubtitle,
          name: rawLabels.authRegisterName,
          namePlaceholder: rawLabels.authRegisterNamePlaceholder,
          email: rawLabels.authRegisterEmail,
          password: rawLabels.authRegisterPassword,
          passwordConfirm: rawLabels.authRegisterPasswordConfirm,
          passwordHint: rawLabels.authRegisterPasswordHint,
          submit: rawLabels.authRegisterSubmit,
          submitLoading: rawLabels.authRegisterSubmitLoading,
          hasAccount: rawLabels.authRegisterHasAccount,
          login: rawLabels.authRegisterLogin,
          errorPasswordMismatch: rawLabels.authRegisterErrorPasswordMismatch,
          errorPasswordLength: rawLabels.authRegisterErrorPasswordLength,
          errorDefault: rawLabels.authRegisterErrorDefault,
          successMessage: rawLabels.authRegisterSuccessMessage,
        },

        // Authentification - ForgotPassword
        authForgot: {
          title: rawLabels.authForgotTitle,
          subtitle: rawLabels.authForgotSubtitle,
          subtitleSuccess: rawLabels.authForgotSubtitleSuccess,
          emailSent: rawLabels.authForgotEmailSent,
          emailSentMessage: rawLabels.authForgotEmailSentMessage,
          checkSpam: rawLabels.authForgotCheckSpam,
          backToLogin: rawLabels.authForgotBackToLogin,
          hint: rawLabels.authForgotHint,
          submit: rawLabels.authForgotSubmit,
          submitLoading: rawLabels.authForgotSubmitLoading,
          errorDefault: rawLabels.authForgotErrorDefault,
        },

        // Authentification - ResetPassword
        authReset: {
          title: rawLabels.authResetTitle,
          subtitle: rawLabels.authResetSubtitle,
          password: rawLabels.authResetPassword,
          passwordConfirm: rawLabels.authResetPasswordConfirm,
          passwordHint: rawLabels.authResetPasswordHint,
          submit: rawLabels.authResetSubmit,
          submitLoading: rawLabels.authResetSubmitLoading,
          success: rawLabels.authResetSuccess,
          rememberPassword: rawLabels.authResetRememberPassword,
          newRequest: rawLabels.authResetNewRequest,
          errorPasswordMismatch: rawLabels.authResetErrorPasswordMismatch,
          errorPasswordLength: rawLabels.authResetErrorPasswordLength,
          errorDefault: rawLabels.authResetErrorDefault,
          errorTokenMissing: rawLabels.authResetErrorTokenMissing,
        },

        // Account settings
        account: {
          colorTitle: rawLabels.accountColorTitle,
          colorReset: rawLabels.accountColorReset,
          colorCustom: rawLabels.accountColorCustom,
        },
      }
    : {
        // Valeurs par défaut si les labels ne sont pas chargés
        appTitle: DEFAULT_APP_LABELS.appTitle,
        lastUpdatePrefix: DEFAULT_APP_LABELS.lastUpdatePrefix,
        months: DEFAULT_MONTHS,
        tableHeaders: DEFAULT_TABLE_HEADERS,
        filterTheme: DEFAULT_APP_LABELS.filterTheme,
        filterPayment: DEFAULT_APP_LABELS.filterPayment,
        filterReset: DEFAULT_APP_LABELS.filterReset,
        periodOptions: DEFAULT_PERIOD_OPTIONS,
        formTitle: DEFAULT_APP_LABELS.formTitle,
        formCancel: DEFAULT_APP_LABELS.formCancel,
        formDesignationPlaceholder: DEFAULT_APP_LABELS.formDesignationPlaceholder,
        formRecette: DEFAULT_APP_LABELS.formRecette,
        formDepense: DEFAULT_APP_LABELS.formDepense,
        formSubmit: DEFAULT_APP_LABELS.formSubmit,
        noTransactions: DEFAULT_APP_LABELS.noTransactions,
        ariaDesignation: DEFAULT_APP_LABELS.ariaDesignation,
        ariaSave: DEFAULT_APP_LABELS.ariaSave,
        ariaCancel: DEFAULT_APP_LABELS.ariaCancel,
        ariaEdit: DEFAULT_APP_LABELS.ariaEdit,
        ariaDelete: DEFAULT_APP_LABELS.ariaDelete,
        ariaEnableTransaction: DEFAULT_APP_LABELS.ariaEnableTransaction,
        ariaDisableTransaction: DEFAULT_APP_LABELS.ariaDisableTransaction,
        chartComparison: DEFAULT_APP_LABELS.chartComparison,
        chartRepartition: DEFAULT_APP_LABELS.chartRepartition,
        chartRecettes: DEFAULT_APP_LABELS.chartRecettes,
        chartDepenses: DEFAULT_APP_LABELS.chartDepenses,
        chartLabelRecettes: DEFAULT_APP_LABELS.chartLabelRecettes,
        chartLabelDepenses: DEFAULT_APP_LABELS.chartLabelDepenses,
        defaultCategory: DEFAULT_APP_LABELS.defaultCategory,
        defaultTheme: DEFAULT_APP_LABELS.defaultTheme,
        scrollToTop: DEFAULT_APP_LABELS.scrollToTop,
        scrollToBottom: DEFAULT_APP_LABELS.scrollToBottom,
        confirmTitle: DEFAULT_APP_LABELS.confirmTitle,
        confirmMessage: DEFAULT_APP_LABELS.confirmMessage,
        confirmButton: DEFAULT_APP_LABELS.confirmButton,
        confirmCancelButton: DEFAULT_APP_LABELS.confirmCancelButton,
        ariaThemeToggle: DEFAULT_APP_LABELS.ariaThemeToggle,
        ariaMonthPicker: DEFAULT_APP_LABELS.ariaMonthPicker,
        monthLabel: DEFAULT_APP_LABELS.monthLabel,
        timeUnknown: DEFAULT_APP_LABELS.timeUnknown,
        timeNow: DEFAULT_APP_LABELS.timeNow,
        timeMinuteSingular: DEFAULT_APP_LABELS.timeMinuteSingular,
        timeMinutesPlural: DEFAULT_APP_LABELS.timeMinutesPlural,
        timeHourSingular: DEFAULT_APP_LABELS.timeHourSingular,
        timeHoursPlural: DEFAULT_APP_LABELS.timeHoursPlural,
        timeDaySingular: DEFAULT_APP_LABELS.timeDaySingular,
        timeDaysPlural: DEFAULT_APP_LABELS.timeDaysPlural,
        timeWeekSingular: DEFAULT_APP_LABELS.timeWeekSingular,
        timeWeeksPlural: DEFAULT_APP_LABELS.timeWeeksPlural,
        timeMonthSingular: DEFAULT_APP_LABELS.timeMonthSingular,
        timeMonthsPlural: DEFAULT_APP_LABELS.timeMonthsPlural,
        timeYearSingular: DEFAULT_APP_LABELS.timeYearSingular,
        timeYearsPlural: DEFAULT_APP_LABELS.timeYearsPlural,
        timeNoData: DEFAULT_APP_LABELS.timeNoData,
        apiErrors: DEFAULT_API_ERRORS,
        validationMessages: {
          dateRequired: DEFAULT_FIELD_RULES[0].message,
          themeRequired: DEFAULT_FIELD_RULES[1].message,
          paymentRequired: DEFAULT_FIELD_RULES[2].message,
          designationRequired: DEFAULT_FIELD_RULES[3].message,
          amountRequired: DEFAULT_FIELD_RULES[4].message,
        },
        authLogin: {
          title: "Bienvenue",
          subtitle: "Connectez-vous pour accéder à votre compte",
          email: "Email",
          password: "Mot de passe",
          emailPlaceholder: "votre@email.com",
          passwordPlaceholder: "••••••••",
          forgotPassword: "Mot de passe oublié ?",
          submit: "Se connecter",
          submitLoading: "Connexion en cours...",
          noAccount: "Pas encore de compte ?",
          createAccount: "Créer un compte",
          errorDefault: "Erreur de connexion",
        },
        authRegister: {
          title: "Créer un compte",
          subtitle: "Commencez à gérer vos finances dès aujourd'hui",
          name: "Nom / Pseudo",
          namePlaceholder: "Jean Dupont",
          email: "Email",
          password: "Mot de passe",
          passwordConfirm: "Confirmer le mot de passe",
          passwordHint: "Minimum 6 caractères",
          submit: "Créer mon compte",
          submitLoading: "Création du compte...",
          hasAccount: "Déjà un compte ?",
          login: "Se connecter",
          errorPasswordMismatch: "Les mots de passe ne correspondent pas",
          errorPasswordLength:
            "Le mot de passe doit contenir au moins 6 caractères",
          errorDefault: "Erreur lors de l'inscription",
          successMessage:
            "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.",
        },
        authForgot: {
          title: "Mot de passe oublié ?",
          subtitle: "Recevez un lien de réinitialisation",
          subtitleSuccess: "Vérifiez votre boîte mail",
          emailSent: "Email envoyé",
          emailSentMessage:
            "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.",
          checkSpam: "Pensez à vérifier vos spams",
          backToLogin: "Retour à la connexion",
          hint: "Entrez votre adresse email pour recevoir un lien de réinitialisation",
          submit: "Envoyer le lien",
          submitLoading: "Envoi en cours...",
          errorDefault: "Erreur lors de la demande",
        },
        authReset: {
          title: "Nouveau mot de passe",
          subtitle: "Créez un nouveau mot de passe sécurisé",
          password: "Nouveau mot de passe",
          passwordConfirm: "Confirmer le mot de passe",
          passwordHint: "Minimum 6 caractères",
          submit: "Réinitialiser le mot de passe",
          submitLoading: "Réinitialisation...",
          success:
            "Mot de passe réinitialisé avec succès ! Redirection en cours...",
          rememberPassword: "Vous vous souvenez de votre mot de passe ?",
          newRequest: "Faire une nouvelle demande",
          errorPasswordMismatch: "Les mots de passe ne correspondent pas",
          errorPasswordLength:
            "Le mot de passe doit contenir au moins 6 caractères",
          errorDefault: "Erreur lors de la réinitialisation",
          errorTokenMissing: "Token de réinitialisation manquant ou invalide",
        },
        account: {
          colorTitle: "Couleur du compte",
          colorReset: "Réinitialiser au bleu par défaut",
          colorCustom: "Couleur personnalisée :",
        },
      };

  return (
    <LabelsContext.Provider
      value={{
        labels,
        rawLabels,
        loading,
        error,
        saveLabels,
        resetToDefaults,
        reload: loadLabels,
      }}
    >
      {children}
    </LabelsContext.Provider>
  );
}
