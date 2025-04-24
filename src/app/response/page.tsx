"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

// Dynamically import ReactMarkdown to avoid SSR issues
const ReactMarkdown = dynamic(() => import('react-markdown'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-100 h-10 w-full rounded"></div>
});

interface Response {
  id: string;
  title: string;
  tag: string;
  description: string;
  editorType: 'advanced' | 'markdown';
  createdAt: string;
  updatedAt: string;
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { data: session } = useSession();

  // Fetch responses from the API
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch('/api/responses');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch responses');
        }

        setResponses(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching responses');
        console.error('Error fetching responses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  // Handle response deletion
  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/responses/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete response');
      }

      // Update the local state by removing the deleted response
      setResponses(prev => prev.filter(response => response.id !== id));
      
      toast.success('Response deleted successfully', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#DCFCE7',
          color: '#166534',
          border: '1px solid #86EFAC',
          padding: '16px',
          fontWeight: '500',
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete response', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #F87171',
          padding: '16px',
          fontWeight: '500',
        },
      });
      console.error('Error deleting response:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to determine text color based on tag name for visual variety
  const getTagColor = (tag: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
    ];
    
    // Simple hash function to consistently assign a color to a tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = ((hash << 5) - hash) + tag.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getTypeIcon = (type: string) => {
    return type === 'advanced' ? (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ) : (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 15L2.8 19.2a1 1 0 0 0 -.3.7V21a1 1 0 0 0 1 1h1.1a1 1 0 0 0 .7-.3L9.5 18"></path>
        <path d="M9 9h6"></path>
        <path d="M9 13h6"></path>
        <path d="M11 17h2"></path>
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      </svg>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Your Responses
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and view all your saved responses
          </p>
        </div>
        
        <Link 
          href="/response/new" 
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Response
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 right-0 bottom-0 left-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
            <div className="absolute top-2 right-2 bottom-2 left-2 animate-ping rounded-full bg-blue-500 opacity-40 delay-100"></div>
            <div className="absolute top-4 right-4 bottom-4 left-4 animate-ping rounded-full bg-blue-600 opacity-60 delay-200"></div>
            <div className="absolute top-6 right-6 bottom-6 left-6 animate-ping rounded-full bg-blue-700 opacity-80 delay-300"></div>
            <div className="absolute top-8 right-8 bottom-8 left-8 rounded-full bg-blue-800"></div>
          </div>
          <p className="text-slate-600 mt-8 font-medium">Loading your responses...</p>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl shadow-sm text-red-700 px-6 py-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-800">Error Loading Responses</h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4 ml-11">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Retry
            </button>
          </div>
        </motion.div>
      ) : responses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-xl shadow-xl p-10 text-center max-w-2xl mx-auto"
        >
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your First Response</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">You haven't created any responses yet. Start by creating your first rich text or markdown response.</p>
          <Link 
            href="/response/new"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create First Response
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-blue-100 group"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-800 break-words pr-2 group-hover:text-blue-700 transition-colors">
                    {response.title}
                  </h2>
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${getTagColor(response.tag)}`}>
                    {response.tag}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {getTypeIcon(response.editorType)}
                    <span>{response.editorType === 'advanced' ? 'Rich Text' : 'Markdown'}</span>
                  </div>
                </div>
                
                <div className="h-32 overflow-hidden relative">
                  <div className="prose prose-sm text-gray-600 prose-p:my-1 line-clamp-4">
                    {response.editorType === 'advanced' ? (
                      <div dangerouslySetInnerHTML={{ __html: response.description.slice(0, 250) }} />
                    ) : (
                      <div className="markdown-preview">
                        <ReactMarkdown>
                          {response.description.length > 250 
                            ? response.description.slice(0, 250)
                            : response.description
                          }
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                </div>
              </div>
              <div className="px-5 py-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center transition-colors group-hover:bg-blue-50">
                <Link
                  href={`/response/${response.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </Link>
                <div className="flex gap-3">
                  <Link
                    href={`/response/edit/${response.id}`}
                    className="text-sm text-slate-600 hover:text-green-600 transition-colors font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    </svg>
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(response.id)}
                    disabled={deleteLoading === response.id}
                    className="text-sm text-slate-600 hover:text-red-600 transition-colors font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    {deleteLoading === response.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <Toaster />
    </section>
  );
}
