const ProductCard = ({ product, onClick, onEdit, onDelete }) => (
  <div className="catalog-card" onClick={onClick}>
    <div className="catalog-card__image">
      {product.img?.[0] ? (
        <img
          src={product.img[0]}
          alt={product.name}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = "📦";
          }}
        />
      ) : (
        "📦"
      )}
    </div>
    <div className="catalog-card__info">
      <h5 className="catalog-card__name">
        {product.name || product.contentFilesData?.productName || "Produit"}
      </h5>
      {product.tooltips && (
        <p className="catalog-card__tooltip">{product.tooltips}</p>
      )}
    </div>
    <div className="catalog-card__toolbar">
      <button
        type="button"
        className="catalog-card__toolbar-btn catalog-card__toolbar-btn--edit"
        title="Modifier"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        ✏️
      </button>
      <button
        type="button"
        className="catalog-card__toolbar-btn catalog-card__toolbar-btn--delete"
        title="Supprimer"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        🗑️
      </button>
    </div>
  </div>
);

export default ProductCard;
