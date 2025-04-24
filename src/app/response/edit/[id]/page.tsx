"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import AdvancedEditor from "@/components/BareEditor";
import MarkdownEditor from "@/components/MarkdownEditor";
import { motion } from "framer-motion";

interface FormData {
  title: string;
  tag: string;
}

type EditorType = "advanced" | "markdown";

interface FormErrors {
  title?: string;
  tag?: string;
  description?: string;
}

export default function EditResponsePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [editorValue, setEditorValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [editorType, setEditorType] = useState<EditorType>("advanced");
  const [form, setForm] = useState<FormData>({ title: "", tag: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch response data to edit
  useEffect(() => {
    const fetchResponse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/responses/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch response");
        }

        const responseData = result.data;
        setForm({
          title: responseData.title,
          tag: responseData.tag,
        });
        setEditorValue(responseData.description);
        setEditorType(responseData.editorType);
      } catch (error) {
        console.error("Error fetching response:", error);
        setFetchError(error instanceof Error ? error.message : "Failed to load response");
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [id]);

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
      newErrors.description = "Description is required";
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
        position: "top-center",
        style: {
          background: "#FEE2E2",
          color: "#B91C1C",
          border: "1px solid #F87171",
          padding: "16px",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#DC2626",
          secondary: "#FEE2E2",
        },
      });
      return;
    }

    try {
      setSaveLoading(true);
      
      const response = await fetch(`/api/responses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(result.error || "Something went wrong");
      }

      toast.success("Your response has been updated successfully!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#DCFCE7",
          color: "#166534",
          border: "1px solid #86EFAC",
          padding: "16px",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#22C55E",
          secondary: "#DCFCE7",
        },
      });

      // Navigate back to the response details page
      setTimeout(() => {
        router.push(`/response/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error updating response:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#FEE2E2",
          color: "#B91C1C",
          border: "1px solid #F87171",
          padding: "16px",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#DC2626",
          secondary: "#FEE2E2",
        },
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

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

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl shadow-sm mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-800">Error Loading Response</h2>
              <p className="text-red-700">{fetchError}</p>
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
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      <div className="mb-6 flex items-center">
        <Link
          href={`/response/${id}`}
          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 group font-medium"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Response
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
            Edit Response
          </h1>
          <p className="text-slate-500 mt-2">
            Update your response details and content
          </p>
        </div>

        {/* Editor Switch UI */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-slate-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Editor Type</label>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex w-fit">
            <button
              type="button"
              onClick={() => setEditorType("advanced")}
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
              onClick={() => setEditorType("markdown")}
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
          <p className="text-xs text-gray-500 mt-2">
            Changing editor type will preserve your content but might affect formatting.
          </p>
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
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
              >
                {editorType === "advanced" ? (
                  <AdvancedEditor value={editorValue} onChange={handleEditorChange} />
                ) : (
                  <MarkdownEditor value={editorValue} onChange={handleEditorChange} />
                )}
              </div>
              {errors.description && (
                <p id="content-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        
          <div className="flex flex-wrap-reverse sm:flex-nowrap gap-3 justify-between mt-8 sm:mt-10">
            <Link 
              href={`/response/${id}`}
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
              disabled={saveLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none font-medium text-sm"
            >
              {saveLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.5 5.25l-7.5 7.5-7.5-7.5"></path>
                    <path d="M19.5 12.75l-7.5 7.5-7.5-7.5"></path>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <Toaster />
    </section>
  );
}