import "./sass/index.scss";

import { lazy, StrictMode, Suspense } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";

import AcceptInvitation from "./pages/auth/AcceptInvitation";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import { odysseeDashboardLoader } from "./pages/odyssee/loaders/odysseeDashboardLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

const TramePage = lazy(() => import("./pages/trame/TramePage.jsx"));
const OdysseeDashboard = lazy(
  () => import("./pages/odyssee/OdysseeDashboard.jsx"),
);
const SynapseDashboard = lazy(
  () => import("./pages/synapse/SynapseDashboard.jsx"),
);

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
const root = window.__reactRoot ?? (window.__reactRoot = createRoot(container));

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/accept-invitation", element: <AcceptInvitation /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/synapse/*",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <SynapseDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/odyssee/*",
    loader: odysseeDashboardLoader,
    hydrateFallbackElement: null,
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <OdysseeDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/trame",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <TramePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
