
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "Joining Mahissa SACCO was one of the best financial decisions I've made. The loan I received helped me expand my business significantly.",
    author: "Catherine Wanjiku",
    role: "Small Business Owner"
  },
  {
    quote: "The savings program at Mahissa SACCO has helped me plan for my children's education. Their financial advisors are knowledgeable and supportive.",
    author: "David Mwangi",
    role: "Parent & Teacher"
  },
  {
    quote: "As a young professional, I was looking for ways to save and invest. Mahissa SACCO's youth program provided the perfect solution with great returns.",
    author: "Amina Mohammed",
    role: "Software Engineer"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 gradient-text">What Our Members Say</h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what some of our members have to say about their experience with Mahissa SACCO.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-center italic">"{testimonial.quote}"</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
