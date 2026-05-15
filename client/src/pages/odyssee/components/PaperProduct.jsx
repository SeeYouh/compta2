import { useState } from "react";

import { ArrayGraduation } from "./utils/ArrayGraduation";
import InTakeTimeAdvancedMode from "./InTakeTimeAdvancedMode";
import InTakeTimeNormalMode from "./InTakeTimeNormalMode";
import ProductService from "../services/productService";
import Range14 from "./Range14";
import RangeDays from "./RangeDays";

const PaperProduct = ({ contentFilesData, folder = "dossier1" }) => {
  const [duration, setDuration] = useState(contentFilesData.treatmentDuration);
  const [quantity, setQuantity] = useState(contentFilesData.amountToAdminister);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [checkedMoments, setCheckedMoments] = useState(["Matin"]);
  const [selectedTime, setSelectedTime] = useState("beforeMeal");
  const [durationBefore, setDurationBefore] = useState(10);
  const [durationAfter, setDurationAfter] = useState("");
  const [nightDuration, setNightDuration] = useState(10);
  const [saveStatus, setSaveStatus] = useState(null);

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

    const formData = {
      productName: contentFilesData.productName,
      aliasName: contentFilesData.aliasName.name,
      treatmentDuration: duration,
      amountToAdminister: quantity,
      intakeTime: {
        mode: advancedMode ? "advanced" : "normal",
        checkedMoments,
        selectedTime,
        durationBefore,
        durationAfter,
        nightDuration,
      },
      folder,
      // Le dossier est passé en prop depuis le composant parent
    };

    console.log("FormData envoyé :", JSON.stringify(formData, null, 2));

    try {
      const result = await ProductService.createProduct(formData);

      if (result.success) {
        setSaveStatus({
          type: "success",
          message: "Produit sauvegardé avec succès !",
        });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({ type: "error", message: "Erreur : " + result.error });
        console.error("Erreur:", result.error);
      }
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: "Erreur de connexion au serveur",
      });
      console.error("Erreur de connexion:", error);
    }
  };

  return (
    <form className="paper-product" onSubmit={handleSubmit} method="POST">
      <div className="paper-product-container-navBar">
        <div className="paper-product-container-navBar_titleProduct">
          <p>{contentFilesData.productName}</p>
          <p> {contentFilesData.aliasName.name} </p>
        </div>
        <input type="submit" value="Enregistrer" />
      </div>
      {saveStatus && (
        <div
          style={{
            padding: "8px 16px",
            margin: "8px",
            borderRadius: "4px",
            backgroundColor:
              saveStatus.type === "success" ? "#d4edda" : "#f8d7da",
            color: saveStatus.type === "success" ? "#155724" : "#721c24",
            fontSize: "14px",
          }}
        >
          {saveStatus.message}
        </div>
      )}

      <div className="paper-product-container">
        <div className="bloc">
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
