import { useEffect, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token de réinitialisation manquant");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la réinitialisation");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
          Nouveau mot de passe
        </h1>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--success-color, #4CAF50)",
                marginBottom: "1.5rem",
              }}
            >
              ✅ Mot de passe réinitialisé avec succès !
            </p>
            <p style={{ fontSize: "0.9rem" }}>
              Redirection vers la connexion...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
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

            {!token ? (
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "var(--error-color, #f44336)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Token de réinitialisation manquant ou invalide
                </p>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "var(--primary-color, #4CAF50)",
                    textDecoration: "none",
                  }}
                >
                  Faire une nouvelle demande
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="password"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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
                  {loading
                    ? "Réinitialisation..."
                    : "Réinitialiser le mot de passe"}
                </button>
              </>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
