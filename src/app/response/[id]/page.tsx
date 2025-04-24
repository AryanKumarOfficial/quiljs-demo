"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import the markdown component to avoid SSR issues
const ReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 h-40 rounded"></div>
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
        if (!window.confirm('Are you sure you want to delete this response?')) return;

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
            });

            // Redirect to responses list after successful deletion
            setTimeout(() => {
                router.push('/response');
            }, 1500);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete response', {
                duration: 4000,
            });
            console.error('Error deleting response:', err);
        } finally {
            setDeleteLoading(false);
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

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !response) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error || 'Response not found'}</p>
                    <div className="mt-4">
                        <Link
                            href="/response"
                            className="text-blue-600 hover:underline font-medium flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                            Back to responses
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href="/response"
                    className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to All Responses
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{response.title}</h1>
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {response.tag}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Created: {formatDate(response.createdAt)}
                        </p>
                        <p className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Using: {response.editorType === 'advanced' ? 'Rich Text Editor' : 'Markdown Editor'}
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
                        <div className={`prose prose-lg max-w-none ${response.editorType === 'markdown' ? 'markdown-content' : 'rich-text-content'}`}>
                            {response.editorType === 'advanced' ? (
                                <div dangerouslySetInnerHTML={{ __html: response.description }} />
                            ) : (
                                <ReactMarkdown>{response.description}</ReactMarkdown>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                    <Link
                        href={`/response/edit/${response.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {deleteLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>

            <Toaster />
        </section>
    );
}