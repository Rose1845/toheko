import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold gradient-text">
              Financial Growth Through Community Savings
            </h1>
            <p className="text-gray-700 text-lg md:text-xl">
              Join SACCO today and experience the power of collaborative
              saving and investment for a brighter financial future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="font-medium text-base" asChild>
                <Link to="/register">Join Now</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-medium text-base"
                asChild
              >
                <Link to="#services">Learn More</Link>
              </Button>
            </div>
          </div>

          <div
            className="w-full md:w-1/2 flex justify-center animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-success rounded-2xl blur-md opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Toheko SACCO Member"
                className="relative w-full h-auto rounded-2xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
