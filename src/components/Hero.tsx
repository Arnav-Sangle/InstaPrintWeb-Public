
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute left-1/4 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
      </div>
      
      <div className="container px-4 pt-24 pb-32 md:pt-36 md:pb-44 mx-auto">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto animate-on-load">
          <div className="mb-6 flex items-center p-2 px-4 bg-muted/80 rounded-full text-sm font-medium text-primary">
            <Printer size={16} className="mr-2" />
            <span>Print documents at nearby shops</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Find and use print shops <span className="text-primary">nearby</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
            InstaPrint connects you with local print shops. Upload your documents, 
            choose a shop, and pick up your prints when they're ready.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button size="lg" className="flex items-center gap-2">
                Get Started
                <ArrowRight size={16} />
              </Button>
            </Link>
            {/* <Link to="/shops">
              <Button size="lg" variant="outline">
                Browse Print Shops
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
