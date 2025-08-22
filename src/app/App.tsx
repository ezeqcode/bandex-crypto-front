import api from "@/api/baseApi";
import Sidebar from "@/components/sidebar/Sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppRoutes from "@/routes";
import React from "react";
import { useLocation } from "react-router-dom";

const AppContent: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response && error?.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
    <div className="min-w-[100vw] min-h-dvh font-gilroy">
      <Sidebar>
        <AppRoutes />
      </Sidebar>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
