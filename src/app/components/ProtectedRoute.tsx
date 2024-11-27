import React from 'react';
import { useAuth } from './AuthProvider'; // Example Auth context

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
