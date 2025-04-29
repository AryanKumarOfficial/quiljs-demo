import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { FloatingTestimonial } from './FloatingTestimonial';
import { testimonials } from './homeData';

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <Container>
        <div className="text-center mb-32">
          <Badge className="mb-4 py-1.5 px-3 bg-blue-50 text-blue-700 border-none">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-blue-600">Users Say</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their note-taking experience.
          </p>
        </div>

        <div className="relative h-[600px] mx-auto max-w-4xl">
          {/* Testimonials */}
          {testimonials.map((testimonial, index) => (
            <FloatingTestimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              position={testimonial.position}
              image={testimonial.image}
              posX={testimonial.posX}
              posY={testimonial.posY}
              delay={index * 0.2}
            />
          ))}

          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-200"></div>
            <div className="absolute bottom-1/3 right-1/5 w-24 h-24 rounded-full bg-teal-200"></div>
            <div className="absolute top-2/3 left-2/3 w-20 h-20 rounded-full bg-purple-200"></div>
          </div>
        </div>
      </Container>
    </section>
  );
}