import FormatCurrency from "./utils/FormatCurrency";

const TransactionsTable = ({ transactions, headers, onHover, onDelete }) => {
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
        transactions.map((t) => (
          <div
            key={t.id}
            className="table-row"
            onMouseEnter={() => onHover(t.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="table-cell">{t.date}</div>
            <div className="table-cell">
              {t.theme} : {t.subTheme}
            </div>
            <div className="table-cell">{t.payment}</div>
            <div className="table-cell">{t.designation}</div>
            <div className="table-cell">
              {t.recette ? FormatCurrency(t.recette) : ""}
            </div>
            <div className="table-cell">
              {t.depense ? FormatCurrency(t.depense) : ""}
            </div>
            <div className="table-cell">{FormatCurrency(t.solde)}</div>
            <div className="table-cell actions" onClick={() => onDelete(t.id)}>
              ✖
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionsTable;
