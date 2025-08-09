import { useState } from "react";

import AmountInput from "./AmountInput";
import FormatCurrency from "./utils/FormatCurrency";
import PaymentSelector from "./PaymentSelector";
import ThemeSelector from "./ThemeSelector";

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
      theme: t.theme || "",
      subTheme: t.subTheme || "",
      payment: t.payment || "",
      designation: t.designation || "",
      recette: t.recette ?? "",
      depense: t.depense ?? "",
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
      theme: draft.theme,
      subTheme: draft.subTheme,
      payment: draft.payment,
      designation: draft.designation,
      recette: draft.recette === "" ? null : Number(draft.recette),
      depense: draft.depense === "" ? null : Number(draft.depense),
    };
    await onUpdate?.(editingId, patch);
    cancelEdit();
  };

  return (
    <div className="table-grid">
      <div className="table-header">
        {headers.map((item, index) => (
          <div key={index} className="table-cell header">
            {item}
          </div>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="table-row no-data">
          <div
            className="table-cell"
            style={{
              gridColumn: `1 / span ${headers.length}`,
              textAlign: "center",
            }}
          >
            Aucune action bancaire pour ce mois.
          </div>
        </div>
      ) : (
        transactions.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <div
              key={t.id}
              className={`table-row${isEditing ? " editing" : ""}`}
              onMouseEnter={() => onHover?.(t.id)}
              onMouseLeave={() => onHover?.(null)}
            >
              {/* Date - même input que le formulaire (type="date") */}
              <div className="table-cell">
                {isEditing ? (
                  <input
                    type="date"
                    value={draft.dateISO || ""}
                    onChange={(e) => setField("dateISO", e.target.value)}
                    aria-label="Date"
                  />
                ) : (
                  t.date
                )}
              </div>

              {/* Thème / Sous-thème - composant du formulaire */}
              <div className="table-cell">
                {isEditing ? (
                  <ThemeSelector
                    value={{ theme: draft.theme, subTheme: draft.subTheme }}
                    onChange={({ theme, subTheme }) => {
                      setField("theme", theme);
                      setField("subTheme", subTheme);
                    }}
                  />
                ) : (
                  <>
                    {t.theme} : {t.subTheme}
                  </>
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
                    onChange={(e) => setField("designation", e.target.value)}
                    aria-label="Désignation"
                  />
                ) : (
                  t.designation
                )}
              </div>

              {/* Recette */}
              <div className="table-cell">
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
              <div className="table-cell">
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
              <div className="table-cell">{FormatCurrency(t.solde)}</div>

              {/* Actions */}
              <div className="table-cell">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="btn save"
                      onClick={saveEdit}
                      aria-label="Enregistrer"
                    >
                      💾
                    </button>
                    <button
                      type="button"
                      className="btn cancel"
                      onClick={cancelEdit}
                      aria-label="Annuler"
                    >
                      ↩
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn edit"
                      onClick={() => startEdit(t)}
                      aria-label="Modifier"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn delete"
                      onClick={() => onDelete(t.id)}
                      aria-label="Supprimer"
                    >
                      ✖
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransactionsTable;
