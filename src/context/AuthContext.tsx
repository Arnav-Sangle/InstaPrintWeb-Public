
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const supaCallTimeout = 0

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
      // Clear user state first
      setUser(null);
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });

      // Navigate to auth page
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Even if there's an error, ensure we clean up
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth';
    }
  };

  // Handle tab close and navigation events
  useEffect(() => {
    let isNavigatingBack = false;

    // Handle navigation (back/forward)
    const handleNavigation = (event: PopStateEvent) => {
      if (!isNavigatingBack) {
        isNavigatingBack = true;
        // Let the default back navigation happen naturally
        // without programmatically calling history.go()
        
        // Reset the flag after navigation completes
        setTimeout(() => {
          isNavigatingBack = false;
        }, 100);
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handleNavigation);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && mounted) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile && mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || '',
              role: profile.role as UserRole,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          // Use timeout to prevent race conditions
          timeoutId = setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, 0);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setTimeout(async() => {
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile && mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || '',
              role: profile.role as UserRole,
            });
            timeoutId = setTimeout(() => {
              if (mounted) {
                setLoading(false);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT' && mounted) {
          setUser(null);
          timeoutId = setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, 0);
        }
        
      }, supaCallTimeout);
    });

    // Cleanup subscription, mounted flag, and timeouts on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
