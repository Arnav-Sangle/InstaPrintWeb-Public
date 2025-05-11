
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen dashboard-gradient">
      <Navbar />
      
      <div className="container flex flex-col items-center justify-center px-4 py-16 pt-32 md:py-32">
        <div className="max-w-md w-full bg-card shadow-sm rounded-lg p-8 text-center animate-on-load">
          <div className="mx-auto w-16 h-16 mb-6 bg-muted flex items-center justify-center rounded-full">
            <span className="text-3xl font-bold">404</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <Home size={16} />
                Back to Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
