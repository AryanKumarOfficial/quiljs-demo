"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import ReactMarkdown to avoid SSR issues
const ReactMarkdown = dynamic(() => import('react-markdown'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-10 w-full rounded"></div>
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

  return (
    <section className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Saved Responses</h1>
        <Link 
          href="/" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No responses yet</h2>
          <p className="text-gray-600 mb-4">Create your first response to see it here</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Response
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {responses.map((response) => (
            <div
              key={response.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition rounded-lg overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800 break-words pr-2">{response.title}</h2>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">
                    {response.tag}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(response.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Editor: {response.editorType === 'advanced' ? 'Rich Text' : 'Markdown'}
                  </p>
                </div>
                <div className="prose prose-sm max-h-40 overflow-hidden text-gray-600 mb-4">
                  {response.editorType === 'advanced' ? (
                    <div dangerouslySetInnerHTML={{ __html: response.description.slice(0, 200) }} />
                  ) : (
                    <div className="markdown-preview">
                      <ReactMarkdown>
                        {response.description.length > 200 
                          ? response.description.slice(0, 200) + '...' 
                          : response.description
                        }
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                <Link
                  href={`/response/${response.id}`}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(response.id)}
                  disabled={deleteLoading === response.id}
                  className="text-sm text-red-600 hover:underline font-medium flex items-center"
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
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Toaster />
    </section>
  );
}
