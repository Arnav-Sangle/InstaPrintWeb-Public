
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/auth';
    
    switch (user.role) {
      case 'customer':
        return '/customer-dashboard';
      case 'shopkeeper':
        return '/shopkeeper-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/auth';
    }
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              InstaPrint
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-medium transition-colors hover:text-primary">
              Home
            </Link>

            {/* <Link to="/how-it-works" className="font-medium transition-colors hover:text-primary">
              How it Works
            </Link> */}
            {/* <Link to="/shops" className="font-medium transition-colors hover:text-primary">
              Print Shops
            </Link> */}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User size={16} />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => logout()}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="animate-fade-in">Sign In</Button>
              </Link>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass mt-2 rounded-b-lg overflow-hidden animate-scale-in">
          <nav className="flex flex-col py-4 px-6 space-y-4">
            <Link 
              to="/" 
              className="font-medium py-2 transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* <Link 
              to="/how-it-works" 
              className="font-medium py-2 transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </Link> */}
            {/* <Link 
              to="/shops" 
              className="font-medium py-2 transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Print Shops
            </Link> */}
            
            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="font-medium py-2 transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 justify-center"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button size="sm" className="w-full">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
