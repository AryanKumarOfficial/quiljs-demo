"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { FiStar, FiTag, FiFolder, FiClock, FiGrid, FiList } from "react-icons/fi";

interface Note {
  id: string;
  _id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: string;
  lastAccessed: string;
  editorType: string;
}

interface NotesListProps {
  notes: Note[];
  showViewToggle?: boolean;
}

export default function NotesList({ notes, showViewToggle = false }: NotesListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Function to get a snippet of the content for preview
  const getContentPreview = (content: string): string => {
    // Strip HTML for rich text content
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
  };

  if (notes.length === 0) {
    return <p className="text-gray-500 italic">No notes found</p>;
  }

  return (
    <div>
      {showViewToggle && (
        <div className="flex justify-end mb-4">
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100' : 'bg-white'}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <FiGrid />
            </button>
            <button
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100' : 'bg-white'}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
      )}

      <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}`}>
        {notes.map((note) => (
          <Link key={note.id || note._id} href={`/notes/${note.id || note._id}`}>
            <Card className={`
              h-full border p-4 hover:shadow-md transition cursor-pointer
              ${viewMode === "list" ? "flex gap-4" : "flex flex-col"}
            `}>
              <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium line-clamp-1">{note.title}</h3>
                  <div className="flex items-center gap-1">
                    {note.isFavorite && <FiStar className="text-yellow-500" />}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {getContentPreview(note.content)}
                </p>
              </div>
              
              <div className={`
                mt-auto text-xs text-gray-500
                ${viewMode === "list" ? "min-w-[180px]" : ""}
              `}>
                <div className="flex items-center gap-1 mb-1">
                  <FiClock className="text-gray-400" />
                  <span>
                    {formatDistanceToNow(new Date(note.updatedAt), { 
                      addSuffix: true 
                    })}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-1">
                  <FiFolder className="text-gray-400" />
                  <span>{note.folder}</span>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <FiTag className="text-gray-400" />
                    <div className="overflow-hidden">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="mr-1 bg-gray-100 px-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && <span>+{note.tags.length - 3}</span>}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}