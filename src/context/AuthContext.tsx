import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define user roles
export type UserRole = 'customer' | 'shopkeeper' | 'admin';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Supabase profiles
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear Supabase session both locally and on server
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // Clear user state
      setUser(null);
      setLoading(false);
      
      // Force reload to ensure clean state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Even if there's an error, try to clear everything
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      window.location.href = '/';
    }
  };

  // Handle tab close and navigation events
  useEffect(() => {
    let isUnloading = false;
    let isNavigatingBack = false;

    // Handle tab/browser close
    const handleTabClose = (event: BeforeUnloadEvent) => {
      isUnloading = true;
      // Only logout on actual tab/window close
      supabase.auth.signOut({ scope: 'local' });
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    };

    // Handle navigation (back/forward)
    const handleNavigation = (event: PopStateEvent) => {
      if (!isUnloading && !isNavigatingBack) {
        isNavigatingBack = true;
        // Let the default back navigation happen naturally
        // without programmatically calling history.go()
        
        // Reset the flag after navigation completes
        setTimeout(() => {
          isNavigatingBack = false;
        }, 100);
      }
    };

    // Handle visibility change (tab switch/close)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Do nothing on tab switch, only handle actual close
        const isClosing = document.visibilityState === 'hidden' && !document.hidden;
        if (isClosing) {
          handleTabClose(new Event('beforeunload') as BeforeUnloadEvent);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleTabClose);
    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || '',
              role: profile.role as UserRole,
            });
          } else {
            // If profile fetch fails, clear the session
            await logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear session on error
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.name || '',
            role: profile.role as UserRole,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // User data will be set by the onAuthStateChange listener
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
