"use client";

import React, { useState, FormEvent, ChangeEvent, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import AdvancedEditor from "@/components/BareEditor";
import MarkdownEditor from "@/components/MarkdownEditor";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

interface FormData {
  title: string;
  tag: string;
}

type EditorType = "advanced" | "markdown";

interface FormErrors {
  title?: string;
  tag?: string;
  content?: string;
}

export default function NewResponsePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [editorValue, setEditorValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [editorType, setEditorType] = useState<EditorType>("advanced");
  const [form, setForm] = useState<FormData>({ title: "", tag: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  // Form validation
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!form.tag.trim()) {
      newErrors.tag = "Tag is required";
      isValid = false;
    }

    if (!editorValue.trim()) {
      newErrors.content = "Description is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields", {
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
        }
      });
      return;
    }
    
    try {
      setLoading(true);

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          tag: form.tag,
          description: editorValue,
          editorType,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
      
      // Show success notification
      toast.success("Your response has been saved successfully!", {
        duration: 4000,
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
        }
      });
      
      // Redirect to responses page
      router.push('/response');
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.", {
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
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  return (
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Create New Response
          </h1>
          <p className="text-slate-500 mt-2">
            Fill out the form below to create a new response using your preferred editor.
          </p>
        </div>

        {/* Editor Switch UI */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-slate-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Editor Type</label>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex w-fit">
            <button
              type="button"
              onClick={() => { setEditorType("advanced"); setEditorValue(""); }}
              className={`relative z-10 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                editorType === "advanced"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Rich Text
            </button>
            <button
              type="button"
              onClick={() => { setEditorType("markdown"); setEditorValue(""); }}
              className={`relative z-10 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                editorType === "markdown"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 15L2.8 19.2a1 1 0 0 0 -.3.7V21a1 1 0 0 0 1 1h1.1a1 1 0 0 0 .7-.3L9.5 18"></path>
                <path d="M9 9h6"></path>
                <path d="M9 13h6"></path>
                <path d="M11 17h2"></path>
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              </svg>
              Markdown
            </button>
          </div>
        </div>
      
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter a title for your response"
                className={`w-full px-4 py-2.5 text-base bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.title}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                Tag <span className="text-red-500">*</span>
              </label>
              <input
                id="tag"
                name="tag"
                value={form.tag}
                onChange={handleChange}
                placeholder="e.g. work, personal, idea"
                className={`w-full px-4 py-2.5 text-base bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.tag ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                aria-invalid={!!errors.tag}
                aria-describedby={errors.tag ? "tag-error" : undefined}
              />
              {errors.tag && (
                <p id="tag-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.tag}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1.5">
                Tags help you categorize and find your responses easily.
              </p>
            </div>
            
            <div>
              <label htmlFor="editor" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <div 
                className={`editor-wrapper w-full border rounded-lg overflow-hidden shadow-sm transition-colors ${
                  errors.content ? "border-red-300" : "border-gray-300"
                }`}
              >
                {editorType === "advanced" ? (
                  <AdvancedEditor value={editorValue} onChange={handleEditorChange} />
                ) : (
                  <MarkdownEditor value={editorValue} onChange={handleEditorChange} />
                )}
              </div>
              {errors.content && (
                <p id="content-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.content}
                </p>
              )}
            </div>
          </div>
        
          <div className="flex flex-wrap-reverse sm:flex-nowrap gap-3 justify-between mt-8 sm:mt-10">
            <Link 
              href="/response"
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto font-medium text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading || isPending}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none font-medium text-sm"
            >
              {(loading || isPending) ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Response...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save Response
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Toast container for notifications */}
      <Toaster />
    </section>
  );
}