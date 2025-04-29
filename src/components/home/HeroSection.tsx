import React from "react";
import Link from "next/link";
import { Hero } from "@/components/ui/hero";
import { MotionDiv } from "@/components/ui/motion-div";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 opacity-80"></div>
        
        {/* Animated dots */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.2s' }}></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-indigo-500 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-teal-500 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
          <div className="absolute right-1/3 bottom-20 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1.5s' }}></div>
        </div>
        
        {/* Animated grid lines */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="h-full w-full border-t border-l border-slate-400/30 grid grid-cols-6 grid-rows-6">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="border-b border-r border-slate-400/30"></div>
            ))}
          </div>
        </div>
        
        {/* Blurred gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/20 rounded-full filter blur-[120px] opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <Hero
        theme="light"
        backgroundPattern="shapes"
        layout="overlapping"
        title={
          <MotionDiv animation="fadeInScale" delay={0.2} className="relative z-10">
            <Badge className="mb-4 py-1.5 px-4 bg-slate-100/50 text-blue-600 border border-slate-200">
              Cloud Note Taking Reimagined
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-800">
              Your Digital{" "}
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                className="inline-block"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 animate-gradient">
                  Workspace
                </span>
              </MotionDiv>{" "}
              in the Cloud
            </h1>
          </MotionDiv>
        }
        subtitle={
          <MotionDiv animation="slideUp" delay={0.5} className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl">
            Create and organize your notes with our powerful editor. Featuring rich text, markdown support, and seamless cloud synchronization.
          </MotionDiv>
        }
        illustration={
          <div className="perspective-1000 transform-gpu">
            <div className="w-full h-full flex justify-end items-center relative">
              <div className="absolute w-64 h-64 rounded-full bg-blue-500/10 blur-3xl -top-20 -right-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
              <div className="absolute w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl bottom-10 right-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
              
              <MotionDiv
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.6,
                  type: "spring",
                  stiffness: 70
                }}
                className="relative"
                whileHover={{ 
                  y: -15,
                  rotateZ: -2,
                  transition: { 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 150
                  }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-50 animate-pulse" style={{ animationDuration: '3s' }}></div>
                <div className="relative bg-white border border-slate-200 backdrop-blur-sm rounded-xl p-6 shadow-2xl w-[450px] max-w-full transform transition-transform duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                    <div className="flex items-center">
                      <MotionDiv whileHover={{ scale: 1.2 }} className="h-3 w-3 rounded-full bg-red-500 mr-2">&nbsp;</MotionDiv>
                      <MotionDiv whileHover={{ scale: 1.2 }} className="h-3 w-3 rounded-full bg-yellow-500 mr-2">&nbsp;</MotionDiv>
                      <MotionDiv whileHover={{ scale: 1.2 }} className="h-3 w-3 rounded-full bg-green-500">&nbsp;</MotionDiv>
                    </div>
                    <div className="text-xs text-slate-500">Notes.app</div>
                  </div>
                  <div className="space-y-3">
                    <MotionDiv
                      initial={{ width: "0%" }}
                      animate={{ width: "75%" }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                      className="h-6 bg-slate-100/70 rounded"
                    >&nbsp;</MotionDiv>
                    <MotionDiv
                      initial={{ width: "0%" }}
                      animate={{ width: "83%" }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="h-4 bg-slate-100/50 rounded"
                    >&nbsp;</MotionDiv>
                    <MotionDiv
                      initial={{ width: "0%" }}
                      animate={{ width: "50%" }}
                      transition={{ delay: 1.4, duration: 0.6 }}
                      className="h-4 bg-slate-100/50 rounded"
                    >&nbsp;</MotionDiv>
                    <MotionDiv
                      initial={{ width: "0%" }}
                      animate={{ width: "80%" }}
                      transition={{ delay: 1.6, duration: 0.6 }}
                      className="h-4 bg-slate-100/50 rounded"
                    >&nbsp;</MotionDiv>
                    <MotionDiv
                      initial={{ width: "0%" }}
                      animate={{ width: "67%" }}
                      transition={{ delay: 1.8, duration: 0.6 }}
                      className="h-4 bg-slate-100/50 rounded"
                    >&nbsp;</MotionDiv>
                    <MotionDiv
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.0, duration: 0.6 }}
                      className="h-20 w-full bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded mt-4"
                    >&nbsp;</MotionDiv>
                  </div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-tl-[100px]"></div>
                </div>
              </MotionDiv>
            </div>
          </div>
        }
        primaryAction={
          isAuthenticated ? (
            <Link href="/notes" className="block">
              <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-6 rounded-xl font-medium text-lg shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                  <MotionDiv
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center"
                  >
                    Open My Notes
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </MotionDiv>
                </Button>
              </MotionDiv>
            </Link>
          ) : (
            <Link href="/login" className="block">
              <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-6 rounded-xl font-medium text-lg shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                  <MotionDiv
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center"
                  >
                    Get Started Free
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </MotionDiv>
                </Button>
              </MotionDiv>
            </Link>
          )
        }
        secondaryAction={
          isAuthenticated ? (
            <Link href="/notes/new">
              <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 px-8 py-6 rounded-xl font-medium text-lg transition-colors duration-300">
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Create New Note
                  </MotionDiv>
                </Button>
              </MotionDiv>
            </Link>
          ) : (
            <Link href="/register">
              <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 px-8 py-6 rounded-xl font-medium text-lg transition-colors duration-300">
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Learn More
                  </MotionDiv>
                </Button>
              </MotionDiv>
            </Link>
          )
        }
        contentClassName="lg:w-1/2 lg:pr-0 lg:pl-8 z-10"
        illustrationClassName="z-0"
      />
    </section>
  );
}