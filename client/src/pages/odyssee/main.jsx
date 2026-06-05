import "./sass/index.scss";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";

import AdminPanel from "./components/AdminPanel";
import AdminRoute from "./components/AdminRoute";
import App from "./pages/App";
import AuthPage from "./pages/public/AuthPage";
import Dashboard from "./pages/private/Dashboard";
import Settings from "./pages/private/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/sys/panel",
    element: (
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
