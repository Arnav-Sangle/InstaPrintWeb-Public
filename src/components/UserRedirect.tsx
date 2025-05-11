
import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
// import { supabase } from '@/integrations/supabase/client';

type UserRedirectProps = {
  children: React.ReactNode;
  requiredRole: UserRole | null;
  redirectTo?: string;
};

const UserRedirect: React.FC<UserRedirectProps> = ({ 
  children, 
  requiredRole = null, 
  redirectTo = '/auth' 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectBasedOnRole = useCallback((role: UserRole) => {
    switch (role) {
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
  }, [navigate]);

  // Handle auth state and redirects
  useEffect(() => {
    let mounted = true;

    const handleRedirects = () => {
      if (loading) return;

      if (mounted) {
        // If we're on the auth page (requiredRole is null) and user is logged in,
        // redirect to their appropriate dashboard
        if (requiredRole === null && user) {
          redirectBasedOnRole(user.role);
          return;
        }
        
        // If a role is required and no user is logged in, redirect to auth
        if (requiredRole !== null && !user) {
          navigate(redirectTo);
          return;
        }
        
        // If user doesn't have required role, redirect to their appropriate dashboard
        if (user && requiredRole !== null && user.role !== requiredRole) {
          redirectBasedOnRole(user.role);
        }
      }
    };

    handleRedirects();

    return () => {
      mounted = false;
    };
  }, [user, loading, requiredRole, redirectTo, navigate, redirectBasedOnRole]);

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
