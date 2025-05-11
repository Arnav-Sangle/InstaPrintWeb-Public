
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Printer, Map, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        
        {/* Call to action section */}
        <section className="py-20 bg-primary text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-primary-foreground/90">
              Join PrintFling today and start printing documents at local shops with ease.
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-primary font-medium flex items-center gap-2"
              >
                Create Your Account
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
        
        {/* User types section */}
        <section className="py-24">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">PrintFling for Everyone</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you need to print documents or own a print shop, PrintFling has solutions for you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-card rounded-lg p-8 shadow card-hover">
                <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Customers</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Upload documents and set printing preferences
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Find and compare nearby print shops
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Track orders and get notifications
                  </li>
                </ul>
                <Link to="/auth">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Sign Up as Customer
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              
              <div className="bg-card rounded-lg p-8 shadow card-hover">
                <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                  <Printer className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Print Shops</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Register your shop and set availability
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Manage pricing and services offered
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Receive and process print orders
                  </li>
                </ul>
                <Link to="/auth">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Register Your Shop
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-muted/50 py-12">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  PrintFling
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  Connecting users with local print shops
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <Link to="/" className="text-sm hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/how-it-works" className="text-sm hover:text-primary transition-colors">
                  How it Works
                </Link>
                <Link to="/shops" className="text-sm hover:text-primary transition-colors">
                  Print Shops
                </Link>
                <Link to="/auth" className="text-sm hover:text-primary transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} PrintFling. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
