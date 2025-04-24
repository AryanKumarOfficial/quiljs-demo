"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/ui/hero";
import { MotionDiv } from "@/components/ui/motion-div";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  // Illustration for Hero section
  const HeroIllustration = () => (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-0 bg-blue-500 rounded-full opacity-5 blur-3xl transform scale-150" />
      <div className="relative">
        <svg
          viewBox="0 0 400 300"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <rect x="60" y="30" width="280" height="180" rx="10" fill="#f0f4ff" stroke="#4f46e5" strokeWidth="2" />
          <rect x="80" y="50" width="240" height="20" rx="2" fill="#e0e7ff" />
          <rect x="80" y="80" width="180" height="10" rx="2" fill="#c7d2fe" />
          <rect x="80" y="100" width="220" height="10" rx="2" fill="#c7d2fe" />
          <rect x="80" y="120" width="160" height="10" rx="2" fill="#c7d2fe" />
          <rect x="80" y="150" width="50" height="30" rx="4" fill="#4f46e5" />
          <rect x="140" y="150" width="50" height="30" rx="4" fill="white" stroke="#4f46e5" strokeWidth="1" />
          <path d="M30,260 C80,230 140,280 200,240 C260,200 320,260 370,220" stroke="#4f46e5" strokeWidth="3" fill="none" />
        </svg>
      </div>
    </div>
  );

  // Define proper interface for FeatureCard props
  interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
  }

  // Feature card component
  const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
    <MotionDiv
      animation="slideUp"
      delay={delay}
      className="relative p-6 bg-white rounded-xl shadow-md hover-lift glass-card"
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 bg-gradient-to-bl from-blue-600 to-indigo-600 rounded-full opacity-10" />
      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </MotionDiv>
  );

  // Features section component
  const Features = () => (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Powerful Rich Text Editing
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Create, edit, and manage your rich text content with powerful tools
          </p>
        </div>
        
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Rich Text Editing"
            description="Robust WYSIWYG editor with formatting controls, media embedding, and more."
            delay={0.1}
          />
          
          <FeatureCard
            icon={
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            }
            title="Markdown Support"
            description="Write in Markdown and see real-time preview. Perfect for developers."
            delay={0.3}
          />
          
          <FeatureCard
            icon={
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            }
            title="Secure Storage"
            description="All your responses are securely stored and accessible only to you."
            delay={0.5}
          />
        </div>
      </div>
    </section>
  );

  // CTA section component
  const CTASection = () => (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden relative my-20 mx-4 sm:mx-8">
      <div className="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="dots-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-pattern)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of users already creating rich content with our editor.
          </p>
          <div className="mt-8 flex justify-center">
            <GradientButton
              asChild
              variant="default"
              size="lg"
              className="text-base font-semibold shadow-xl"
            >
              <Link href={isAuthenticated ? "/response/new" : "/register"}>
                {isAuthenticated ? "Create New Response" : "Sign Up for Free"}
              </Link>
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <Hero
        title="Create Beautiful Rich Text Content With Ease"
        subtitle="A powerful editor for crafting rich text and markdown responses. Perfect for content creators, developers, and writers."
        primaryActionLabel={isAuthenticated ? "Create Response" : "Get Started"}
        secondaryActionLabel={isAuthenticated ? "View Responses" : "Learn More"}
        onPrimaryAction={() => router.push(isAuthenticated ? "/response/new" : "/register")}
        onSecondaryAction={() => {
          if (isAuthenticated) {
            router.push("/response");
          } else {
            // Scroll to features section
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        backgroundPattern="dots"
        illustration={<HeroIllustration />}
      />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>
      
      {/* Authenticated User Dashboard Preview */}
      {isAuthenticated && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionDiv animation="fadeIn" className="glass-card rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hello, {session?.user?.name || 'User'}</h2>
                    <p className="text-gray-600">Here's your personalized dashboard</p>
                  </div>
                  <GradientButton
                    asChild
                    className="mt-4 sm:mt-0"
                  >
                    <Link href="/response/new">Create New</Link>
                  </GradientButton>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="border border-gray-200 bg-white/80 rounded-xl p-5 hover-lift">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Recent Responses</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Access your content</h3>
                    <p className="text-gray-600 text-sm mb-4">View and edit your recent responses</p>
                    <Link href="/response" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View all responses →
                    </Link>
                  </div>
                  
                  <div className="border border-gray-200 bg-white/80 rounded-xl p-5 hover-lift">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">New Content</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Create new content</h3>
                    <p className="text-gray-600 text-sm mb-4">Choose between rich text and markdown editors</p>
                    <Link href="/response/new" className="text-sm font-medium text-purple-600 hover:text-purple-800">
                      Create new response →
                    </Link>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      {!isAuthenticated && <CTASection />}
      
      {/* Footer information */}
      <section className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Rich Text Editor Application. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
