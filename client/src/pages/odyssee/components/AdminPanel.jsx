import { useNavigate } from "react-router-dom";

import UsersList from "./UsersList";

const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Inter, Arial, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 style={{ color: "#333", margin: 0 }}>
            Administration des utilisateurs
          </h1>
          <button
            onClick={() => navigate("/odyssee")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 5px 15px rgba(108, 117, 125, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ← Retour au Dashboard
          </button>
        </div>
        <UsersList />
      </div>
    </div>
  );
};

export default AdminPanel;
