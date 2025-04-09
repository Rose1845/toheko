
import React from 'react';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Member-Owned',
    description: 'As a cooperative financial institution, we are entirely owned by our members.'
  },
  {
    title: 'Community Focused',
    description: 'We reinvest in the community to create opportunities and foster growth.'
  },
  {
    title: 'Transparent Operations',
    description: 'We maintain full transparency in all our operations and decision-making processes.'
  },
  {
    title: 'Ethical Practices',
    description: 'Our business practices prioritize ethical standards and member welfare above all.'
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold gradient-text">About Mahissa SACCO</h2>
            <p className="text-gray-700 text-lg">
              Established with the mission to empower our members through financial inclusion, Mahissa SACCO has grown to become a trusted financial partner for individuals and businesses alike.
            </p>
            <p className="text-gray-700">
              We believe in the power of cooperative economics, where members pool their resources to create opportunities for sustainable growth and development. Our approach combines traditional values with modern financial solutions.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="mt-4">Learn More About Us</Button>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
                      alt="Team meeting" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                      alt="Financial planning" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
                      alt="Digital banking" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
                      alt="Community support" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary to-success-500 rounded-full opacity-20 blur-xl z-0"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
