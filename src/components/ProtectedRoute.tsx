import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission, 
  requiredRole,
  redirectTo = '/login' 
}) => {
  const { user, token, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Acesso Negado
            </h3>
            <p className="text-red-700">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Permissão necessária: {requiredPermission}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Acesso Negado
            </h3>
            <p className="text-red-700">
              Você não tem o papel necessário para acessar esta página.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Papel necessário: {requiredRole}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;