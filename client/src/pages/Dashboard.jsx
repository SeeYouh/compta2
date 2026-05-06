import "./Dashboard.scss";

import { useNavigate } from "react-router-dom";

import AnimatedBackground from "../components/AnimatedBackground";
import { useDocumentTitle } from "../components/hooks/useDocumentTitle";
import UserMenu from "../components/UserMenu";

const apps = [
  {
    id: "compta",
    path: "/",
    label: "Synapse Compta",
    description: "Gérez vos comptes, transactions et budgets",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h2v5H7zM11 6h2v7h-2zM15 10h2v3h-2z" />
      </svg>
    ),
  },
  {
    id: "organigramme",
    path: "/organigramme",
    label: "Organigramme",
    description: "Créez et visualisez vos organigrammes",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <rect x="2" y="18" width="6" height="4" rx="1" />
        <rect x="9" y="18" width="6" height="4" rx="1" />
        <rect x="16" y="18" width="6" height="4" rx="1" />
        <path d="M12 6v4M12 10H5v4M12 10h7v4" />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  useDocumentTitle("Accueil");

  return (
    <div className="dashboard-page">
      <AnimatedBackground />

      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <span className="dashboard-header__logo">S</span>
          <span className="dashboard-header__name">Synapse</span>
        </div>
        <UserMenu />
      </header>

      <main className="dashboard-main">
        <h1 className="dashboard-title">Vos applications</h1>
        <p className="dashboard-subtitle">
          Choisissez une application pour commencer
        </p>

        <div className="dashboard-grid">
          {apps.map((app) => (
            <button
              key={app.id}
              className="dashboard-card"
              onClick={() => navigate(app.path)}
            >
              <div className="dashboard-card__icon">{app.icon}</div>
              <div className="dashboard-card__content">
                <h2 className="dashboard-card__label">{app.label}</h2>
                <p className="dashboard-card__description">{app.description}</p>
              </div>
              <svg
                className="dashboard-card__arrow"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
