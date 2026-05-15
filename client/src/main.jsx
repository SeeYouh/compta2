import "./sass/index.scss";

import { lazy, StrictMode, Suspense } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";

import AcceptInvitation from "./pages/AcceptInvitation";
import AccountSharingSettings from "./pages/AccountSharingSettings";
import { AccountsProvider } from "./contexts/AccountsContext";
import App from "./pages/App";
import ContactsPage from "./pages/ContactsPage";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import { LabelsProvider } from "./contexts/LabelsContext";
import LabelsSettings from "./pages/LabelsSettings";
import Login from "./pages/Login";
import ProjectionsSettings from "./pages/ProjectionsSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import SettingsPage from "./pages/SettingsPage";
import { ThemesProvider } from "./contexts/ThemesContext";
import VerifyEmail from "./pages/VerifyEmail";

const TramePage = lazy(() => import("./pages/trame/TramePage.jsx"));
const OdysseeDashboard = lazy(
  () => import("./pages/odyssee/OdysseeDashboard.jsx"),
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
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trame"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <TramePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route
          path="/labels-settings"
          element={
            <ProtectedRoute>
              <LabelsProvider>
                <AccountsProvider>
                  <LabelsSettings />
                </AccountsProvider>
              </LabelsProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projections-settings"
          element={
            <ProtectedRoute>
              <LabelsProvider>
                <AccountsProvider>
                  <ThemesProvider>
                    <ProjectionsSettings />
                  </ThemesProvider>
                </AccountsProvider>
              </LabelsProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-sharing/:accountId"
          element={
            <ProtectedRoute>
              <LabelsProvider>
                <AccountsProvider>
                  <AccountSharingSettings />
                </AccountsProvider>
              </LabelsProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountsProvider>
                <SettingsPage />
              </AccountsProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <AccountsProvider>
                <ContactsPage />
              </AccountsProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/odyssee/*"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <OdysseeDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/synapse/*"
          element={
            <ProtectedRoute>
              <LabelsProvider>
                <AccountsProvider>
                  <ThemesProvider>
                    <App />
                  </ThemesProvider>
                </AccountsProvider>
              </LabelsProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
