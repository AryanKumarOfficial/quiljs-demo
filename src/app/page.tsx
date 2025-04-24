"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  return (
    <section className="max-w-4xl mx-auto p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center">Rich Text Editor Application</h1>
      
      <div className="bg-white bg-opacity-80 backdrop-blur-md border border-white border-opacity-40 rounded-xl shadow-lg p-8 w-full max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : isAuthenticated ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Welcome back, {session?.user?.name || 'User'}!</h2>
              <p className="text-gray-600">Create and manage your rich text responses.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                <h3 className="text-xl font-semibold mb-3 text-blue-800">Create New Response</h3>
                <p className="text-gray-600 mb-4">Use our advanced editors to create new rich text or markdown responses.</p>
                <Link href="/response" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium transition hover:bg-blue-700">
                  Create Response
                </Link>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 hover:bg-purple-100 transition">
                <h3 className="text-xl font-semibold mb-3 text-purple-800">View Your Responses</h3>
                <p className="text-gray-600 mb-4">Access all your previously created responses in one place.</p>
                <Link href="/response" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md font-medium transition hover:bg-purple-700">
                  View Responses
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-600 italic text-center">
                You now have access to your personal responses. Only you can see, edit, and manage your content.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Rich Text Editor</h2>
              <p className="text-gray-600">Sign in to start creating and managing your responses.</p>
            </div>
            
            <div className="space-y-4 py-4">
              <p className="text-gray-700">Create rich text and markdown responses with our powerful editors.</p>
              <div className="flex justify-center gap-4 mt-6">
                <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium transition hover:bg-blue-700">
                  Sign In
                </Link>
                <Link href="/register" className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium transition hover:bg-gray-700">
                  Register
                </Link>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You need to create an account to save and manage your responses.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
