import { useState } from "react";

import { useNavigate } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
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

      // Afficher un message de succès et rediriger vers login
      alert(
        data.message ||
          "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte."
      );
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "2rem",
      }}
    >
      <ThemeToggle />
      <main
        className="main-content"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        <section className="txn-form" style={{ padding: "2rem" }}>
          <div
            className="txn-form__header"
            style={{ marginBottom: "2rem", textAlign: "center" }}
          >
            <div
              className="txn-form__label"
              style={{ fontSize: "1.75rem", fontWeight: "600" }}
            >
              Inscription
            </div>
          </div>

          <div className="txn-form__panel" style={{ display: "block" }}>
            {error && (
              <div
                className="error-message"
                style={{
                  marginBottom: "1.5rem",
                  padding: "0.75rem 1rem",
                  background: "var(--color-danger-100)",
                  color: "var(--color-danger-900)",
                  borderRadius: "6px",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="form-container"
              style={{ gap: "1.5rem" }}
            >
              <div className="form-cell">
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Nom / Pseudo
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  autoComplete="name"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div className="form-cell">
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
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div className="form-cell">
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div className="form-cell">
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
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div
                className="form-cell form-submit"
                style={{ marginTop: "0.5rem" }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    fontSize: "1rem",
                  }}
                >
                  {loading ? "Inscription..." : "S'inscrire"}
                </button>
              </div>

              <div
                className="form-cell"
                style={{ textAlign: "center", marginTop: "1rem" }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="link-button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-primary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.95rem",
                  }}
                >
                  Déjà un compte ? Se connecter
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Register;
