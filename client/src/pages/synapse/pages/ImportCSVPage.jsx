import "./ImportCSVPage.scss";

import { useCallback, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import {
  confirmImport,
  parseCSV,
  previewCSV,
  saveMapping,
} from "../services/importApi";
import Loader from "../../../components/Loader";
import PaymentSelector from "../components/PaymentSelector";
import UserMenu from "../../../components/UserMenu";
import ThemeSelectorDropdown from "../components/ThemeSelectorDropdown";
import { useAccounts } from "../contexts/useAccounts";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const STEPS = ["Fichier", "Mapping", "Vérification"];

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function StepIndicator({ current }) {
  return (
    <div className="import-csv__steps" role="navigation" aria-label="Étapes">
      {STEPS.map((label, idx) => (
        <div
          key={label}
          className={[
            "import-csv__step",
            idx < current && "import-csv__step--done",
            idx === current && "import-csv__step--active",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="import-csv__step-dot">
            {idx < current ? "✓" : idx + 1}
          </span>
          <span className="import-csv__step-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function ImportCSVPage() {
  const navigate = useNavigate();
  const { accounts, activeAccountId } = useAccounts();

  // Wizard state
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Étape 1 — fichier
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState(null); // { separator, headers, preview, savedMapping }
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Étape 2 — mapping
  const [selectedAccountId, setSelectedAccountId] = useState(
    activeAccountId || "",
  );
  const [colDate, setColDate] = useState("");
  const [colDesignation, setColDesignation] = useState("");
  const [montantType, setMontantType] = useState("single");
  const [colMontant, setColMontant] = useState("");
  const [colDebit, setColDebit] = useState("");
  const [colCredit, setColCredit] = useState("");
  const [rememberMapping, setRememberMapping] = useState(false);

  // Étape 3 — lignes à importer
  const [rows, setRows] = useState([]); // tableau enrichi
  const [importSuccess, setImportSuccess] = useState(null);

  // ---------------------------------------------------------------------------
  // Étape 1 : Upload
  // ---------------------------------------------------------------------------

  const applyFile = useCallback(async (f) => {
    if (!f || !f.name.endsWith(".csv")) {
      setError("Veuillez choisir un fichier CSV.");
      return;
    }
    setFile(f);
    setError(null);
    setLoading(true);
    try {
      const result = await parseCSV(f);
      setParseResult(result);

      // Pré-remplir le mapping depuis la sauvegarde si elle existe
      if (result.savedMapping) {
        const m = result.savedMapping;
        setColDate(m.colDate || "");
        setColDesignation(m.colDesignation || "");
        setMontantType(m.montantType || "single");
        setColMontant(m.colMontant || "");
        setColDebit(m.colDebit || "");
        setColCredit(m.colCredit || "");
        setRememberMapping(true);
      }

      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove("import-csv__dropzone--over");
    const f = e.dataTransfer.files?.[0];
    if (f) applyFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add("import-csv__dropzone--over");
  };

  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove("import-csv__dropzone--over");
  };

  // ---------------------------------------------------------------------------
  // Étape 2 : Mapping
  // ---------------------------------------------------------------------------

  const mappingIsValid = () => {
    if (!colDate || !colDesignation) return false;
    if (montantType === "single" && !colMontant) return false;
    if (montantType === "double" && (!colDebit || !colCredit)) return false;
    if (!selectedAccountId) return false;
    return true;
  };

  const handlePreview = async () => {
    if (!mappingIsValid()) {
      setError(
        "Veuillez remplir tous les champs de mapping et sélectionner un compte.",
      );
      return;
    }

    const mapping = {
      colDate,
      colDesignation,
      montantType,
      colMontant,
      colDebit,
      colCredit,
    };

    setError(null);
    setLoading(true);
    try {
      if (rememberMapping) {
        await saveMapping({
          separator: parseResult.separator,
          ...mapping,
        });
      }

      const { rows: previewRows } = await previewCSV(
        file,
        mapping,
        selectedAccountId,
      );
      setRows(previewRows);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Étape 3 : Vérification & import
  // ---------------------------------------------------------------------------

  const toggleExcluded = (idx) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, excluded: !r.excluded } : r)),
    );
  };

  const updateRow = (idx, patch) => {
    const isThemeChange =
      patch.themeId !== undefined || patch.subThemeId !== undefined;

    setRows((prev) => {
      const designation = prev[idx].designation;
      return prev.map((r, i) => {
        if (i === idx) return { ...r, ...patch };
        // Propagation thème/sous-thème aux lignes avec la même désignation
        if (isThemeChange && r.designation === designation && !r.excluded) {
          const propagated = {};
          if (patch.themeId !== undefined) propagated.themeId = patch.themeId;
          if (patch.subThemeId !== undefined)
            propagated.subThemeId = patch.subThemeId;
          return { ...r, ...propagated };
        }
        return r;
      });
    });
  };

  const toImport = rows.filter((r) => !r.excluded);

  const handleConfirm = async () => {
    if (toImport.length === 0) {
      setError(
        "Aucun mouvement à importer. Réactivez des lignes ou vérifiez votre fichier.",
      );
      return;
    }

    const hasIncomplete = toImport.some(
      (r) => !r.themeId || !r.subThemeId || !r.payment,
    );
    if (hasIncomplete) {
      setError(
        "Certains mouvements n'ont pas de thème ou de moyen de paiement. Complétez-les avant d'importer.",
      );
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { imported } = await confirmImport(toImport, selectedAccountId);
      setImportSuccess(imported);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  const { headers = [], preview = [] } = parseResult || {};

  const headerRight = (
    <UserMenu
      menuItems={[
        { label: "Paramètres", onClick: () => navigate("/synapse/settings") },
      ]}
    />
  );

  if (importSuccess !== null) {
    return (
      <AppShell headerRight={headerRight}>
        <div className="import-csv">
          <div className="import-csv__success">
            <p className="import-csv__success-text">
              {importSuccess} mouvement{importSuccess > 1 ? "s" : ""} importé
              {importSuccess > 1 ? "s" : ""} avec succès.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate("/synapse")}
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell headerRight={headerRight}>
      <div className="import-csv">
        <StepIndicator current={step} />

        {error && (
          <p className="import-csv__error" role="alert">
            {error}
          </p>
        )}

        {loading && (
          <Loader text="Traitement en cours…" className="import-csv__loader" />
        )}

        {/* ---- Étape 1 : Upload ---- */}
        {step === 0 && !loading && (
          <div className="import-csv__panel">
            <h2 className="import-csv__title">Choisir un fichier CSV</h2>
            <div
              ref={dropZoneRef}
              className="import-csv__dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Zone de dépôt de fichier CSV"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
            >
              <span className="import-csv__dropzone-icon">📂</span>
              <span>Glissez un fichier ici ou cliquez pour parcourir</span>
              {file && (
                <span className="import-csv__filename">{file.name}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="import-csv__file-input"
              onChange={handleFileInput}
            />
            <div className="import-csv__actions">
              <button
                className="btn-secondary"
                onClick={() => navigate("/synapse")}
              >
                ← Retour
              </button>
            </div>
          </div>
        )}

        {/* ---- Étape 2 : Mapping ---- */}
        {step === 1 && !loading && (
          <div className="import-csv__panel">
            <h2 className="import-csv__title">Associer les colonnes</h2>
            <p className="import-csv__subtitle">
              Fichier : <strong>{file?.name}</strong> · Séparateur détecté :{" "}
              <code>
                {parseResult?.separator === "\t"
                  ? "Tab"
                  : parseResult?.separator}
              </code>
            </p>

            <div className="import-csv__mapping">
              <ColSelect
                label="Colonne Date"
                value={colDate}
                onChange={setColDate}
                headers={headers}
                required
              />
              <ColSelect
                label="Colonne Désignation"
                value={colDesignation}
                onChange={setColDesignation}
                headers={headers}
                required
              />

              <div className="import-csv__field">
                <label className="import-csv__label">Type de montant</label>
                <select
                  className="import-csv__select"
                  value={montantType}
                  onChange={(e) => setMontantType(e.target.value)}
                >
                  <option value="single">Une colonne (montant signé)</option>
                  <option value="double">Deux colonnes (débit + crédit)</option>
                </select>
              </div>

              {montantType === "single" ? (
                <ColSelect
                  label="Colonne Montant"
                  value={colMontant}
                  onChange={setColMontant}
                  headers={headers}
                  required
                />
              ) : (
                <>
                  <ColSelect
                    label="Colonne Débit"
                    value={colDebit}
                    onChange={setColDebit}
                    headers={headers}
                    required
                  />
                  <ColSelect
                    label="Colonne Crédit"
                    value={colCredit}
                    onChange={setColCredit}
                    headers={headers}
                    required
                  />
                </>
              )}

              {/* Sélection du compte */}
              <div className="import-csv__field">
                <label className="import-csv__label">Compte cible</label>
                <select
                  className="import-csv__select"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  <option value="">— Choisir un compte —</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mémoriser */}
              <label className="import-csv__checkbox">
                <input
                  type="checkbox"
                  checked={rememberMapping}
                  onChange={(e) => setRememberMapping(e.target.checked)}
                />
                Mémoriser ce mapping pour les prochains imports
              </label>
            </div>

            {/* Aperçu brut */}
            {preview.length > 0 && (
              <div className="import-csv__preview-section">
                <h3 className="import-csv__subtitle">
                  Aperçu (5 premières lignes)
                </h3>
                <div className="import-csv__table-wrapper">
                  <table className="import-csv__table">
                    <thead>
                      <tr>
                        {headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {headers.map((h) => (
                            <td key={h}>{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="import-csv__actions">
              <button className="btn-secondary" onClick={() => setStep(0)}>
                Retour
              </button>
              <button className="btn-primary" onClick={handlePreview}>
                Analyser le fichier
              </button>
            </div>
          </div>
        )}

        {/* ---- Étape 3 : Vérification ---- */}
        {step === 2 && !loading && (
          <div className="import-csv__panel">
            <h2 className="import-csv__title">Vérification des mouvements</h2>
            <p className="import-csv__subtitle">
              {toImport.length} mouvement{toImport.length > 1 ? "s" : ""} à
              importer sur {rows.length} lignes.
              {rows.filter((r) => r.status === "duplicate").length > 0 && (
                <>
                  {" "}
                  · {rows.filter((r) => r.status === "duplicate").length}{" "}
                  doublon
                  {rows.filter((r) => r.status === "duplicate").length > 1
                    ? "s"
                    : ""}{" "}
                  détecté
                  {rows.filter((r) => r.status === "duplicate").length > 1
                    ? "s"
                    : ""}
                  .
                </>
              )}
            </p>

            <div className="import-csv__table-wrapper">
              <table className="import-csv__table import-csv__table--review">
                <thead>
                  <tr>
                    <th
                      className="import-csv__col-check"
                      aria-label="Inclure"
                    ></th>
                    <th>Date</th>
                    <th>Désignation</th>
                    <th>Recette</th>
                    <th>Dépense</th>
                    <th>Thème</th>
                    <th>Paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={[
                        row.excluded && "import-csv__row--excluded",
                        row.status === "duplicate" &&
                          "import-csv__row--duplicate",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="import-csv__col-check">
                        <input
                          type="checkbox"
                          checked={!row.excluded}
                          onChange={() => toggleExcluded(idx)}
                          aria-label={`Inclure la ligne ${idx + 1}`}
                        />
                      </td>
                      <td>{row.date}</td>
                      <td className="import-csv__col-designation">
                        {row.designation}
                      </td>
                      <td className="import-csv__col-amount">
                        {row.recette != null
                          ? `+${row.recette.toFixed(2)} €`
                          : ""}
                      </td>
                      <td className="import-csv__col-amount">
                        {row.depense != null
                          ? `-${row.depense.toFixed(2)} €`
                          : ""}
                      </td>
                      <td className="import-csv__col-theme">
                        {!row.excluded ? (
                          <ThemeSelectorDropdown
                            value={{
                              theme: row.themeId || "",
                              subTheme: row.subThemeId || "",
                            }}
                            onChange={({ theme, subTheme }) =>
                              updateRow(idx, {
                                themeId: theme,
                                subThemeId: subTheme,
                              })
                            }
                          />
                        ) : (
                          <span className="import-csv__excluded-label">—</span>
                        )}
                      </td>
                      <td className="import-csv__col-payment">
                        {!row.excluded ? (
                          <PaymentSelector
                            value={row.payment || ""}
                            onChange={(p) => updateRow(idx, { payment: p })}
                          />
                        ) : (
                          <span className="import-csv__excluded-label">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="import-csv__actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Retour
              </button>
              <button className="btn-primary" onClick={handleConfirm}>
                Importer {toImport.length} mouvement
                {toImport.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// ColSelect — dropdown pour mapper une colonne CSV
// ---------------------------------------------------------------------------

function ColSelect({ label, value, onChange, headers, required }) {
  return (
    <div className="import-csv__field">
      <label className="import-csv__label">
        {label}
        {required && <span className="import-csv__required">*</span>}
      </label>
      <select
        className="import-csv__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">— Choisir une colonne —</option>
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}
