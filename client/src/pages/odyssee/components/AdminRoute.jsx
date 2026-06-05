import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import AuthService from "../services/authService";

const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const result = await AuthService.verifyAuth();
        if (result.success && result.data.user.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div>Vérification des droits d'administration...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/odyssee" replace />;
  }

  return children;
};

export default AdminRoute;
