import { lazy, Suspense } from "react";

import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Compositions de route protégées, consommées par `main.jsx` via la propriété
 * `Component` de React Router v7.
 *
 * Elles vivent dans ce fichier plutôt que dans `main.jsx` pour deux raisons :
 * - le point d'entrée n'exporte rien, or Fast Refresh exige qu'un module
 *   définissant des composants les exporte ;
 * - leur identité doit rester stable entre les rendus, ce qu'une fonction
 *   anonyme déclarée inline dans la configuration de route ne garantirait pas.
 */

const TramePage = lazy(() => import("../pages/trame/TramePage.jsx"));
const OdysseeDashboard = lazy(
  () => import("../pages/odyssee/OdysseeDashboard.jsx"),
);
const SynapseDashboard = lazy(
  () => import("../pages/synapse/SynapseDashboard.jsx"),
);

export function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export function ProtectedSynapse() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <SynapseDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}

export function ProtectedOdyssee() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <OdysseeDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}

export function ProtectedTrame() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <TramePage />
      </Suspense>
    </ProtectedRoute>
  );
}
