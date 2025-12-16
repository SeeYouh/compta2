import { useEffect, useRef, useState } from "react";

import AmountInput from "./AmountInput";
import { APP_LABELS } from "./utils";
import FormatCurrency from "./utils/FormatCurrency";
import PaymentSelector from "./PaymentSelector";
import ThemeSelectorDropdown from "./ThemeSelectorDropdown";

// Composant pour afficher le thème avec hover sur le sous-thème
const ThemeDisplay = ({ theme, subTheme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTruncated, setIsTruncated] = useState(false);
  const subThemeRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (subThemeRef.current) {
        const isTrunc =
          subThemeRef.current.scrollWidth > subThemeRef.current.clientWidth;
        setIsTruncated(isTrunc);
        console.log("Truncation check:", {
          scrollWidth: subThemeRef.current.scrollWidth,
          clientWidth: subThemeRef.current.clientWidth,
          isTruncated: isTrunc,
          subTheme,
        });
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [subTheme]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="theme-display">
      <div className="theme-main">{theme}</div>
      <div
        ref={subThemeRef}
        className="theme-sub"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {subTheme}
        {isHovered && isTruncated && (
          <div
            className="theme-sub-tooltip"
            style={{
              left: `${mousePosition.x + 40}px`,
              top: `${mousePosition.y + 20}px`,
            }}
          >
            {subTheme}
          </div>
        )}
      </div>
    </div>
  );
};

// Helpers simples pour gérer la date <input type="date"> (ISO) ↔ affichage FR
const isoToFr = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};
const frToIso = (fr) => {
  if (!fr) return "";
  const [d, m, y] = fr.split("/");
  if (!d || !m || !y) return fr;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

const TransactionsTable = ({
  transactions,
  headers,
  onHover,
  onDelete,
  onUpdate,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const startEdit = (t) => {
    setEditingId(t.id);
    setDraft({
      // on conserve l'affichage FR en base, mais l'input "date" manipule l'ISO
      dateISO: frToIso(t.date || ""),
      themeId: t.themeId || "",
      subThemeId: t.subThemeId || "",
      payment: t.payment || "",
      designation: t.designation || "",
      recette: t.recette ?? "",
      depense: t.depense ?? "",
      disabled: t.disabled ?? false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const setField = (field, value) => {
    setDraft((d) => {
      const next = { ...d, [field]: value };
      if (field === "recette" && value !== "" && value !== null)
        next.depense = "";
      if (field === "depense" && value !== "" && value !== null)
        next.recette = "";
      return next;
    });
  };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    const patch = {
      date: isoToFr(draft.dateISO || ""),
      themeId: draft.themeId,
      subThemeId: draft.subThemeId,
      payment: draft.payment,
      designation: draft.designation,
      recette: draft.recette === "" ? null : Number(draft.recette),
      depense: draft.depense === "" ? null : Number(draft.depense),
      disabled: draft.disabled ?? false,
    };
    await onUpdate?.(editingId, patch);
    cancelEdit();
  };

  const toggleDisabled = async (transaction) => {
    const newDisabled = !transaction.disabled;
    await onUpdate?.(transaction.id, { disabled: newDisabled });
  };

  // Regrouper les transactions par date

  // Regrouper les transactions par date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Obtenir les dates triées (les transactions sont déjà triées)
  const sortedDates = Object.keys(groupedTransactions);

  return (
    <div className="table-container">
      <div className="table-grid">
        <div className="table-header">
          {headers.map((item, index) => (
            <div key={index} className="table-cell header">
              {item}
            </div>
          ))}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="table-grid">
          <div className="table-row no-data">
            <div
              className="table-cell"
              style={{
                gridColumn: `1 / span ${headers.length}`,
                textAlign: "center",
              }}
            >
              {APP_LABELS.noTransactions}
            </div>
          </div>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="date-group">
            {/* En-tête de date */}
            <div className="date-header">
              <div className="date-label">{date}</div>
            </div>

            {/* Grille pour les transactions de cette date */}
            <div className="table-grid">
              {/* Transactions pour cette date */}
              {groupedTransactions[date].map((t) => {
                const isEditing = editingId === t.id;
                const isDisabled = t.disabled === true;
                return (
                  <div
                    key={t.id}
                    className={`table-row-wrapper${
                      isEditing ? " editing" : ""
                    }${isDisabled ? " disabled" : ""}`}
                    onMouseEnter={() => onHover?.(t.id)}
                    onMouseLeave={() => onHover?.(null)}
                  >
                    <div className="table-row">
                      {/* Thème / Sous-thème - composant du formulaire */}
                      <div className="table-cell">
                        {isEditing ? (
                          <ThemeSelectorDropdown
                            value={{
                              theme: draft.themeId,
                              subTheme: draft.subThemeId,
                            }}
                            onChange={({ theme, subTheme }) => {
                              setField("themeId", theme);
                              setField("subThemeId", subTheme);
                            }}
                          />
                        ) : (
                          <ThemeDisplay theme={t.theme} subTheme={t.subTheme} />
                        )}
                      </div>

                      {/* Moyen de paiement - composant du formulaire */}
                      <div className="table-cell">
                        {isEditing ? (
                          <PaymentSelector
                            value={draft.payment}
                            onChange={(payment) => setField("payment", payment)}
                          />
                        ) : (
                          t.payment
                        )}
                      </div>

                      {/* Désignation */}
                      <div className="table-cell">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.designation}
                            onChange={(e) =>
                              setField("designation", e.target.value)
                            }
                            aria-label={APP_LABELS.ariaDesignation}
                          />
                        ) : (
                          t.designation
                        )}
                      </div>

                      {/* Recette */}
                      <div className="table-cell moneyFormat">
                        {isEditing ? (
                          <AmountInput
                            value={draft.recette}
                            onChange={(val) => setField("recette", val)}
                          />
                        ) : t.recette ? (
                          FormatCurrency(t.recette)
                        ) : (
                          ""
                        )}
                      </div>

                      {/* Dépense */}
                      <div className="table-cell moneyFormat">
                        {isEditing ? (
                          <AmountInput
                            value={draft.depense}
                            onChange={(val) => setField("depense", val)}
                          />
                        ) : t.depense ? (
                          FormatCurrency(t.depense)
                        ) : (
                          ""
                        )}
                      </div>

                      {/* Solde (affichage) */}
                      <div className="table-cell moneyFormat">
                        {FormatCurrency(t.solde)}
                      </div>

                      {/* Actions */}
                      <div className="table-cell actions-cell">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn save"
                              onClick={saveEdit}
                              aria-label={APP_LABELS.ariaSave}
                            >
                              💾
                            </button>
                            <button
                              type="button"
                              className="btn cancel"
                              onClick={cancelEdit}
                              aria-label={APP_LABELS.ariaCancel}
                            >
                              ↩
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="checkbox"
                              className="checkbox-action"
                              checked={!isDisabled}
                              onChange={() => toggleDisabled(t)}
                              aria-label={
                                isDisabled
                                  ? APP_LABELS.ariaEnableTransaction
                                  : APP_LABELS.ariaDisableTransaction
                              }
                              title={
                                isDisabled
                                  ? "Activer (inclure dans les calculs)"
                                  : "Désactiver (exclure des calculs)"
                              }
                            />
                            <button
                              type="button"
                              className="btn edit"
                              onClick={() => startEdit(t)}
                              aria-label={APP_LABELS.ariaEdit}
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              className="btn delete"
                              onClick={() => onDelete(t.id)}
                              aria-label={APP_LABELS.ariaDelete}
                            >
                              ✖
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionsTable;
