import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import AuthService from "../../services/authService";
import Navbar from "../../components/Navbar";

const AuthPage = () => {
  const navigate = useNavigate();

  // État pour vérifier si l'utilisateur est déjà connecté
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Vérifier l'authentification au chargement de la page
  useEffect(() => {
    const checkAuth = async () => {
      if (AuthService.isAuthenticated()) {
        const result = await AuthService.verifyAuth();

        if (result.success) {
          // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
          navigate("/dashboard");
          return;
        }
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [navigate]);

  // État pour le formulaire d'inscription
  const [signupData, setSignupData] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // État pour le formulaire de connexion
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // États pour les messages et le chargement
  const [signupMessage, setSignupMessage] = useState({ type: "", text: "" });
  const [loginMessage, setLoginMessage] = useState({ type: "", text: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Gestion du formulaire d'inscription
  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });

    // Réinitialiser les erreurs quand l'utilisateur tape
    if (e.target.name === "confirmEmail") {
      setEmailError("");
    }
    if (e.target.name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSignupLoading(true);
    setSignupMessage({ type: "", text: "" });
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    // Vérification que les emails correspondent
    if (signupData.email !== signupData.confirmEmail) {
      setEmailError("Les adresses email ne correspondent pas");
      hasError = true;
    }

    // Vérification que les mots de passe correspondent
    if (signupData.password !== signupData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      hasError = true;
    }

    if (hasError) {
      setIsSignupLoading(false);
      return;
    }

    try {
      // On envoie seulement les données nécessaires au serveur
      const dataToSend = {
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
      };

      const result = await AuthService.signup(dataToSend);

      if (result.success) {
        setSignupMessage({
          type: "success",
          text: "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        });
        // Réinitialiser le formulaire
        setSignupData({
          email: "",
          confirmEmail: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        });
        setEmailError("");
        setPasswordError("");
      } else {
        setSignupMessage({
          type: "error",
          text:
            result.error +
            (result.details?.length ? ": " + result.details.join(", ") : ""),
        });
      }
    } catch (error) {
      setSignupMessage({
        type: "error",
        text: "Erreur de connexion au serveur",
      });
    } finally {
      setIsSignupLoading(false);
    }
  };

  // Gestion du formulaire de connexion
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginMessage({ type: "", text: "" });

    try {
      const result = await AuthService.login(
        loginData.email,
        loginData.password
      );

      if (result.success) {
        setLoginMessage({
          type: "success",
          text: `Connexion réussie ! Bienvenue ${
            result.data.user.firstName || result.data.user.email
          } !`,
        });

        // Activer le loader de navigation
        setIsNavigating(true);
        navigate("/dashboard");
      } else {
        setLoginMessage({
          type: "error",
          text: result.error,
        });
      }
    } catch (error) {
      setLoginMessage({
        type: "error",
        text: "Erreur de connexion au serveur",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Afficher un loader pendant la vérification d'authentification
  if (isCheckingAuth) {
    return (
      <div className="auth-page">
        <Navbar />
        <div className="auth-container">
          <div className="auth-loader">
            <div className="loader-content">
              <div className="spinner"></div>
              <p>Vérification de l'authentification...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        {isNavigating && (
          <div className="navigation-loader">
            <div className="loader-content">
              <div className="spinner"></div>
              <p>Chargement du tableau de bord...</p>
            </div>
          </div>
        )}

        {/* <h1 className="auth-title">Odyssée</h1> */}

        <div className="forms-container">
          {/* Formulaire d'inscription */}
          <div className="form-section">
            <h2>Inscription</h2>
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-email">Email *</label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirmEmail">Confirmer l'email *</label>
                <input
                  type="email"
                  id="signup-confirmEmail"
                  name="confirmEmail"
                  value={signupData.confirmEmail}
                  onChange={handleSignupChange}
                  required
                  placeholder="Confirmez votre email"
                />
                {emailError && <div className="field-error">{emailError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Mot de passe *</label>
                <input
                  type="password"
                  id="signup-password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirmPassword">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  placeholder="Confirmez votre mot de passe"
                  minLength={6}
                />
                {passwordError && (
                  <div className="field-error">{passwordError}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="signup-lastName">Nom</label>
                <input
                  type="text"
                  id="signup-lastName"
                  name="lastName"
                  value={signupData.lastName}
                  onChange={handleSignupChange}
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-firstName">Prénom</label>
                <input
                  type="text"
                  id="signup-firstName"
                  name="firstName"
                  value={signupData.firstName}
                  onChange={handleSignupChange}
                  placeholder="Votre prénom"
                />
              </div>

              <button
                type="submit"
                className="submit-btn signup-btn"
                disabled={isSignupLoading}
              >
                {isSignupLoading ? "Inscription..." : "S'inscrire"}
              </button>

              {signupMessage.text && (
                <div className={`message ${signupMessage.type}`}>
                  {signupMessage.text}
                </div>
              )}
            </form>
          </div>

          {/* Séparateur */}
          <div className="separator">
            <div className="separator-line"></div>
            <span className="separator-text">OU</span>
            <div className="separator-line"></div>
          </div>

          {/* Formulaire de connexion */}
          <div className="form-section">
            <h2>Connexion</h2>
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email *</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Mot de passe *</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Votre mot de passe"
                />
              </div>

              <button
                type="submit"
                className="submit-btn login-btn"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? "Connexion..." : "Se connecter"}
              </button>

              {loginMessage.text && (
                <div className={`message ${loginMessage.type}`}>
                  {loginMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
