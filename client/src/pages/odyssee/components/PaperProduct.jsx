import { useRef, useState } from "react";

import { ArrayGraduation } from "./utils/ArrayGraduation";
import InTakeTimeAdvancedMode from "./InTakeTimeAdvancedMode";
import InTakeTimeNormalMode from "./InTakeTimeNormalMode";
import ProductService from "../services/productService";
import Range14 from "./Range14";
import RangeDays from "./RangeDays";

const PaperProduct = ({
  contentFilesData,
  categoryId,
  onProductCreated,
  editMode = false,
}) => {
  const productId = contentFilesData._id || null;
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
        if (onProductCreated) onProductCreated();
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
    <form className="paper-product" onSubmit={handleSubmit} method="POST">
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
        {!readOnly && (
          <input
            type="submit"
            value={editMode ? "Mettre à jour" : "Enregistrer"}
          />
        )}
      </div>

      {saveStatus && (
        <div
          className={`paper-product__status paper-product__status--${saveStatus.type}`}
        >
          {saveStatus.message}
        </div>
      )}

      <div className="paper-product-container">
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
  );
};

export default PaperProduct;
