import { useState } from 'react';

import IconPicture from '../assets/IconPicture';

const ProductCard = ({ product, onClick, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = product.img?.[0] && !imgError;

  return (
    <div
      className="catalog-card"
      onClick={onClick}
      title={product.name || product.contentFilesData?.productName || "Produit"}
    >
      <div className="catalog-card__image">
        {hasImage ? (
          <img
            src={product.img[0]}
            alt={product.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <IconPicture size={40} />
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
};

export default ProductCard;
