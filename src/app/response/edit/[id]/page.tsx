"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import AdvancedEditor from "@/components/BareEditor";
import MarkdownEditor from "@/components/MarkdownEditor";

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
      <div className="max-w-3xl mx-auto p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          <h3 className="font-medium">Error</h3>
          <p>{fetchError}</p>
        </div>
        <Link
          href="/response"
          className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Responses
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/response/${id}`}
          className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Response
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit Response</h1>

      {/* Editor Type Selection */}
      <div className="relative w-fit mb-8 bg-gray-100 p-1 rounded-lg shadow-sm flex">
        <div 
          className={`absolute transition-all duration-200 top-1 bottom-1 ${editorType === "advanced" ? "left-1 right-[calc(50%+1px)]" : "left-[calc(50%+1px)] right-1"} bg-white rounded-md shadow-sm z-0`}
        ></div>
        <button
          type="button"
          onClick={() => setEditorType("advanced")}
          className={`relative z-10 px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
            editorType === "advanced"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
          Rich Text
        </button>
        <button
          type="button"
          onClick={() => setEditorType("markdown")}
          className={`relative z-10 px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
            editorType === "markdown"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3.75h3.75" />
          </svg>
          Markdown
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 backdrop-blur-md border border-white border-opacity-40 rounded-xl shadow-lg p-8 flex flex-col gap-6 transition-shadow hover:shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-medium flex items-center gap-1">
            Title
            <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`w-full p-3 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="text-red-500 text-sm mt-1">
              {errors.title}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tag" className="font-medium flex items-center gap-1">
            Tag
            <span className="text-red-500">*</span>
          </label>
          <input
            id="tag"
            name="tag"
            value={form.tag}
            onChange={handleChange}
            className={`w-full p-3 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tag ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={!!errors.tag}
            aria-describedby={errors.tag ? "tag-error" : undefined}
          />
          {errors.tag && (
            <p id="tag-error" className="text-red-500 text-sm mt-1">
              {errors.tag}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="editor" className="font-medium flex items-center gap-1">
            Description
            <span className="text-red-500">*</span>
          </label>
          <div
            className={`editor-wrapper w-full mb-4 border rounded-md overflow-hidden ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          >
            {editorType === "advanced" ? (
              <AdvancedEditor value={editorValue} onChange={handleEditorChange} />
            ) : (
              <MarkdownEditor value={editorValue} onChange={handleEditorChange} />
            )}
          </div>
          {errors.description && (
            <p id="content-error" className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href={`/response/${id}`}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold transition hover:bg-gray-300 flex items-center gap-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saveLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>

      <Toaster />
    </section>
  );
}