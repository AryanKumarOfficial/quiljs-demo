"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BareEditor from "./BareEditor";
import MarkdownEditor from "./MarkdownEditor";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { INote } from "@/models/Note";
import { FiSave, FiTag, FiShare2, FiTrash2, FiStar, FiPaperclip } from "react-icons/fi";
import toast from "react-hot-toast";

interface NotesEditorProps {
  note?: INote;
  isNew?: boolean;
}

export default function NotesEditor({ note, isNew = false }: NotesEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title || "Untitled Note");
  const [content, setContent] = useState(note?.content || "");
  const [editorType, setEditorType] = useState<"rich" | "markdown" | "simple">(
    note?.editorType || "rich"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [folder, setFolder] = useState(note?.folder || "Default");
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  const [tagInput, setTagInput] = useState("");

  // Get the note ID - could be either id or _id depending on how MongoDB data is processed
  const getNoteId = () => note?._id || note?.id;

  // Save the note
  const saveNote = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setIsSaving(true);
    
    try {
      const noteData = {
        title,
        content,
        editorType,
        tags,
        folder,
        isFavorite
      };
      
      const url = isNew 
        ? "/api/notes" 
        : `/api/notes/${getNoteId()}`;
      
      const method = isNew ? "POST" : "PUT";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save note");
      }
      
      const savedNote = await response.json();
      
      if (isNew) {
        router.replace(`/notes/${savedNote._id || savedNote.id}`);
      } else {
        toast.success("Note saved successfully");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete the note
  const deleteNote = async () => {
    const noteId = getNoteId();
    if (!noteId || isNew) return;
    
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
      
      toast.success("Note deleted successfully");
      router.push("/notes");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete note");
    }
  };

  // Handle adding a tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isNew) return; // Don't auto-save new notes
    
    const autoSaveInterval = setInterval(() => {
      if (note && title.trim() && content !== note.content) {
        saveNote();
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [title, content, note]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none outline-none flex-grow"
          placeholder="Note Title"
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFavorite}
            className={isFavorite ? "text-yellow-500" : ""}
          >
            <FiStar />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/notes/share/${getNoteId()}`)}
            disabled={isNew || !getNoteId()}
          >
            <FiShare2 />
          </Button>
          
          <Button
            onClick={saveNote}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <FiSave /> {isSaving ? "Saving..." : "Save"}
          </Button>
          
          {!isNew && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteNote}
            >
              <FiTrash2 />
            </Button>
          )}
        </div>
      </div>

      <Card className="p-2 mb-4">
        <div className="flex gap-2 items-center">
          <FiTag className="text-gray-500" />
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="flex-grow border-none outline-none text-sm"
            placeholder="Add tags (press Enter)"
          />
        </div>
      </Card>

      <div className="flex gap-2 mb-4">
        <select
          value={editorType}
          onChange={(e) => setEditorType(e.target.value as any)}
          className="border rounded-md p-1 text-sm"
        >
          <option value="rich">Rich Text</option>
          <option value="markdown">Markdown</option>
          <option value="simple">Simple</option>
        </select>
        
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="border rounded-md p-1 text-sm"
        >
          <option value="Default">Default Folder</option>
          <option value="Personal">Personal</option>
          <option value="Work">Work</option>
          <option value="Ideas">Ideas</option>
          <option value="Archive">Archive</option>
        </select>
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex-grow overflow-auto">
        {editorType === "rich" && (
          <BareEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing your note..."
          />
        )}
        {editorType === "markdown" && (
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing in markdown..."
          />
        )}
        {editorType === "simple" && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[300px] p-3 border rounded-md resize-none"
            placeholder="Start typing your plain text note..."
          />
        )}
      </div>
    </div>
  );
}