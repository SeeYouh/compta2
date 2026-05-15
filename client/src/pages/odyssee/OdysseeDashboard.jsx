import "./sass/index.scss";

import { Route, Routes } from "react-router-dom";

import AdminPanel from "./components/AdminPanel";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./pages/private/Dashboard";
import Settings from "./pages/private/Settings";

export default function OdysseeDashboard() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
