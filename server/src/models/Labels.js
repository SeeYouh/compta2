import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const LabelsSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `labels-${uuidv4()}`,
    },
    userId: {
      type: String,
      required: true,
    },
    // En-tête de l'application
    appTitle: { type: String, default: "Compte courant" },
    lastUpdatePrefix: { type: String, default: "Dernière MAJ" },

    // Mois de l'année
    months: {
      type: [String],
      default: [
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
      ],
    },

    // En-têtes de tableau
    tableHeaderThemes: { type: String, default: "Thèmes" },
    tableHeaderPayment: { type: String, default: "Moyens de paiement" },
    tableHeaderDesignation: { type: String, default: "Désignations" },
    tableHeaderRecettes: { type: String, default: "Recettes" },
    tableHeaderDepenses: { type: String, default: "Dépenses" },
    tableHeaderSoldes: { type: String, default: "Soldes" },
    tableHeaderActions: { type: String, default: "Actions" },

    // Filtres
    filterTheme: { type: String, default: "Thèmes" },
    filterPayment: { type: String, default: "Paiement" },
    filterReset: { type: String, default: "Réinitialiser" },

    // Options de période
    periodAll: { type: String, default: "Tous les mouvements" },
    period6Weeks: { type: String, default: "6 dernières semaines" },
    period2Months: { type: String, default: "2 derniers mois" },
    period3Months: { type: String, default: "3 derniers mois" },
    periodCurrentMonth: { type: String, default: "Mois en cours" },
    periodPreviousMonth: { type: String, default: "Mois précédent" },
    periodCurrentYear: { type: String, default: "Année en cours" },

    // Formulaire
    formTitle: { type: String, default: "Ajouter un mouvement bancaire" },
    formCancel: { type: String, default: "Annuler" },
    formDesignationPlaceholder: { type: String, default: "Désignation" },
    formRecette: { type: String, default: "Recette" },
    formDepense: { type: String, default: "Dépense" },
    formSubmit: { type: String, default: "Ajouter" },

    // Table
    noTransactions: {
      type: String,
      default: "Aucune action bancaire pour ce mois.",
    },
    ariaDesignation: { type: String, default: "Désignation" },
    ariaSave: { type: String, default: "Enregistrer" },
    ariaCancel: { type: String, default: "Annuler" },
    ariaEdit: { type: String, default: "Modifier" },
    ariaDelete: { type: String, default: "Supprimer" },
    ariaEnableTransaction: { type: String, default: "Activer le mouvement" },
    ariaDisableTransaction: { type: String, default: "Désactiver le mouvement" },

    // Graphiques
    chartComparison: { type: String, default: "Comparaison" },
    chartRepartition: { type: String, default: "Répartition" },
    chartRecettes: { type: String, default: "Recettes" },
    chartDepenses: { type: String, default: "Dépenses" },
    chartLabelRecettes: { type: String, default: "📈" },
    chartLabelDepenses: { type: String, default: "📉" },

    // Catégories par défaut
    defaultCategory: { type: String, default: "Inclassables" },
    defaultTheme: { type: String, default: "Autres" },

    // Scroll
    scrollToTop: { type: String, default: "Aller en haut de la page" },
    scrollToBottom: { type: String, default: "Aller en bas de la page" },

    // Modal de confirmation
    confirmTitle: { type: String, default: "Confirmer la suppression" },
    confirmMessage: {
      type: String,
      default: "Êtes-vous sûr de vouloir supprimer ce mouvement ?",
    },
    confirmButton: { type: String, default: "Supprimer" },
    confirmCancelButton: { type: String, default: "Annuler" },

    // Thème
    ariaThemeToggle: { type: String, default: "Changer de thème" },

    // Sélecteur de mois
    ariaMonthPicker: { type: String, default: "Choisir un mois" },
    monthLabel: { type: String, default: "Mois" },

    // Temps écoulé (Dernière MAJ)
    timeUnknown: { type: String, default: "Date inconnue" },
    timeNow: { type: String, default: "À l'instant" },
    timeMinuteSingular: { type: String, default: "Il y a 1 min" },
    timeMinutesPlural: { type: String, default: "Il y a {count} min" },
    timeHourSingular: { type: String, default: "Il y a 1 heure" },
    timeHoursPlural: { type: String, default: "Il y a {count} heures" },
    timeDaySingular: { type: String, default: "Il y a 1 jour" },
    timeDaysPlural: { type: String, default: "Il y a {count} jours" },
    timeWeekSingular: { type: String, default: "Il y a 1 semaine" },
    timeWeeksPlural: { type: String, default: "Il y a {count} semaines" },
    timeMonthSingular: { type: String, default: "Il y a 1 mois" },
    timeMonthsPlural: { type: String, default: "Il y a {count} mois" },
    timeYearSingular: { type: String, default: "Il y a 1 an" },
    timeYearsPlural: { type: String, default: "Il y a {count} ans" },
    timeNoData: { type: String, default: "Aucune donnée" },

    // Messages d'erreur API
    errorLoadTransactions: {
      type: String,
      default: "Erreur chargement transactions",
    },
    errorAddTransaction: { type: String, default: "Erreur ajout transaction" },
    errorDeleteTransaction: {
      type: String,
      default: "Erreur suppression transaction",
    },
    errorUpdateTransaction: {
      type: String,
      default: "Erreur mise à jour transaction",
    },
    errorUpdatePeriodFilter: {
      type: String,
      default: "Erreur lors de la mise à jour du filtre de période",
    },

    // Validation du formulaire
    validationDateRequired: { type: String, default: "La date est obligatoire." },
    validationThemeRequired: {
      type: String,
      default: "Le thème et le sous-thème sont obligatoires.",
    },
    validationPaymentRequired: {
      type: String,
      default: "Le moyen de paiement est obligatoire.",
    },
    validationDesignationRequired: {
      type: String,
      default: "La désignation est obligatoire.",
    },
    validationAmountRequired: {
      type: String,
      default: "Le montant et le type (recette ou dépense) sont obligatoires.",
    },

    // Pages d'authentification - Login
    authLoginTitle: { type: String, default: "Bienvenue" },
    authLoginSubtitle: {
      type: String,
      default: "Connectez-vous pour accéder à votre compte",
    },
    authLoginEmail: { type: String, default: "Email" },
    authLoginPassword: { type: String, default: "Mot de passe" },
    authLoginEmailPlaceholder: { type: String, default: "votre@email.com" },
    authLoginPasswordPlaceholder: { type: String, default: "••••••••" },
    authLoginForgotPassword: { type: String, default: "Mot de passe oublié ?" },
    authLoginSubmit: { type: String, default: "Se connecter" },
    authLoginSubmitLoading: { type: String, default: "Connexion en cours..." },
    authLoginNoAccount: { type: String, default: "Pas encore de compte ?" },
    authLoginCreateAccount: { type: String, default: "Créer un compte" },
    authLoginErrorDefault: { type: String, default: "Erreur de connexion" },

    // Pages d'authentification - Register
    authRegisterTitle: { type: String, default: "Créer un compte" },
    authRegisterSubtitle: {
      type: String,
      default: "Commencez à gérer vos finances dès aujourd'hui",
    },
    authRegisterName: { type: String, default: "Nom / Pseudo" },
    authRegisterNamePlaceholder: { type: String, default: "Jean Dupont" },
    authRegisterEmail: { type: String, default: "Email" },
    authRegisterPassword: { type: String, default: "Mot de passe" },
    authRegisterPasswordConfirm: {
      type: String,
      default: "Confirmer le mot de passe",
    },
    authRegisterPasswordHint: { type: String, default: "Minimum 6 caractères" },
    authRegisterSubmit: { type: String, default: "Créer mon compte" },
    authRegisterSubmitLoading: {
      type: String,
      default: "Création du compte...",
    },
    authRegisterHasAccount: { type: String, default: "Déjà un compte ?" },
    authRegisterLogin: { type: String, default: "Se connecter" },
    authRegisterErrorPasswordMismatch: {
      type: String,
      default: "Les mots de passe ne correspondent pas",
    },
    authRegisterErrorPasswordLength: {
      type: String,
      default: "Le mot de passe doit contenir au moins 6 caractères",
    },
    authRegisterErrorDefault: {
      type: String,
      default: "Erreur lors de l'inscription",
    },
    authRegisterSuccessMessage: {
      type: String,
      default:
        "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.",
    },

    // Pages d'authentification - ForgotPassword
    authForgotTitle: { type: String, default: "Mot de passe oublié ?" },
    authForgotSubtitle: {
      type: String,
      default: "Recevez un lien de réinitialisation",
    },
    authForgotSubtitleSuccess: {
      type: String,
      default: "Vérifiez votre boîte mail",
    },
    authForgotEmailSent: { type: String, default: "Email envoyé" },
    authForgotEmailSentMessage: {
      type: String,
      default:
        "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.",
    },
    authForgotCheckSpam: {
      type: String,
      default: "Pensez à vérifier vos spams",
    },
    authForgotBackToLogin: { type: String, default: "Retour à la connexion" },
    authForgotHint: {
      type: String,
      default:
        "Entrez votre adresse email pour recevoir un lien de réinitialisation",
    },
    authForgotSubmit: { type: String, default: "Envoyer le lien" },
    authForgotSubmitLoading: { type: String, default: "Envoi en cours..." },
    authForgotErrorDefault: {
      type: String,
      default: "Erreur lors de la demande",
    },

    // Pages d'authentification - ResetPassword
    authResetTitle: { type: String, default: "Nouveau mot de passe" },
    authResetSubtitle: {
      type: String,
      default: "Créez un nouveau mot de passe sécurisé",
    },
    authResetPassword: { type: String, default: "Nouveau mot de passe" },
    authResetPasswordConfirm: {
      type: String,
      default: "Confirmer le mot de passe",
    },
    authResetPasswordHint: { type: String, default: "Minimum 6 caractères" },
    authResetSubmit: {
      type: String,
      default: "Réinitialiser le mot de passe",
    },
    authResetSubmitLoading: { type: String, default: "Réinitialisation..." },
    authResetSuccess: {
      type: String,
      default: "Mot de passe réinitialisé avec succès ! Redirection en cours...",
    },
    authResetRememberPassword: {
      type: String,
      default: "Vous vous souvenez de votre mot de passe ?",
    },
    authResetNewRequest: {
      type: String,
      default: "Faire une nouvelle demande",
    },
    authResetErrorPasswordMismatch: {
      type: String,
      default: "Les mots de passe ne correspondent pas",
    },
    authResetErrorPasswordLength: {
      type: String,
      default: "Le mot de passe doit contenir au moins 6 caractères",
    },
    authResetErrorDefault: {
      type: String,
      default: "Erreur lors de la réinitialisation",
    },
    authResetErrorTokenMissing: {
      type: String,
      default: "Token de réinitialisation manquant ou invalide",
    },

    // Account settings
    accountColorTitle: { type: String, default: "Couleur du compte" },
    accountColorReset: {
      type: String,
      default: "Réinitialiser au bleu par défaut",
    },
    accountColorCustom: { type: String, default: "Couleur personnalisée :" },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons par utilisateur
LabelsSchema.index({ userId: 1 }, { unique: true });

const Labels = mongoose.model("Labels", LabelsSchema);

export default Labels;
