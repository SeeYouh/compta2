const CategorySettings = ({ category, onClose }) => {
  return (
    <div className="category-settings">
      <div className="category-settings__header">
        <h4>{category.name}</h4>
        <button
          className="category-settings__close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      <div className="category-settings__body">
        {/* Paramètres à implémenter */}
      </div>
    </div>
  );
};

export default CategorySettings;
