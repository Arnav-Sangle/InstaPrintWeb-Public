
import React from 'react';
import { Upload, Map, Clock, FileCheck } from 'lucide-react';

const features = [
  {
    icon: <Upload className="h-10 w-10 text-primary" />,
    title: "Upload Documents",
    description: "Upload your documents securely and set your printing preferences."
  },
  {
    icon: <Map className="h-10 w-10 text-primary" />,
    title: "Find Nearby Shops",
    description: "Discover print shops near you and compare prices and services."
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Quick Turnaround",
    description: "Get your documents printed quickly, often within hours."
  },
  {
    icon: <FileCheck className="h-10 w-10 text-primary" />,
    title: "Quality Prints",
    description: "Ensure professional quality with trusted local print shops."
  }
];

const Features: React.FC = () => {
  return (
    <div className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How PrintFling Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Print documents without the hassle. Our platform connects you with local print shops in just a few clicks.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-lg p-6 shadow-sm card-hover flex flex-col items-center text-center"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
