
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md fixed top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sacco-500 to-success-500 flex items-center justify-center text-white font-bold text-lg">M</div>
          <span className="text-xl font-display font-semibold text-gray-900">Mahissa SACCO</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium text-gray-700 hover:text-primary transition-colors">Home</Link>
          <Link to="#services" className="font-medium text-gray-700 hover:text-primary transition-colors">Services</Link>
          <Link to="#about" className="font-medium text-gray-700 hover:text-primary transition-colors">About Us</Link>
          <Link to="#contact" className="font-medium text-gray-700 hover:text-primary transition-colors">Contact</Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 pb-4 animate-fade-in">
          <div className="flex flex-col space-y-2">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">Home</Link>
            <Link to="#services" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">Services</Link>
            <Link to="#about" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">About Us</Link>
            <Link to="#contact" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">Contact</Link>
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
