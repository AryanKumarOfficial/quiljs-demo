"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import AdvancedEditor from "@/components/BareEditor";
import MarkdownEditor from "@/components/MarkdownEditor";

interface FormData {
  title: string;
  tag: string;
}

type EditorType = "advanced" | "markdown";

export default function Home() {
  const [editorValue, setEditorValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editorType, setEditorType] = useState<EditorType>("advanced");
  const [form, setForm] = useState<FormData>({ title: "", tag: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.tag || !editorValue) {
      alert("Please fill in all fields");
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
      };
      const updated = stored ? [...JSON.parse(stored), newEntry] : [newEntry];
      localStorage.setItem("responses", JSON.stringify(updated));
      setForm({ title: "", tag: "" });
      setEditorValue("");
    } catch (error) {
      console.error("Error saving to localStorage", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Simple Form with Rich Text Editors</h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => { setEditorType("advanced"); setEditorValue(""); }}
          className={
            `px-4 py-2 rounded-md transition ${editorType === "advanced"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          Rich Text Editor
        </button>
        <button
          onClick={() => { setEditorType("markdown"); setEditorValue(""); }}
          className={
            `px-4 py-2 rounded-md transition ${editorType === "markdown"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          Markdown Editor
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 backdrop-blur-md border border-white border-opacity-40 rounded-xl shadow-lg p-8 flex flex-col gap-6 transition-shadow hover:shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-medium">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="tag" className="font-medium">Tag</label>
          <input
            id="tag"
            name="tag"
            value={form.tag}
            onChange={handleChange}
            className="w-full p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="editor" className="font-medium">Description</label>
          {editorType === "advanced" ? (
            <AdvancedEditor value={editorValue} onChange={setEditorValue} />
          ) : (
            <MarkdownEditor value={editorValue} onChange={setEditorValue} />
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold transition hover:bg-blue-700 disabled:opacity-50 mx-auto"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
}
