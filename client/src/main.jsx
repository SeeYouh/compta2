import "./sass/index.scss";

import { StrictMode } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";

import AcceptInvitation from "./pages/auth/AcceptInvitation";
import { ErrorBoundary, NotFound, RouteError } from "./components/ErrorScreen";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import { odysseeDashboardLoader } from "./pages/odyssee/loaders/odysseeDashboardLoader";
import {
  ProtectedDashboard,
  ProtectedOdyssee,
  ProtectedSynapse,
  ProtectedTrame,
} from "./components/ProtectedPages";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

function initTheme() {
  const stored = localStorage.getItem("theme");
  if (stored) {
    document.documentElement.setAttribute("data-theme", stored);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute(
    "data-theme",
    prefersDark ? "dark" : "light",
  );
}
initTheme();

const container = document.getElementById("root");

// `window.__reactRoot` : garde-fou de rechargement à chaud. En développement, Vite
// peut ré-exécuter ce module ; sans ce cache, `createRoot` serait appelé une seconde
// fois sur le même conteneur, ce que React refuse. À supprimer si le rechargement à
// chaud cesse de ré-exécuter le point d'entrée.
const root = window.__reactRoot ?? (window.__reactRoot = createRoot(container));

const router = createBrowserRouter([
  { path: "/login", Component: Login, errorElement: <RouteError /> },
  { path: "/register", Component: Register, errorElement: <RouteError /> },
  { path: "/verify-email", Component: VerifyEmail, errorElement: <RouteError /> },
  { path: "/forgot-password", Component: ForgotPassword, errorElement: <RouteError /> },
  { path: "/reset-password", Component: ResetPassword, errorElement: <RouteError /> },
  { path: "/accept-invitation", Component: AcceptInvitation, errorElement: <RouteError /> },
  { path: "/", Component: ProtectedDashboard, errorElement: <RouteError /> },
  { path: "/synapse/*", Component: ProtectedSynapse, errorElement: <RouteError /> },
  {
    path: "/odyssee/*",
    loader: odysseeDashboardLoader,
    hydrateFallbackElement: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-lightness, #f5f5f5)' }}>
        <p style={{ color: 'var(--color-darkest, #333)' }}>Chargement...</p>
      </div>
    ),
    Component: ProtectedOdyssee,
    errorElement: <RouteError />,
  },
  { path: "/trame", Component: ProtectedTrame, errorElement: <RouteError /> },
  { path: "*", Component: NotFound },
]);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);
