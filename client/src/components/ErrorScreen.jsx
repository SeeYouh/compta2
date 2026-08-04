import { Component } from "react";

import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

/**
 * Écrans d'erreur de l'application.
 *
 * Avant : aucune frontière d'erreur, aucun `errorElement`. Une erreur de rendu ou
 * un `loader` en échec produisait une **page blanche**, sans message ni moyen de
 * récupérer — l'utilisateur ne pouvait rien signaler d'exploitable.
 *
 * Principe retenu : l'erreur est **bruyante et explicite**. En développement on
 * affiche la cause et la pile ; en production on reste sobre mais on donne toujours
 * de quoi agir et de quoi rapporter.
 */

const EN_DEV = import.meta.env.DEV;

/** Présentation commune — toujours une issue proposée, jamais un cul-de-sac. */
export function ErrorScreen({ titre, message, detail, onRetry, onHome }) {
  return (
    <div className="error-screen" role="alert">
      <h1 className="error-screen__title">{titre}</h1>
      <p className="error-screen__message">{message}</p>

      {EN_DEV && detail ? (
        <pre className="error-screen__detail">{detail}</pre>
      ) : null}

      <div className="error-screen__actions">
        {onRetry ? (
          <button type="button" onClick={onRetry}>
            Réessayer
          </button>
        ) : null}
        {onHome ? (
          <button type="button" onClick={onHome}>
            Retour à l'accueil
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * `errorElement` des routes : capte les erreurs de `loader`, d'`action` et de rendu
 * remontées par React Router.
 */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const estReponse = isRouteErrorResponse(error);
  const titre = estReponse
    ? `Erreur ${error.status}`
    : "Une erreur est survenue";

  const message = estReponse
    ? error.statusText || "La page n'a pas pu être chargée."
    : "La page n'a pas pu être affichée. L'incident a été enregistré dans la console.";

  // L'erreur est journalisée même si l'affichage reste sobre : elle ne doit jamais
  // disparaître sans trace.
  console.error("[RouteError]", error);

  return (
    <ErrorScreen
      titre={titre}
      message={message}
      detail={error?.stack ?? error?.data ?? String(error ?? "")}
      onRetry={() => navigate(0)}
      onHome={() => navigate("/")}
    />
  );
}

/** Route attrape-tout : une URL inconnue ne doit pas rendre une page vide. */
export function NotFound() {
  const navigate = useNavigate();

  return (
    <ErrorScreen
      titre="Page introuvable"
      message={`Aucune page ne correspond à ${window.location.pathname}.`}
      onHome={() => navigate("/")}
    />
  );
}

/**
 * Frontière d'erreur applicative. React Router couvre les routes ; celle-ci couvre
 * tout ce qui est monté en dehors, et sert de dernier filet.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Obligation : une erreur est pistée, jamais absorbée.
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ErrorScreen
        titre="Une erreur est survenue"
        message="L'application n'a pas pu continuer. Rechargez la page ; si le problème persiste, signalez-le avec le message ci-dessous."
        detail={this.state.error?.stack ?? String(this.state.error)}
        onRetry={() => window.location.reload()}
      />
    );
  }
}
