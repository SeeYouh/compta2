const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const getDaysRemaining = (deletedAt) => {
  const expiry = new Date(deletedAt).getTime() + THIRTY_DAYS_MS;
  const remaining = Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
};

const TrashCard = ({ item, type, products = [], onRestore, onDelete }) => {
  const daysLeft = getDaysRemaining(item.deletedAt);
  const categoryName = item.categoryId?.name || "";

  return (
    <div className="trash-card">
      <div className="trash-card__expiry">
        {daysLeft === 0
          ? "Suppression imminente"
          : `${daysLeft}j restant${daysLeft > 1 ? "s" : ""}`}
      </div>

      {type === "product" ? (
        <div className="trash-card__preview">
          {item.img?.[0] ? (
            <img src={item.img[0]} alt={item.name} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.3"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M3 16l5-5 4 4 3-3 6 6" />
            </svg>
          )}
        </div>
      ) : (
        <div
          className="trash-card__folder-preview"
          style={{ background: `${item.color}22` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill={item.color || "#969696"}
          >
            <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
          </svg>
        </div>
      )}

      <div className="trash-card__name">
        {item.name ||
          (type === "product"
            ? item.contentFilesData?.productName
            : "Sans nom") ||
          "Sans nom"}
      </div>

      {categoryName && (
        <div className="trash-card__category">{categoryName}</div>
      )}

      {type === "folder" && products.length > 0 && (
        <div className="trash-card__product-count">
          {products.length} produit{products.length > 1 ? "s" : ""}
        </div>
      )}

      <div className="trash-card__actions">
        <button
          className="trash-card__btn trash-card__btn--restore"
          onClick={onRestore}
        >
          Restaurer
        </button>
        <button
          className="trash-card__btn trash-card__btn--delete"
          onClick={onDelete}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default TrashCard;
