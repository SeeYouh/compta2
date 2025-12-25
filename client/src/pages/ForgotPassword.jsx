import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { config } from "../config/env";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = config.apiUrl;

// Icônes SVG intégrées
const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
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
    <div className="auth-page">
      <div className="auth-page__theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-page__container">
        <div className="auth-page__card">
          <div className="auth-page__header">
            <h1 className="auth-page__title">Mot de passe oublié ?</h1>
            <p className="auth-page__subtitle">
              {success
                ? "Vérifiez votre boîte mail"
                : "Recevez un lien de réinitialisation"}
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-primary-100)",
                  borderRadius: "50%",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "40px", height: "40px" }}
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 6 10-6" />
                </svg>
              </div>

              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  marginBottom: "0.75rem",
                }}
              >
                Email envoyé
              </h2>

              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-text-dim)",
                  lineHeight: "1.6",
                  marginBottom: "0.5rem",
                }}
              >
                Si cet email existe dans notre système, vous recevrez un lien de
                réinitialisation.
              </p>

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-dim)",
                  marginBottom: "2rem",
                }}
              >
                Pensez à vérifier vos spams
              </p>

              <div className="auth-page__submit">
                <button
                  type="button"
                  className="auth-page__button"
                  onClick={() => navigate("/login")}
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && <div className="auth-page__error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-page__form">
                <div
                  className="auth-page__hint"
                  style={{ marginTop: "-0.5rem" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  Entrez votre adresse email pour recevoir un lien de
                  réinitialisation
                </div>

                <div className="auth-page__field">
                  <label htmlFor="email" className="auth-page__label">
                    Email
                  </label>
                  <div className="auth-page__input-wrapper">
                    <div className="auth-page__icon">
                      <EmailIcon />
                    </div>
                    <input
                      id="email"
                      type="email"
                      className="auth-page__input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="auth-page__submit">
                  <button
                    type="submit"
                    className="auth-page__button"
                    disabled={loading}
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </button>
                </div>

                <div className="auth-page__links">
                  <div className="auth-page__link">
                    <button type="button" onClick={() => navigate("/login")}>
                      Retour à la connexion
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
