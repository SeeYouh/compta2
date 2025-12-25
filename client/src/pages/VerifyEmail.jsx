import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { config } from "../config/env";
import ThemeToggle from "../components/ThemeToggle";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    // Vérifier l'email avec le token
    fetch(`${config.apiUrl}/api/auth/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          // Succès : sauvegarder le token et rediriger
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setStatus("success");
          setMessage(data.message);

          // Rediriger vers l'app après 2 secondes
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Erreur lors de la vérification");
        }
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setStatus("error");
        setMessage("Erreur de connexion au serveur");
      });
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <ThemeToggle
        style={{ position: "absolute", top: "1rem", right: "1rem" }}
      />

      <section
        className="txn-form"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <h1
          style={{
            marginBottom: "1.5rem",
            textAlign: "center",
            fontSize: "1.75rem",
          }}
        >
          Vérification de votre email
        </h1>

        {status === "verifying" && (
          <div style={{ textAlign: "center" }}>
            <p>Vérification en cours...</p>
          </div>
        )}

        {status === "success" && (
          <div
            style={{
              textAlign: "center",
              color: "var(--success-color, #4CAF50)",
            }}
          >
            <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>✅</p>
            <p>{message}</p>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
              Redirection automatique...
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "1.2rem",
                marginBottom: "1rem",
                color: "var(--error-color, #f44336)",
              }}
            >
              ❌
            </p>
            <p
              style={{
                color: "var(--error-color, #f44336)",
                marginBottom: "1.5rem",
              }}
            >
              {message}
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "var(--primary-color, #4CAF50)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
