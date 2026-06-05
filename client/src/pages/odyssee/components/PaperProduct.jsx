import { useMemo, useRef, useState } from "react";

import { ArrayGraduation } from "./utils/ArrayGraduation";
import ColorPicker from "../../../components/ColorPicker";
import { computeColorPalette } from "../utils/colorPalette.js";
import IconSaveFalse from "../../../assets/IconSaveFalse.jsx";
import IconSaveTrue from "../../../assets/IconSaveTrue.jsx";
import InTakeTimeAdvancedMode from "./InTakeTimeAdvancedMode";
import InTakeTimeNormalMode from "./InTakeTimeNormalMode";
import ProductService from "../services/productService";
import Range14 from "./Range14";
import RangeDays from "./RangeDays";
import { useOdysseeColor } from "../contexts/OdysseeColorContext.jsx";

function buildProductStyles(c, id) {
  return `
    [data-product="${id}"] .paper-product {
      background-color: ${c.lightness};
    }
    [data-product="${id}"] .paper-product-container-navBar {
      background-color: ${c.base};
    }
    [data-product="${id}"] .paper-product__name-input,
    [data-product="${id}"] .paper-product__alias-input {
      border-bottom-color: color-mix(in srgb, ${c.contrastBase} 40%, transparent);
      color: ${c.contrastBase};
    }
    [data-product="${id}"] .paper-product__name-input::placeholder,
    [data-product="${id}"] .paper-product__alias-input::placeholder {
      color: color-mix(in srgb, ${c.contrastBase} 45%, transparent);
    }
    [data-product="${id}"] .paper-product__name-input:focus,
    [data-product="${id}"] .paper-product__alias-input:focus {
      border-bottom-color: ${c.contrastBase};
    }
    [data-product="${id}"] .paper-product__alias-input {
      color: color-mix(in srgb, ${c.contrastBase} 75%, transparent);
    }
    [data-product="${id}"] .paper-product__color-btn {
      border-color: color-mix(in srgb, ${c.contrastBase} 30%, transparent);
    }
    [data-product="${id}"] .paper-product__color-btn:hover {
      border-color: color-mix(in srgb, ${c.contrastBase} 60%, transparent);
    }
    [data-product="${id}"] .paper-product__status--success {
      background-color: ${c.dark};
      color: ${c.lightness};
      border-left-color: ${c.base};
    }
    [data-product="${id}"] .paper-product__status--error {
      background-color: ${c.darkest};
      color: ${c.dangerLight};
      border-left-color: ${c.danger};
    }
    [data-product="${id}"] .paper-product__upload-label {
      border-color: ${c.dark};
      color: ${c.light};
    }
    [data-product="${id}"] .paper-product__upload-label:hover {
      border-color: ${c.base};
      color: ${c.lightness};
    }
    [data-product="${id}"] .paper-product__image-preview img {
      border-color: ${c.dark};
    }
    [data-product="${id}"] .paper-product__image-remove {
      background-color: ${c.darkest};
      color: ${c.lightness};
      border-color: ${c.dark};
    }
    [data-product="${id}"] .paper-product__image-remove:hover {
      background-color: ${c.danger};
    }
    [data-product="${id}"] .paper-product-container {
      color: ${c.darkest};
    }
    [data-product="${id}"] .inTakeTime-container h4 {
      border-color: ${c.darkest};
      background-color: ${c.darkest};
      color: ${c.light};
    }
    [data-product="${id}"] .title-inTakeTime-container label {
      border-color: ${c.darkest};
    }
    [data-product="${id}"] .title-inTakeTime-container input[type="checkbox"]:checked + label p:first-child {
      background-color: ${c.base};
      color: ${c.light};
    }
    [data-product="${id}"] .title-inTakeTime-container p:last-child {
      background-color: ${c.base};
      color: ${c.light};
    }
    [data-product="${id}"] .inTakeTime-moment label {
      border-color: ${c.dark};
    }
    [data-product="${id}"] .inTakeTime-moment input[type="checkbox"]:checked + label {
      background-color: ${c.base};
      color: ${c.light};
    }
    [data-product="${id}"] .inTakeTime-container_moment__label::after {
      background-color: ${c.darkest};
    }
    [data-product="${id}"] .inTakeTime-container_moment li input[type="radio"]:checked + label .inTakeTime-container_moment__label::after {
      background-color: ${c.base};
    }
    [data-product="${id}"] .custom-range input[type="range"]::-webkit-slider-runnable-track {
      background: ${c.darker};
    }
    [data-product="${id}"] .custom-range input[type="range"]::-moz-range-track {
      background: ${c.darker};
    }
    [data-product="${id}"] .custom-range input[type="range"]::-moz-range-progress {
      background-color: ${c.darker};
    }
    [data-product="${id}"] .custom-range input[type="range"]::-webkit-slider-thumb {
      background: ${c.darker};
    }
    [data-product="${id}"] .custom-range input[type="range"]::-moz-range-thumb {
      background: ${c.darker};
    }
    [data-product="${id}"] .inTakeTime-container_moment .custom-range input[type="range"]::-webkit-slider-runnable-track {
      background: ${c.darker};
    }
    [data-product="${id}"] .inTakeTime-container_moment .custom-range input[type="range"]::-webkit-slider-thumb {
      background: ${c.base};
    }
    [data-product="${id}"] .inTakeTime-container_moment .custom-range input[type="range"]::-moz-range-thumb {
      background: ${c.darker};
    }
    [data-product="${id}"] .array-graduation_text label {
      border-bottom-color: ${c.light};
    }
    [data-product="${id}"] .array-graduation_text label span {
      background-color: ${c.light};
      border-color: ${c.base};
    }
    [data-product="${id}"] .array-graduation input[type="radio"]:checked + label {
      border-bottom-color: ${c.base};
    }
  `;
}

const PaperProduct = ({
  contentFilesData,
  categoryId,
  onProductCreated,
  editMode = false,
  onActivate,
}) => {
  const productId = contentFilesData._id || null;
  const folderId = contentFilesData.folderId || null;
  const entityId = productId || "new-product";

  const [productName, setProductName] = useState(
    contentFilesData.productName || "",
  );
  const [aliasName, setAliasName] = useState(
    contentFilesData.aliasName?.name || "",
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const [duration, setDuration] = useState(contentFilesData.treatmentDuration);
  const [quantity, setQuantity] = useState(contentFilesData.amountToAdminister);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [checkedMoments, setCheckedMoments] = useState(["Matin"]);
  const [selectedTime, setSelectedTime] = useState("beforeMeal");
  const [durationBefore, setDurationBefore] = useState(10);
  const [durationAfter, setDurationAfter] = useState("");
  const [nightDuration, setNightDuration] = useState(10);
  const [saveStatus, setSaveStatus] = useState(null);
  const [color, setColor] = useState(contentFilesData.color || "");
  const [previewColor, setPreviewColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { colors: themeColors } = useOdysseeColor();
  const activeColor = previewColor || color;
  const colors = useMemo(
    () => (activeColor ? computeColorPalette(activeColor) : themeColors),
    [activeColor, themeColors],
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");

    const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo
    if (file.size > MAX_SIZE) {
      setImageError(
        `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max 2 Mo.`,
      );
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageFile(file);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    switch (time) {
      case "beforeMeal":
        setDurationBefore(10);
        setDurationAfter("");
        break;
      case "afterMeal":
        setDurationAfter(10);
        setDurationBefore("");
        break;
      default:
        setDurationBefore("");
        setDurationAfter("");
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("aliasName", aliasName);
    formData.append("treatmentDuration", duration);
    formData.append("amountToAdminister", quantity);
    formData.append(
      "intakeTime",
      JSON.stringify({
        mode: advancedMode ? "advanced" : "normal",
        checkedMoments,
        selectedTime,
        durationBefore,
        durationAfter,
        nightDuration,
      }),
    );
    formData.append("categoryId", categoryId);
    formData.append("color", color);
    if (folderId) formData.append("folderId", folderId);
    if (imageFile) formData.append("image", imageFile);

    try {
      const result =
        productId && editMode
          ? await ProductService.updateProduct(productId, formData)
          : await ProductService.createProduct(formData);

      if (result.success) {
        setSaveStatus({
          type: "success",
          message:
            productId && editMode
              ? "Produit mis à jour !"
              : "Produit sauvegardé avec succès !",
        });
        setTimeout(() => setSaveStatus(null), 3000);
        if (onProductCreated) onProductCreated(result.product);
      } else {
        setSaveStatus({ type: "error", message: "Erreur : " + result.error });
      }
    } catch {
      setSaveStatus({
        type: "error",
        message: "Erreur de connexion au serveur",
      });
    }
  };

  const readOnly = !!productId && !editMode;

  return (
    <>
      <style>{buildProductStyles(colors, entityId)}</style>
      <form
        className="paper-product"
        data-product={entityId}
        onSubmit={handleSubmit}
        method="POST"
      >
        <div className="paper-product-container-navBar">
          <div className="paper-product-container-navBar_titleProduct">
            <input
              type="text"
              className="paper-product__name-input"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Nom du produit"
              maxLength={60}
              readOnly={readOnly}
            />
            <input
              type="text"
              className="paper-product__alias-input"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              placeholder="Alias"
              maxLength={40}
              readOnly={readOnly}
            />
          </div>

          <div className="paper-product__color-wrap">
            <div className="paper-product__save-wrap">
              {readOnly ? (
                <div className="paper-product__save-btn" onClick={onActivate}>
                  <IconSaveFalse color={colors.contrastBase} />
                </div>
              ) : (
                <button type="submit" className="paper-product__save-btn">
                  <IconSaveTrue color={colors.contrastBase} />
                </button>
              )}
              <span className="save-tooltip">
                {readOnly ? "Activer l'édition" : "Enregistrer l'article"}
              </span>
            </div>
            <div
              className="paper-product__color-btn"
              style={{ background: colors.base }}
              onClick={() => !readOnly && setShowColorPicker((v) => !v)}
              title="Couleur du produit"
            />
            {showColorPicker && (
              <div className="paper-product__color-picker-wrap">
                <ColorPicker
                  value={color || themeColors.base}
                  onChange={(hex) => setColor(hex)}
                  onPreview={(hex) => setPreviewColor(hex)}
                  onClose={() => {
                    setShowColorPicker(false);
                    setPreviewColor(null);
                  }}
                  contextKey={`catalog-product-${productId || "new"}`}
                  showHistory
                  showDefaultButtons={!!productId}
                />
              </div>
            )}
          </div>
        </div>

        {saveStatus && (
          <div
            className={`paper-product__status paper-product__status--${saveStatus.type}`}
          >
            {saveStatus.message}
          </div>
        )}

        <div className="paper-product-container" inert={readOnly || undefined}>
          <div className="bloc">
            <div className="paper-product__upload-zone">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="paper-product__file-input"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="paper-product__image-preview">
                  <img src={imagePreview} alt="Aperçu" />
                  <button
                    type="button"
                    className="paper-product__image-remove"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className="paper-product__upload-label"
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Ajouter une image
                </div>
              )}
              {imageError && (
                <p className="paper-product__image-error">{imageError}</p>
              )}
            </div>

            <ul className="paper-product-bloc-img">
              {contentFilesData.img.map((item, index) => (
                <li
                  className="paper-product-li_img"
                  key={"img" + item.alt + index}
                >
                  <img src={item.adress} alt={item.alt} />
                </li>
              ))}
            </ul>

            <div>
              <h3>Durée du traitement</h3>
              <div className="custom-range">
                <RangeDays value={duration} onChange={setDuration} />
              </div>
            </div>

            <div>
              <h3>Quantité à administrer</h3>
              <div className="custom-range">
                <Range14 value={quantity} onChange={setQuantity} />
              </div>
              <ul className="array-graduation">
                {ArrayGraduation.map((category, index) => {
                  return (
                    <li key={"grad" + category.abbreviatedGraduation + index}>
                      <h4> {category.title} </h4>
                      <ul>
                        {category.categoryGraduation.map((item, index) => {
                          return (
                            <div key={"cat" + item.graduation + index}>
                              <li className="array-graduation_text">
                                <input
                                  className="input-dysplay-none"
                                  type="radio"
                                  name="graduation"
                                  id={item.abbreviatedGraduation}
                                />
                                <label htmlFor={item.abbreviatedGraduation}>
                                  {item.abbreviatedGraduation}
                                  <span> {item.graduation} </span>
                                </label>
                              </li>
                            </div>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="bloc">
            <div className="inTakeTime-container">
              <div className="title-inTakeTime-container">
                <h3>Moment de prise</h3>
                <div className="btn-advancedMode-toggle">
                  <p>Mode avancé</p>
                  <input
                    className="input-dysplay-none"
                    type="checkbox"
                    name="toggleOnOff"
                    id="toggleOnOff"
                    checked={advancedMode}
                    onChange={(e) => setAdvancedMode(e.target.checked)}
                  />
                  <label htmlFor="toggleOnOff">
                    <p>On</p>
                    <p>Off</p>
                  </label>
                </div>
              </div>

              {advancedMode ? (
                <InTakeTimeAdvancedMode />
              ) : (
                <InTakeTimeNormalMode
                  checkedMoments={checkedMoments}
                  selectedTime={selectedTime}
                  durationBefore={durationBefore}
                  durationAfter={durationAfter}
                  onMomentChange={setCheckedMoments}
                  onTimeChange={handleTimeChange}
                  onBeforeChange={setDurationBefore}
                  onAfterChange={setDurationAfter}
                  nightDuration={nightDuration}
                  onNightDurationChange={setNightDuration}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default PaperProduct;
