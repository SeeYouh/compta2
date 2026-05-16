import { useRef, useState } from "react";

const MAX_DIM = 256;

const CategoryForm = ({ onSubmit, onCancel }) => {
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  if (!onSubmit) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width > MAX_DIM || img.height > MAX_DIM) {
        setImageError(
          `L'image doit faire au maximum ${MAX_DIM}×${MAX_DIM} px (reçu : ${img.width}×${img.height} px).`,
        );
        setImageFile(null);
        setImagePreview(null);
        e.target.value = "";
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setImageError("Fichier image invalide.");
      e.target.value = "";
    };

    img.src = objectUrl;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim() || imageError) return;
    onSubmit({ name: categoryName.trim(), imageFile });
    setCategoryName("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="cat-form-overlay">
      <div className="cat-form">
        <h3 className="cat-form__title">Nouvelle catégorie</h3>

        <form onSubmit={handleSubmit}>
          {/* Nom */}
          <div className="cat-form__field">
            <label className="cat-form__label" htmlFor="cat-name">
              Nom <span className="cat-form__hint">(15 caractères max)</span>
            </label>
            <input
              id="cat-name"
              className="cat-form__input"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value.slice(0, 30))}
              placeholder="Nom de la catégorie"
              maxLength={30}
              autoFocus
            />
            <span className="cat-form__counter">{categoryName.length}/30</span>
          </div>

          {/* Image */}
          <div className="cat-form__field">
            <label className="cat-form__label">
              Image{" "}
              <span className="cat-form__hint">
                (optionnel, max 256×256 px)
              </span>
            </label>

            {imagePreview ? (
              <div className="cat-form__preview">
                <img src={imagePreview} alt="Aperçu" />
                <button
                  type="button"
                  className="cat-form__remove-img"
                  onClick={handleRemoveImage}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="cat-form__upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                + Choisir une image
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {imageError && <p className="cat-form__error">{imageError}</p>}
          </div>

          {/* Actions */}
          <div className="cat-form__actions">
            <button
              type="button"
              className="cat-form__btn cat-form__btn--cancel"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="cat-form__btn cat-form__btn--submit"
              disabled={!categoryName.trim() || !!imageError}
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
