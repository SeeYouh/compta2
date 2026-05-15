import { useState } from "react";

import InTakeTimeNormalMode from "./InTakeTimeNormalMode";
import OdysseeProductService from "../../services/odysseeProductService";
import RangeDays from "./RangeDays";

const PaperProduct = ({ contentFilesData, folder = "dossier1", onSaved }) => {
  const [duration, setDuration] = useState(
    contentFilesData.treatmentDuration ?? 7,
  );
  const [quantity, setQuantity] = useState(
    contentFilesData.amountToAdminister ?? 1,
  );
  const [checkedMoments, setCheckedMoments] = useState(
    contentFilesData.intakeTime?.checkedMoments?.length > 0
      ? contentFilesData.intakeTime.checkedMoments
      : ["Matin"],
  );
  const [selectedTime, setSelectedTime] = useState(
    contentFilesData.intakeTime?.selectedTime || "beforeMeal",
  );
  const [durationBefore, setDurationBefore] = useState(
    contentFilesData.intakeTime?.durationBefore ?? 10,
  );
  const [durationAfter, setDurationAfter] = useState(
    contentFilesData.intakeTime?.durationAfter ?? 10,
  );
  const [nightDuration, setNightDuration] = useState(
    contentFilesData.intakeTime?.nightDuration ?? 10,
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", message: string }

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const formData = {
      productName: contentFilesData.productName,
      aliasName: contentFilesData.aliasName?.name || "",
      treatmentDuration: duration,
      amountToAdminister: quantity,
      intakeTime: {
        mode: "normal",
        checkedMoments,
        selectedTime,
        durationBefore,
        durationAfter,
        nightDuration,
      },
      folder,
    };

    const result = await OdysseeProductService.createProduct(formData);
    setSaving(false);

    if (result.success) {
      setFeedback({
        type: "success",
        message: "Produit sauvegardé avec succès !",
      });
      if (onSaved) onSaved(result.product);
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Erreur lors de la sauvegarde",
      });
    }
  };

  return (
    <form className="paper-product" onSubmit={handleSubmit} method="POST">
      <div className="paper-product-container-navBar">
        <div className="paper-product-container-navBar_titleProduct">
          <p>{contentFilesData.productName}</p>
          {contentFilesData.aliasName?.name && (
            <p>{contentFilesData.aliasName.name}</p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {feedback && (
            <span
              style={{
                fontSize: "0.85rem",
                color:
                  feedback.type === "success"
                    ? "var(--color-success, #22c55e)"
                    : "var(--color-error, #ef4444)",
              }}
            >
              {feedback.message}
            </span>
          )}
          <input
            type="submit"
            value={saving ? "Enregistrement…" : "Enregistrer"}
            disabled={saving}
          />
        </div>
      </div>

      <div className="paper-product-container">
        <div className="bloc">
          {contentFilesData.img?.length > 0 && (
            <ul className="paper-product-bloc-img">
              {contentFilesData.img.map((item, index) => (
                <li className="paper-product-li_img" key={"img" + index}>
                  <img src={item.adress} alt={item.alt} />
                </li>
              ))}
            </ul>
          )}

          <div>
            <h3>Durée du traitement</h3>
            <RangeDays value={duration} onChange={setDuration} />
          </div>

          <div>
            <h3>Quantité à administrer</h3>
            <div className="range-value">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <label>{quantity}</label>
            </div>
          </div>
        </div>

        <div className="bloc">
          <h3>Moment de prise</h3>
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
        </div>
      </div>
    </form>
  );
};

export default PaperProduct;
