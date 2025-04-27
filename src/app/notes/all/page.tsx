"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NotesList from "@/components/NotesList";
import { FiFilter, FiSearch, FiFolder, FiTag, FiChevronDown, FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AllNotesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("-updatedAt");
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch notes with filters
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (searchQuery) {
          params.append("query", searchQuery);
        }
        
        if (selectedFolder) {
          params.append("folder", selectedFolder);
        }
        
        if (selectedTag) {
          params.append("tag", selectedTag);
        }
        
        params.append("sort", sortOrder);
        params.append("limit", "100");

        const response = await fetch(`/api/notes?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        
        const data = await response.json();
        setNotes(data.notes);
        
        // Extract unique folders and tags
        if (!selectedFolder && !selectedTag) {
          const uniqueFolders = Array.from(new Set(data.notes.map((note: any) => note.folder)));
          const uniqueTags = Array.from(
            new Set(data.notes.flatMap((note: any) => note.tags || []))
          );
          setFolders(uniqueFolders as string[]);
          setTags(uniqueTags as string[]);
        }
        
      } catch (error: any) {
        toast.error(error.message || "Error fetching notes");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [status, searchQuery, selectedFolder, selectedTag, sortOrder]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFolder(null);
    setSelectedTag(null);
    setSortOrder("-updatedAt");
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your notes...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">All Notes</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <FiFilter /> Filters
            <FiChevronDown
              className={`transition-transform ${isFiltersOpen ? "rotate-180" : ""}`}
            />
          </Button>
          <Link href="/notes/new">
            <Button className="flex items-center gap-2">
              <FiPlus /> New Note
            </Button>
          </Link>
        </div>
      </div>

      {isFiltersOpen && (
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FiFolder className="text-blue-500" /> Filter by Folder
              </h3>
              <div className="flex flex-wrap gap-2 max-w-md">
                {folders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedFolder === folder
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FiTag className="text-blue-500" /> Filter by Tag
              </h3>
              <div className="flex flex-wrap gap-2 max-w-md">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedTag === tag
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Sort by</h3>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                <option value="-updatedAt">Recently Updated</option>
                <option value="-createdAt">Recently Created</option>
                <option value="-lastAccessed">Recently Accessed</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
              </select>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {(selectedFolder || selectedTag || searchQuery) && (
                <span>
                  Applied filters: {" "}
                  {selectedFolder && (
                    <span className="text-blue-600">Folder: {selectedFolder}</span>
                  )}{" "}
                  {selectedTag && (
                    <span className="text-blue-600">Tag: {selectedTag}</span>
                  )}{" "}
                  {searchQuery && (
                    <span className="text-blue-600">Search: "{searchQuery}"</span>
                  )}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
              <FiX className="mr-1" /> Clear filters
            </Button>
          </div>
        </Card>
      )}

      {isLoadingNotes ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading notes...</p>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <FiSearch size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">No notes found</h2>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedFolder || selectedTag
                ? "Try changing your search criteria or removing filters."
                : "Start creating notes to see them here."}
            </p>
            <Link href="/notes/new">
              <Button className="flex items-center gap-2">
                <FiPlus /> Create a New Note
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <NotesList notes={notes} showViewToggle={true} />
      )}
    </Container>
  );
}