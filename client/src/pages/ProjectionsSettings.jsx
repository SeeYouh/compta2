import "./ProjectionsSettings.scss";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import {
  computeProjections,
  deleteProjection,
  getProjections,
  updateProjection,
} from "../components/utils/projectionsApi";
import { useAccounts } from "../contexts/useAccounts";

const HORIZON_OPTIONS = [
  { value: "1m", label: "1 mois" },
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "2y", label: "2 ans" },
  { value: "5y", label: "5 ans" },
  { value: "10y", label: "10 ans" },
];

const HORIZON_MONTHS_MAP = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
  "2y": 24,
  "5y": 60,
  "10y": 120,
};

const horizonKeyFromMonths = (months) =>
  Object.entries(HORIZON_MONTHS_MAP).find(([, v]) => v === months)?.[0] ?? "1y";

export default function ProjectionsSettings() {
  const navigate = useNavigate();
  const { activeAccountId } = useAccounts();

  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [computeHorizon, setComputeHorizon] = useState("1y");
  const [message, setMessage] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadProjections = useCallback(async () => {
    if (!activeAccountId) return;
    setLoading(true);
    try {
      const data = await getProjections(activeAccountId);
      setProjections(data);
    } catch {
      showMessage("error", "Impossible de charger les projections.");
    } finally {
      setLoading(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    loadProjections();
  }, [loadProjections]);

  const handleCompute = async () => {
    if (!activeAccountId) return;
    setComputing(true);
    setMessage(null);
    try {
      const result = await computeProjections(activeAccountId, computeHorizon);
      showMessage("success", `${result.count} projection(s) détectée(s).`);
      await loadProjections();
    } catch {
      showMessage("error", "Erreur lors du calcul des projections.");
    } finally {
      setComputing(false);
    }
  };

  const [editingAmount, setEditingAmount] = useState(null); // { projId, field, value }
  const amountInputRef = useRef(null);

  const handleAmountClick = (proj) => {
    const field = proj.recette != null ? "recette" : "depense";
    setEditingAmount({ projId: proj.id, field, value: String(proj[field]) });
  };

  const handleAmountSave = async () => {
    if (!editingAmount) return;
    const { projId, field, value } = editingAmount;
    const parsed = parseFloat(value.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) {
      setEditingAmount(null);
      return;
    }
    setEditingAmount(null);
    try {
      const updated = await updateProjection(projId, { [field]: parsed });
      setProjections((prev) =>
        prev.map((p) =>
          p.id === projId ? { ...p, [field]: updated[field] } : p,
        ),
      );
    } catch {
      showMessage("error", "Erreur lors de la mise à jour du montant.");
    }
  };

  const handleToggleActive = async (proj) => {
    try {
      const updated = await updateProjection(proj.id, { active: !proj.active });
      setProjections((prev) =>
        prev.map((p) =>
          p.id === proj.id ? { ...p, active: updated.active } : p,
        ),
      );
    } catch {
      showMessage("error", "Erreur lors de la mise à jour.");
    }
  };

  const handleToggleLoop = async (proj) => {
    try {
      const updated = await updateProjection(proj.id, { loop: !proj.loop });
      setProjections((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, loop: updated.loop } : p)),
      );
    } catch {
      showMessage("error", "Erreur lors de la mise à jour.");
    }
  };

  const handleHorizonChange = async (proj, newHorizonKey) => {
    const newMonths = HORIZON_MONTHS_MAP[newHorizonKey];
    try {
      const updated = await updateProjection(proj.id, {
        horizonMonths: newMonths,
      });
      setProjections((prev) =>
        prev.map((p) =>
          p.id === proj.id ? { ...p, horizonMonths: updated.horizonMonths } : p,
        ),
      );
    } catch {
      showMessage("error", "Erreur lors de la mise à jour de l'horizon.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProjection(id);
      setProjections((prev) => prev.filter((p) => p.id !== id));
    } catch {
      showMessage("error", "Erreur lors de la suppression.");
    }
  };

  return (
    <AppShell>
      <div className="projections-settings">
        <div className="projections-settings__header">
          <button
            className="projections-settings__back"
            onClick={() => navigate("/")}
          >
            ← Retour
          </button>
          <h1 className="projections-settings__title">
            Projections budgétaires
          </h1>
          <p className="projections-settings__subtitle">
            Détecte automatiquement les mouvements récurrents et génère des
            estimations futures.
          </p>
        </div>

        {message && (
          <div
            className={`projections-settings__message projections-settings__message--${message.type}`}
          >
            {message.text}
          </div>
        )}

        <div className="projections-settings__compute-block">
          <label className="projections-settings__compute-label">
            Horizon de calcul
          </label>
          <div className="projections-settings__compute-row">
            <select
              className="projections-settings__select"
              value={computeHorizon}
              onChange={(e) => setComputeHorizon(e.target.value)}
            >
              {HORIZON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              className="projections-settings__btn-compute"
              onClick={handleCompute}
              disabled={computing || !activeAccountId}
            >
              {computing ? "Calcul en cours…" : "Calculer les projections"}
            </button>
          </div>
          <p className="projections-settings__compute-hint">
            L'analyse porte sur l'historique complet du compte sélectionné. Les
            projections existantes seront recalculées.
          </p>
        </div>

        <div className="projections-settings__list-section">
          <h2 className="projections-settings__list-title">
            Récurrences détectées
            {projections.length > 0 && (
              <span className="projections-settings__count">
                {projections.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="projections-settings__loading">Chargement…</div>
          ) : projections.length === 0 ? (
            <div className="projections-settings__empty">
              Aucune projection détectée. Lancez un calcul pour analyser
              l'historique du compte.
            </div>
          ) : (
            <div className="projections-settings__grid">
              {projections.map((proj) => (
                <div
                  key={proj.id}
                  className={`projections-settings__card${
                    proj.active ? "" : " projections-settings__card--inactive"
                  }`}
                >
                  <div className="projections-settings__card-header">
                    <span className="projections-settings__card-designation">
                      {proj.designation}
                    </span>
                    <button
                      className="projections-settings__btn-delete"
                      onClick={() => handleDelete(proj.id)}
                      aria-label="Supprimer cette projection"
                      title="Supprimer"
                    >
                      ✖
                    </button>
                  </div>

                  <div className="projections-settings__card-meta">
                    <span className="projections-settings__card-freq">
                      {proj.frequency === "monthly" ? "Mensuelle" : "Annuelle"}
                      {" · "}
                      {proj.frequency === "monthly"
                        ? `Jour ${proj.dayOfMonth}`
                        : `Mois ${proj.annualMonth}, jour ${proj.dayOfMonth}`}
                    </span>
                    {proj.recette > 0 &&
                      (editingAmount?.projId === proj.id ? (
                        <input
                          ref={amountInputRef}
                          className="projections-settings__amount-input projections-settings__amount-input--recette"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingAmount.value}
                          onChange={(e) =>
                            setEditingAmount((s) => ({
                              ...s,
                              value: e.target.value,
                            }))
                          }
                          onBlur={handleAmountSave}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAmountSave();
                            if (e.key === "Escape") setEditingAmount(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="projections-settings__card-amount projections-settings__card-amount--recette"
                          onClick={() => handleAmountClick(proj)}
                          title="Cliquer pour modifier"
                        >
                          +{proj.recette.toFixed(2)} €
                        </button>
                      ))}
                    {proj.depense > 0 &&
                      (editingAmount?.projId === proj.id ? (
                        <input
                          ref={amountInputRef}
                          className="projections-settings__amount-input projections-settings__amount-input--depense"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingAmount.value}
                          onChange={(e) =>
                            setEditingAmount((s) => ({
                              ...s,
                              value: e.target.value,
                            }))
                          }
                          onBlur={handleAmountSave}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAmountSave();
                            if (e.key === "Escape") setEditingAmount(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="projections-settings__card-amount projections-settings__card-amount--depense"
                          onClick={() => handleAmountClick(proj)}
                          title="Cliquer pour modifier"
                        >
                          -{proj.depense.toFixed(2)} €
                        </button>
                      ))}
                  </div>

                  <div className="projections-settings__card-controls">
                    <label className="projections-settings__toggle-label projections-settings__toggle-label--toggle-active">
                      <input
                        type="checkbox"
                        className="projections-settings__toggle-input"
                        checked={proj.active}
                        onChange={() => handleToggleActive(proj)}
                      />
                      <span>{proj.active ? "Désactiver" : "Activer"}</span>
                    </label>

                    <label
                      className={`projections-settings__toggle-label${proj.loop ? " projections-settings__toggle-label--active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="projections-settings__toggle-input"
                        checked={proj.loop ?? false}
                        onChange={() => handleToggleLoop(proj)}
                      />
                      <span>Boucler après horizon</span>
                    </label>

                    <label className="projections-settings__horizon-label">
                      Horizon individuel
                      <select
                        className="projections-settings__select projections-settings__select--sm"
                        value={horizonKeyFromMonths(proj.horizonMonths)}
                        onChange={(e) =>
                          handleHorizonChange(proj, e.target.value)
                        }
                      >
                        {HORIZON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
