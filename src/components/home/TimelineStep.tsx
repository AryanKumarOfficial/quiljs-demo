import React from 'react';
import { MotionDiv } from '@/components/ui/motion-div';

interface TimelineStepProps {
  title: string;
  description: string;
  icon: string; // Changed from ReactNode to string
  position?: 'left' | 'right';
  delay?: number;
}

export function TimelineStep({
  title,
  description,
  icon,
  position = 'left',
  delay = 0
}: TimelineStepProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: position === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay, type: "spring", stiffness: 100 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className={`flex items-center relative ${position === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}>
        {/* Circle on timeline */}
        <MotionDiv 
          className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center z-10 shadow-lg shadow-blue-500/30"
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 15px 2px rgba(59, 130, 246, 0.5)",
          }}
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300,
            delay: delay + 0.3
          }}
        >
          {/* Render SVG with the path string */}
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d={icon}
            ></path>
          </svg>
        </MotionDiv>
        
        {/* Content */}
        <div className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 md:w-[calc(50%-20px)] w-full ${position === 'left' ? 'md:mr-auto' : 'md:ml-auto'} relative group hover:shadow-xl transition-all duration-300`}>
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-lg transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 ease-in-out"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </MotionDiv>
  );
}