"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => <p>Loading markdown...</p>,
});

interface ResponseItem {
  title: string;
  tag: string;
  description: string;
  editorType: "advanced" | "markdown";
}

export default function Responses() {
  const [responses, setResponses] = useState<ResponseItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("responses");
    if (stored) {
      setResponses(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (index: number) => {
    const updated = responses.filter((_, i) => i !== index);
    setResponses(updated);
    localStorage.setItem("responses", JSON.stringify(updated));
  };

  const clearAll = () => {
    localStorage.removeItem("responses");
    setResponses([]);
  };

  const renderContent = (response: ResponseItem) =>
    response.editorType === "markdown" ? (
      <div className="markdown-content prose prose-sm max-w-full">
        <ReactMarkdown>{response.description}</ReactMarkdown>
      </div>
    ) : (
      <div
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: response.description }}
      />
    );

  return (
    <section className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Responses</h2>

      {responses.length === 0 ? (
        <p className="text-center text-gray-500">No responses yet.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {responses.map((resp, idx) => (
            <li key={idx}>
              <div className="bg-white bg-opacity-80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{resp.title}</h3>
                  <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                    {resp.tag}
                  </span>
                </div>
                <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {resp.editorType === "markdown" ? "Markdown" : "Rich Text"}
                </span>
                <div className="mt-2">{renderContent(resp)}</div>
                <button
                  onClick={() => handleDelete(idx)}
                  className="self-end px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={clearAll}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
        >
          Clear All
        </button>
        <Link href="/"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}
