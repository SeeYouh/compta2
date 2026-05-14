import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { acceptInvitation } from '../components/utils/sharingApi';
import ThemeToggle from '../components/ThemeToggle';
import { useDocumentTitle } from '../components/hooks/useDocumentTitle';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error | no-token
  const [message, setMessage] = useState("");

  useDocumentTitle("Accepter l'invitation");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      // Stocker le token d'invitation, puis rediriger vers login
      localStorage.setItem("pendingInvitationToken", token);
      navigate(
        `/login?redirect=/accept-invitation?token=${encodeURIComponent(token)}`,
      );
      return;
    }

    acceptInvitation(token)
      .then(() => {
        setStatus("success");
        setMessage(
          "Invitation acceptée ! Vous avez maintenant accès au compte.",
        );
        setTimeout(() => navigate("/"), 2500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.message || "Erreur lors de l'acceptation de l'invitation.",
        );
      });
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-page__theme-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-page__container">
        <div className="auth-page__card">
          <div className="auth-page__header">
            <h1 className="auth-page__title">Invitation</h1>
          </div>

          {status === "loading" && (
            <p style={{ textAlign: "center", color: "var(--color-text-dim)" }}>
              Traitement de l'invitation…
            </p>
          )}

          {status === "success" && (
            <div className="auth-page__success">
              {message}
              <br />
              <small>Redirection en cours…</small>
            </div>
          )}

          {status === "error" && (
            <div className="auth-page__error">
              {message}
              <br />
              <button
                className="auth-page__link"
                onClick={() => navigate("/")}
                style={{ marginTop: "1rem", display: "block" }}
              >
                Retour à l'accueil
              </button>
            </div>
          )}

          {status === "no-token" && (
            <div className="auth-page__error">
              Lien d'invitation invalide.
              <br />
              <button
                className="auth-page__link"
                onClick={() => navigate("/")}
                style={{ marginTop: "1rem", display: "block" }}
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
