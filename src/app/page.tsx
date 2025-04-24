"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import AdvancedEditor from "@/components/BareEditor";
import MarkdownEditor from "@/components/MarkdownEditor";
import toast, { Toaster } from "react-hot-toast";

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

export default function Home() {
  const [editorValue, setEditorValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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

  const handleSubmit = (e: FormEvent) => {
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
      const stored = localStorage.getItem("responses");
      const newEntry = {
        title: form.title,
        tag: form.tag,
        description: editorValue,
        editorType,
        timestamp: Date.now(),
      };
      const updated = stored ? [...JSON.parse(stored), newEntry] : [newEntry];
      localStorage.setItem("responses", JSON.stringify(updated));

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

      // Reset form
      setForm({ title: "", tag: "" });
      setEditorValue("");
      setErrors({});
    } catch (error) {
      console.error("Error saving to localStorage", error);
      toast.error("Something went wrong. Please try again.", {
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
    <section className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Simple Form with Rich Text Editors</h1>

      {/* Updated Editor Switch UI */}
      <div className="relative w-fit mx-auto mb-8 bg-gray-100 p-1 rounded-lg shadow-sm flex">
        <div
          className={`absolute transition-all duration-200 top-1 bottom-1 ${editorType === "advanced" ? "left-1 right-[calc(50%+1px)]" : "left-[calc(50%+1px)] right-1"} bg-white rounded-md shadow-sm z-0`}
        ></div>
        <button
          type="button"
          onClick={() => { setEditorType("advanced"); setEditorValue(""); }}
          className={`relative z-10 px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${editorType === "advanced"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
            } cursor-pointer`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
          Rich Text
        </button>
        <button
          type="button"
          onClick={() => { setEditorType("markdown"); setEditorValue(""); }}
          className={`relative z-10 px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${editorType === "markdown"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
            } cursor-pointer`}
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
            className={`w-full p-3 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"
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
            className={`w-full p-3 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tag ? "border-red-500" : "border-gray-300"
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
            className={`editor-wrapper w-full mb-4 border rounded-md overflow-hidden ${errors.content ? "border-red-500" : "border-gray-300"
              }`}
          >
            {editorType === "advanced" ? (
              <AdvancedEditor value={editorValue} onChange={handleEditorChange} />
            ) : (
              <MarkdownEditor value={editorValue} onChange={handleEditorChange} />
            )}
          </div>
          {errors.content && (
            <p id="content-error" className="text-red-500 text-sm mt-1">
              {errors.content}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold transition hover:bg-blue-700 disabled:opacity-50 mx-auto flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : "Save Response"}
        </button>
      </form>

      {/* Toast container for notifications */}
      <Toaster />
    </section>
  );
}
