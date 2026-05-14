import { useState } from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { config } from '../config/env';
import ThemeToggle from '../components/ThemeToggle';
import { useDocumentTitle } from '../components/hooks/useDocumentTitle';

const API_URL = config.apiUrl;

// Icônes SVG intégrées
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitationToken");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useDocumentTitle("Inscription");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setSuccess(
        data.message ||
          "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.",
      );

      // Conserver le token d'invitation pour l'accepter après connexion
      if (invitationToken) {
        localStorage.setItem("pendingInvitationToken", invitationToken);
      }

      // Rediriger vers login après 3 secondes
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
            <h1 className="auth-page__title">Créer un compte</h1>
            <p className="auth-page__subtitle">
              Commencez à gérer vos finances dès aujourd'hui
            </p>
          </div>

          {error && <div className="auth-page__error">{error}</div>}

          {success && (
            <div className="auth-page__success">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <CheckCircleIcon />
                {success}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label htmlFor="name" className="auth-page__label">
                Nom / Pseudo
              </label>
              <div className="auth-page__input-wrapper">
                <div className="auth-page__icon">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  id="name"
                  className="auth-page__input"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Jean Dupont"
                  required
                  autoComplete="name"
                  disabled={loading || success}
                />
              </div>
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
                  type="email"
                  id="email"
                  className="auth-page__input"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  disabled={loading || success}
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
                  autoComplete="new-password"
                  disabled={loading || success}
                  minLength={6}
                />
              </div>
              <div className="auth-page__hint">
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
                Minimum 6 caractères
              </div>
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
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading || success}
                  minLength={6}
                />
              </div>
            </div>

            <div className="auth-page__submit">
              <button
                type="submit"
                className="auth-page__button"
                disabled={loading || success}
              >
                {loading ? "Création du compte..." : "Créer mon compte"}
              </button>
            </div>

            <div className="auth-page__links">
              <div className="auth-page__link auth-page__link--secondary">
                Déjà un compte ?{" "}
                <button type="button" onClick={() => navigate("/login")}>
                  Se connecter
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
