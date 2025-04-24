"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});

interface Response {
  title: string;
  tag: string;
  description: string;
  editorType: "advanced" | "markdown";
  timestamp?: number;
}

export default function ResponsePage() {
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    try {
      const storedResponses = localStorage.getItem("responses");
      if (storedResponses) {
        setResponses(JSON.parse(storedResponses));
      }
    } catch (error) {
      console.error("Error fetching responses from localStorage", error);
    }
  }, []);

  const handleDelete = (index: number) => {
    try {
      const updated = responses.filter((_, i) => i !== index);
      localStorage.setItem("responses", JSON.stringify(updated));
      setResponses(updated);
    } catch (error) {
      console.error("Error deleting response", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Responses</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium transition hover:bg-blue-700"
        >
          Back to Form
        </Link>
      </div>
      
      {responses.length === 0 ? (
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow p-8 text-center">
          <p className="text-gray-600">No responses yet. Add your first response from the form.</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {responses.map((response, index) => (
            <li
              key={index}
              className="bg-white bg-opacity-80 backdrop-blur-md border border-white border-opacity-40 rounded-xl shadow p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{response.title}</h2>
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {response.tag}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Editor type: {response.editorType === "advanced" ? "Rich Text" : "Markdown"}
                </p>
                
                {response.editorType === "advanced" ? (
                  <div 
                    className="prose max-w-none p-4 bg-gray-50 rounded-md"
                    dangerouslySetInnerHTML={{ __html: response.description }}
                  />
                ) : (
                  <div className="prose max-w-none p-4 bg-gray-50 rounded-md">
                    <ReactMarkdown>{response.description}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
