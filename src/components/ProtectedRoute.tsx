
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  try {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!currentUser) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Error in ProtectedRoute:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
