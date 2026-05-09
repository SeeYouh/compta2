import "./LabelsSettings.scss";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import Loader from "../components/Loader";
import { useLabels } from "../components/hooks/useLabels";

export default function LabelsSettings() {
  const navigate = useNavigate();
  const { rawLabels, saveLabels, resetToDefaults, loading } = useLabels();
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (rawLabels) {
      setFormData(rawLabels);
    }
  }, [rawLabels]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await saveLabels(formData);
      setMessage({ type: "success", text: "Labels sauvegardés avec succès" });
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser tous les labels aux valeurs par défaut ?",
      )
    ) {
      return;
    }

    setResetting(true);
    setMessage(null);

    try {
      await resetToDefaults();
      setMessage({
        type: "success",
        text: "Labels réinitialisés avec succès",
      });
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de la réinitialisation" });
    } finally {
      setResetting(false);
    }
  };

  const labelGroups = [
    {
      title: "Application",
      fields: [
        { key: "appTitle", label: "Titre de l'application" },
        { key: "lastUpdatePrefix", label: "Préfixe dernière mise à jour" },
      ],
    },
    {
      title: "En-têtes de tableau",
      fields: [
        { key: "tableHeaderThemes", label: "Thèmes" },
        { key: "tableHeaderPayment", label: "Moyens de paiement" },
        { key: "tableHeaderDesignation", label: "Désignations" },
        { key: "tableHeaderRecettes", label: "Recettes" },
        { key: "tableHeaderDepenses", label: "Dépenses" },
        { key: "tableHeaderSoldes", label: "Soldes" },
        { key: "tableHeaderActions", label: "Actions" },
      ],
    },
    {
      title: "Filtres",
      fields: [
        { key: "filterTheme", label: "Filtre thèmes" },
        { key: "filterPayment", label: "Filtre paiement" },
        { key: "filterReset", label: "Réinitialiser" },
      ],
    },
    {
      title: "Périodes",
      fields: [
        { key: "periodAll", label: "Tous les mouvements" },
        { key: "period6Weeks", label: "6 dernières semaines" },
        { key: "period2Months", label: "2 derniers mois" },
        { key: "period3Months", label: "3 derniers mois" },
        { key: "periodCurrentMonth", label: "Mois en cours" },
        { key: "periodPreviousMonth", label: "Mois précédent" },
        { key: "periodCurrentYear", label: "Année en cours" },
      ],
    },
    {
      title: "Formulaire de transaction",
      fields: [
        { key: "formTitle", label: "Titre du formulaire" },
        { key: "formCancel", label: "Annuler" },
        { key: "formDesignationPlaceholder", label: "Placeholder désignation" },
        { key: "formRecette", label: "Recette" },
        { key: "formDepense", label: "Dépense" },
        { key: "formSubmit", label: "Soumettre" },
      ],
    },
    {
      title: "Graphiques",
      fields: [
        { key: "chartComparison", label: "Comparaison" },
        { key: "chartRepartition", label: "Répartition" },
        { key: "chartRecettes", label: "Recettes" },
        { key: "chartDepenses", label: "Dépenses" },
        { key: "chartLabelRecettes", label: "Label recettes" },
        { key: "chartLabelDepenses", label: "Label dépenses" },
      ],
    },
    {
      title: "Messages",
      fields: [
        { key: "noTransactions", label: "Aucune transaction" },
        { key: "confirmTitle", label: "Titre confirmation" },
        { key: "confirmMessage", label: "Message confirmation" },
        { key: "confirmButton", label: "Bouton confirmer" },
        { key: "confirmCancelButton", label: "Bouton annuler" },
      ],
    },
    {
      title: "Connexion",
      fields: [
        { key: "authLoginTitle", label: "Titre" },
        { key: "authLoginSubtitle", label: "Sous-titre" },
        { key: "authLoginEmail", label: "Email" },
        { key: "authLoginPassword", label: "Mot de passe" },
        { key: "authLoginForgotPassword", label: "Mot de passe oublié" },
        { key: "authLoginSubmit", label: "Se connecter" },
        { key: "authLoginNoAccount", label: "Pas de compte" },
        { key: "authLoginCreateAccount", label: "Créer un compte" },
      ],
    },
    {
      title: "Inscription",
      fields: [
        { key: "authRegisterTitle", label: "Titre" },
        { key: "authRegisterSubtitle", label: "Sous-titre" },
        { key: "authRegisterName", label: "Nom" },
        { key: "authRegisterEmail", label: "Email" },
        { key: "authRegisterPassword", label: "Mot de passe" },
        {
          key: "authRegisterPasswordConfirm",
          label: "Confirmer le mot de passe",
        },
        { key: "authRegisterSubmit", label: "Créer mon compte" },
        { key: "authRegisterHasAccount", label: "Déjà un compte" },
      ],
    },
  ];

  const filteredGroups = labelGroups
    .map((group) => ({
      ...group,
      fields: group.fields.filter(
        (field) =>
          field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (formData[field.key] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((group) => group.fields.length > 0);

  if (loading) {
    return (
      <AppShell>
        <div className="labels-settings">
          <Loader />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="labels-settings">
        <div className="labels-settings__header">
          <button
            type="button"
            className="labels-settings__back"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </button>
          <h1 className="labels-settings__title">
            Personnalisation des labels
          </h1>
          <p className="labels-settings__subtitle">
            Modifiez tous les textes de l'application selon vos préférences
          </p>
        </div>

        {message && (
          <div
            className={`labels-settings__message labels-settings__message--${message.type}`}
          >
            {message.text}
          </div>
        )}

        <div className="labels-settings__actions">
          <input
            type="text"
            className="labels-settings__search"
            placeholder="Rechercher un label..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="labels-settings__reset-btn"
            onClick={handleReset}
            disabled={resetting || saving}
          >
            {resetting ? "Réinitialisation..." : "Réinitialiser tout"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="labels-settings__form">
          {filteredGroups.map((group) => (
            <div key={group.title} className="labels-settings__group">
              <h2 className="labels-settings__group-title">{group.title}</h2>
              <div className="labels-settings__fields">
                {group.fields.map((field) => (
                  <div key={field.key} className="labels-settings__field">
                    <label
                      htmlFor={field.key}
                      className="labels-settings__label"
                    >
                      {field.label}
                    </label>
                    <input
                      type="text"
                      id={field.key}
                      className="labels-settings__input"
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      disabled={saving || resetting}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="labels-settings__no-results">
              Aucun label trouvé pour "{searchTerm}"
            </div>
          )}

          <div className="labels-settings__submit">
            <button
              type="submit"
              className="labels-settings__submit-btn"
              disabled={saving || resetting}
            >
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
