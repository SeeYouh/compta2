import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { config } from "../config/env";
import ThemeToggle from "../components/ThemeToggle";
import { useDocumentTitle } from "../components/hooks/useDocumentTitle";

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

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useDocumentTitle("Connexion");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur de connexion");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      console.error("Erreur de connexion détaillée:", {
        message: err.message,
        url: `${API_URL}/api/auth/login`,
        error: err,
      });

      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          `Impossible de contacter le serveur sur ${API_URL}. Vérifiez que le serveur est démarré et que l'URL est correcte.`
        );
      } else {
        setError(err.message);
      }
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
            <h1 className="auth-page__title">Bienvenue</h1>
            <p className="auth-page__subtitle">
              Connectez-vous pour accéder à votre compte
            </p>
          </div>

          {error && <div className="auth-page__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label htmlFor="email" className="auth-page__label">
                Email
              </label>
              <div className="auth-page__input-wrapper">
                <div className="auth-page__icon">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  id="email"
                  className="auth-page__input"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label htmlFor="password" className="auth-page__label">
                Mot de passe
              </label>
              <div className="auth-page__input-wrapper">
                <div className="auth-page__icon">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  id="password"
                  className="auth-page__input"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <div className="auth-page__link auth-page__link--forgot">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="auth-page__submit">
              <button
                type="submit"
                className="auth-page__button"
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </div>

            <div className="auth-page__links">
              <div className="auth-page__link auth-page__link--secondary">
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => navigate("/register")}>
                  Créer un compte
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
