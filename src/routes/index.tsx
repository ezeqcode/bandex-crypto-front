import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const Login = lazy(() => import("@/pages/Login/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard/Dashboard"));
const Users = lazy(() => import("@/pages/Users/Users"));
const Customers = lazy(() => import("@/pages/Customers/Customers"));
const Invoices = lazy(() => import("@/pages/Invoices/Invoices"));
const Transactions = lazy(() => import("@/pages/Transactions/Transactions"));
const Webhooks = lazy(() => import("@/pages/Webhooks/Webhooks"));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-lg">Carregando...</div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/dashboard" replace /> : 
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        } 
      />
      
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermission="users:read">
            <Suspense fallback={<LoadingSpinner />}>
              <Users />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/customers"
        element={
          <ProtectedRoute requiredPermission="customers:read">
            <Suspense fallback={<LoadingSpinner />}>
              <Customers />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/invoices"
        element={
          <ProtectedRoute requiredPermission="invoices:read">
            <Suspense fallback={<LoadingSpinner />}>
              <Invoices />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/transactions"
        element={
          <ProtectedRoute requiredPermission="transactions:read">
            <Suspense fallback={<LoadingSpinner />}>
              <Transactions />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/webhooks"
        element={
          <ProtectedRoute requiredPermission="webhooks:read">
            <Suspense fallback={<LoadingSpinner />}>
              <Webhooks />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
