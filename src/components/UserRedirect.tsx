
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UserRedirectProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'shopkeeper' | 'admin' | null;
  redirectTo?: string;
}

const UserRedirect: React.FC<UserRedirectProps> = ({ 
  children, 
  requiredRole = null, 
  redirectTo = '/auth' 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    // Redirect to auth if no user and auth is required
    if (!user && requiredRole !== null) {
      navigate(redirectTo);
      return;
    }
    
    // Redirect if user doesn't have required role
    if (user && requiredRole !== null && user.role !== requiredRole) {
      // Redirect to appropriate dashboard
      switch (user.role) {
        case 'customer':
          navigate('/customer-dashboard');
          break;
        case 'shopkeeper':
          navigate('/shopkeeper-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, loading, requiredRole, redirectTo, navigate]);

  // Show loading or render children
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-md h-12 w-12 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserRedirect;
