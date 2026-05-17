import "./sass/index.scss";

import { useEffect } from "react";

import { Route, Routes } from "react-router-dom";

import AdminPanel from "./components/AdminPanel";
import AdminRoute from "./components/AdminRoute";
import { applyThemeColors } from "./config/themeColors.js";
import Dashboard from "./pages/private/Dashboard";
import Settings from "./pages/private/Settings";

export default function OdysseeDashboard() {
  useEffect(() => {
    applyThemeColors();
  }, []);

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
