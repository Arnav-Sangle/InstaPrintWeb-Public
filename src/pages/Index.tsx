
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Printer, MapPin, CreditCard, Clock, CheckCircle, Upload } from 'lucide-react';

const Index = () => {
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    
    return () => observer.disconnect();
  }, []);
  
  // Features data
  const features = [
    {
      icon: <Upload className="h-12 w-12 text-primary" />,
      title: 'Easy File Upload',
      description: 'Upload any document format for printing with detailed specifications'
    },
    {
      icon: <MapPin className="h-12 w-12 text-primary" />,
      title: 'Find Nearby Shops',
      description: 'Locate print shops near you with real-time availability and pricing'
    },
    {
      icon: <Printer className="h-12 w-12 text-primary" />,
      title: 'Quality Printing',
      description: 'Get professional quality prints from verified local print shops'
    },
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: 'Secure Payment',
      description: 'Pay securely online with various payment options available'
    },
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: 'Real-time Tracking',
      description: 'Track your order status from processing to ready for pickup'
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      title: 'Verified Shops',
      description: 'All print shops are verified to ensure quality and reliability'
    }
  ];
  
  // Steps data
  const steps = [
    {
      number: '01',
      title: 'Upload Your Document',
      description: 'Upload your files and specify your printing preferences like color, size, and quantity.'
    },
    {
      number: '02',
      title: 'Select a Print Shop',
      description: 'Browse nearby print shops on the map and select one based on price, location, and ratings.'
    },
    {
      number: '03',
      title: 'Complete Payment',
      description: 'Pay securely online and your print job will be sent to the selected shop.'
    },
    {
      number: '04',
      title: 'Track & Pickup',
      description: 'Track your order status in real-time and pick up your prints when ready.'
    }
  ];
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden" ref={heroRef}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-10 animate-fade-in">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
                Print Your Documents Remotely With Ease
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload files, find nearby print shops, and get your documents printed without leaving home.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg">
                  How It Works
                </Button>
              </Link>
            </div>
            
            <div className="w-full max-w-5xl mt-10 glass rounded-2xl p-3 opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <div className="aspect-video rounded-xl overflow-hidden relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="glass p-10 rounded-2xl">
                  <Printer className="h-20 w-20 text-primary/80" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary/50" ref={featuresRef}>
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 opacity-0" style={{ animation: 'fade-in 0.6s ease-out 0.2s forwards' }}>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything You Need for Remote Printing
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our platform connects you with local print shops to make printing convenient and efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-6 transition-all hover:translate-y-[-5px] opacity-0" 
                style={{ animation: `fade-in 0.6s ease-out ${0.2 + index * 0.1}s forwards` }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20" ref={howItWorksRef}>
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 opacity-0" style={{ animation: 'fade-in 0.6s ease-out 0.2s forwards' }}>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Print your documents in four simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative opacity-0"
                style={{ animation: `fade-in 0.6s ease-out ${0.3 + index * 0.1}s forwards` }}
              >
                <div className="glass rounded-xl p-6 h-full">
                  <div className="text-4xl font-light text-primary mb-4">{step.number}</div>
                  <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-6 h-0.5 bg-border" style={{ transform: 'translateX(-50%)' }}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16 opacity-0" style={{ animation: 'fade-in 0.6s ease-out 0.6s forwards' }}>
            <Link to="/auth">
              <Button size="lg" className="group">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-secondary py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PrintFling</h3>
              <p className="text-muted-foreground">
                The easiest way to print your documents remotely and pick them up at your convenience.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
                <li><Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link to="/shops" className="text-muted-foreground hover:text-foreground transition-colors">Print Shops</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign In / Register</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Email: support@printfling.com</li>
                <li>Phone: (123) 456-7890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PrintFling. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
