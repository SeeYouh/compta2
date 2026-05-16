import ProductCard from "./ProductCard";

const CatalogMain = ({ selectedCat, onAdd, onSelect, onEdit, onDelete }) => {
  const currentProducts = selectedCat?.products || [];

  return (
    <div className="catalog-main">
      <div className="catalog-main__header">
        <h4>{selectedCat ? selectedCat.name : "Sélectionnez une librairie"}</h4>
        <div className="catalog-main__meta">
          {selectedCat && (
            <div
              className="catalog-main__add"
              title="Nouveau produit"
              onClick={onAdd}
            >
              +
            </div>
          )}
        </div>
      </div>

      {currentProducts.length === 0 ? (
        <div className="catalog-empty">
          <div className="catalog-empty__icon">📦</div>
          <div className="catalog-empty__title">
            Aucun produit dans cette librairie
          </div>
          <div className="catalog-empty__hint">
            Cliquez sur le bouton + pour créer votre premier produit
          </div>
        </div>
      ) : (
        <div className="catalog-grid">
          {currentProducts.map((product, i) => (
            <ProductCard
              key={i}
              product={product}
              onClick={() => onSelect(product)}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogMain;
