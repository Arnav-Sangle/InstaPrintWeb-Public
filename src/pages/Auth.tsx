
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import UserRedirect from '@/components/UserRedirect';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const { user } = useAuth();
  
  return (
    <UserRedirect requiredRole={null}>
      <div className="min-h-screen dashboard-gradient">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-md mx-auto">
            <Link to="/" className="inline-flex items-center mb-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <div className="bg-card shadow-sm rounded-lg border p-6 animate-on-load">
              <AuthForm />
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </UserRedirect>
  );
};

export default Auth;
