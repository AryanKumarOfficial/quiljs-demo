"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import the markdown component to avoid SSR issues
const ReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 h-40 rounded-md"></div>
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

export default function ResponseDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = (params);

    const [response, setResponse] = useState<Response | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

    // Function to determine tag color 
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

    // Fetch response details
    useEffect(() => {
        const fetchResponse = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/responses/${id}`);
                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.error || 'Failed to fetch response details');
                }

                setResponse(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching response:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchResponse();
        }
    }, [id]);

    // Handle response deletion
    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            const res = await fetch(`/api/responses/${id}`, {
                method: 'DELETE',
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to delete response');
            }

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
                iconTheme: {
                    primary: '#22C55E',
                    secondary: '#DCFCE7',
                },
            });

            // Redirect to responses list after successful deletion
            setTimeout(() => {
                router.push('/response');
            }, 1000);
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
                iconTheme: {
                    primary: '#DC2626',
                    secondary: '#FEE2E2',
                },
            });
            console.error('Error deleting response:', err);
        } finally {
            setDeleteLoading(false);
            setShowConfirmDelete(false);
        }
    };

    // Format date
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

    // Loading state UI
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 right-0 bottom-0 left-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                        <div className="absolute top-2 right-2 bottom-2 left-2 animate-ping rounded-full bg-blue-500 opacity-40 delay-100"></div>
                        <div className="absolute top-4 right-4 bottom-4 left-4 animate-ping rounded-full bg-blue-600 opacity-60 delay-200"></div>
                        <div className="absolute top-6 right-6 bottom-6 left-6 animate-ping rounded-full bg-blue-700 opacity-80 delay-300"></div>
                        <div className="absolute top-8 right-8 bottom-8 left-8 rounded-full bg-blue-800"></div>
                    </div>
                    <p className="mt-6 text-slate-600 font-medium">Loading response details...</p>
                </div>
            </div>
        );
    }

    // Error state UI
    if (error || !response) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-red-800">Error Loading Response</h2>
                            <p className="text-red-700">{error || 'Response not found'}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 ml-11">
                        <Link
                            href="/response"
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors font-medium flex items-center gap-2 w-fit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to responses
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                        </div>
                        
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete this response? This action cannot be undone.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                {deleteLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                        Delete Response
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
                <div className="mb-6 flex items-center">
                    <Link
                        href="/response"
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 group font-medium"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <path d="M12 19l-7-7 7-7"></path>
                        </svg>
                        Back to All Responses
                    </Link>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-gray-100">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">{response.title}</h1>
                                <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full border ${getTagColor(response.tag)}`}>
                                    {response.tag}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    <span>Created: {formatDate(response.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {response.editorType === 'advanced' ? (
                                            <>
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M7 15L2.8 19.2a1 1 0 0 0 -.3.7V21a1 1 0 0 0 1 1h1.1a1 1 0 0 0 .7-.3L9.5 18"></path>
                                                <path d="M9 9h6"></path>
                                                <path d="M9 13h6"></path>
                                                <path d="M11 17h2"></path>
                                                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                            </>
                                        )}
                                    </svg>
                                    <span>Using: {response.editorType === 'advanced' ? 'Rich Text Editor' : 'Markdown Editor'}</span>
                                </div>
                                {response.updatedAt !== response.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        <span>Updated: {formatDate(response.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className={`prose prose-lg max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-800 
                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg 
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-500
                            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-0.5 prose-blockquote:px-4 
                            prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                            ${response.editorType === 'markdown' ? 'markdown-content' : 'rich-text-content'}`}
                        >
                            {response.editorType === 'advanced' ? (
                                <div dangerouslySetInnerHTML={{ __html: response.description }} />
                            ) : (
                                <ReactMarkdown>{response.description}</ReactMarkdown>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                        <Link
                            href={`/response/edit/${response.id}`}
                            className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit Response
                        </Link>
                        <button
                            onClick={() => setShowConfirmDelete(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete Response
                        </button>
                    </div>
                </motion.div>
            </section>

            <Toaster />
        </>
    );
}