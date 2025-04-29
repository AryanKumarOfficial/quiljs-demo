import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { TimelineStep } from './TimelineStep';
import { timelineSteps } from './homeData';

export function TimelineSection() {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <Badge className="mb-4 py-1.5 px-3 bg-blue-50 text-blue-700 border-none">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple & Intuitive Process
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our straightforward note-taking process.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-blue-200"></div>
            
            {/* Timeline Steps */}
            <div className="space-y-16">
              {timelineSteps.map((step, index) => (
                <TimelineStep 
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  position={index % 2 === 0 ? 'left' : 'right'}
                  delay={index * 0.2}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}