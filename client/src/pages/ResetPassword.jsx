import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { config } from '../config/env';
import ThemeToggle from '../components/ThemeToggle';
import { useDocumentTitle } from '../components/hooks/useDocumentTitle';

const API_URL = config.apiUrl;

// Icônes SVG intégrées
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

const AlertCircleIcon = () => (
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
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useDocumentTitle("Réinitialisation du mot de passe");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token de réinitialisation manquant ou invalide");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (field, value) => {
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    setError("");
  };

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
        },
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
    <div className="auth-page">
      <div className="auth-page__theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-page__container">
        <div className="auth-page__card">
          <div className="auth-page__header">
            <h1 className="auth-page__title">Nouveau mot de passe</h1>
            <p className="auth-page__subtitle">
              Créez un nouveau mot de passe sécurisé
            </p>
          </div>

          {error && <div className="auth-page__error">{error}</div>}

          {success && (
            <div className="auth-page__success">
              <CheckCircleIcon /> Mot de passe réinitialisé avec succès !
              Redirection en cours...
            </div>
          )}

          {!token ? (
            <div className="auth-page__links">
              <div className="auth-page__link auth-page__link--secondary">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                >
                  Faire une nouvelle demande
                </button>
              </div>
            </div>
          ) : (
            !success && (
              <form onSubmit={handleSubmit} className="auth-page__form">
                <div className="auth-page__field">
                  <label htmlFor="password" className="auth-page__label">
                    Nouveau mot de passe
                  </label>
                  <div className="auth-page__input-wrapper">
                    <div className="auth-page__icon">
                      <LockIcon />
                    </div>
                    <input
                      type="password"
                      id="password"
                      className="auth-page__input"
                      value={password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <p className="auth-page__hint">
                    <AlertCircleIcon />
                    Minimum 6 caractères
                  </p>
                </div>

                <div className="auth-page__field">
                  <label htmlFor="confirmPassword" className="auth-page__label">
                    Confirmer le mot de passe
                  </label>
                  <div className="auth-page__input-wrapper">
                    <div className="auth-page__icon">
                      <LockIcon />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="auth-page__input"
                      value={confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="auth-page__submit">
                  <button
                    type="submit"
                    className="auth-page__button"
                    disabled={loading}
                  >
                    {loading
                      ? "Réinitialisation..."
                      : "Réinitialiser le mot de passe"}
                  </button>
                </div>

                <div className="auth-page__links">
                  <div className="auth-page__link auth-page__link--secondary">
                    Vous vous souvenez de votre mot de passe ?{" "}
                    <button type="button" onClick={() => navigate("/login")}>
                      Se connecter
                    </button>
                  </div>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
