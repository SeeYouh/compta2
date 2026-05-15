import { useState } from "react";

const CategoryForm = ({ onSubmit, onCancel }) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [selectedColor, setSelectedColor] = useState("#007bff");

  if (!onSubmit) return null;

  const iconOptions = ["📁", "📋", "🏠", "🎯", "📊", "💼", "�", "�️", "�", "�"];
  const colorOptions = [
    "#007bff",
    "#28a745",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#fd7e14",
    "#20c997",
    "#6c757d",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSubmit({
        name: categoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setCategoryName("");
      setSelectedIcon("📁");
      setSelectedColor("#007bff");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          width: "400px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#333" }}>
          Créer une nouvelle catégorie
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Nom de la catégorie
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
              placeholder="Entrez le nom de la catégorie..."
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Icône
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {iconOptions.map((icon, index) => (
                <button
                  key={icon + index}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  style={{
                    padding: "8px",
                    border:
                      selectedIcon === icon
                        ? "2px solid #007bff"
                        : "1px solid #ddd",
                    borderRadius: "4px",
                    background: selectedIcon === icon ? "#f0f8ff" : "white",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Couleur
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {colorOptions.map((color, index) => (
                <button
                  key={color + index}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: color,
                    border:
                      selectedColor === color
                        ? "3px solid #333"
                        : "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
              }}
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
