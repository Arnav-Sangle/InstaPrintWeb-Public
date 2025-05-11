
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
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <Navbar />
        
        <div className="container px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-md mx-auto">
            <Link to="/" className="inline-flex items-center mb-8 text-sm font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <AuthForm />
          </div>
        </div>
      </div>
    </UserRedirect>
  );
};

export default Auth;
