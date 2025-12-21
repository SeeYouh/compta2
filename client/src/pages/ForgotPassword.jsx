import { useState } from "react";

import { Link } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la demande");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        style={{ maxWidth: "450px", width: "100%", padding: "2rem" }}
      >
        <h1
          style={{
            marginBottom: "1.5rem",
            textAlign: "center",
            fontSize: "1.75rem",
          }}
        >
          Mot de passe oublié
        </h1>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--success-color, #4CAF50)",
                marginBottom: "1.5rem",
              }}
            >
              ✅ Si cet email existe, un lien de réinitialisation a été envoyé.
            </p>
            <p style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Vérifiez votre boîte de réception et vos spams.
            </p>
            <Link
              to="/login"
              style={{
                color: "var(--primary-color, #4CAF50)",
                textDecoration: "none",
              }}
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              Entrez votre adresse email pour recevoir un lien de
              réinitialisation.
            </p>

            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "var(--error-bg, #ffebee)",
                  color: "var(--error-color, #f44336)",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "var(--primary-color, #4CAF50)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
              <Link
                to="/login"
                style={{
                  color: "var(--primary-color, #4CAF50)",
                  textDecoration: "none",
                }}
              >
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
