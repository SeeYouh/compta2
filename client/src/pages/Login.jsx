import { useState } from "react";

import { useNavigate } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
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
              Connexion
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
                  autoComplete="current-password"
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
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </div>

              <div
                className="form-cell"
                style={{ textAlign: "center", marginTop: "0.5rem" }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="link-button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.9rem",
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <div
                className="form-cell"
                style={{ textAlign: "center", marginTop: "1rem" }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/register")}
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
                  Pas encore de compte ? S'inscrire
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
