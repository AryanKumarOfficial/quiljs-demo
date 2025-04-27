"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { FiFolder, FiTag, FiStar, FiClock, FiChevronRight, FiChevronDown, FiPlus } from "react-icons/fi";

interface NotesSidebarProps {
  className?: string;
}

export default function NotesSidebar({ className = "" }: NotesSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFoldersAndTags = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/notes?limit=100");
        if (!response.ok) throw new Error("Failed to fetch notes data");
        const data = await response.json();
        
        // Extract unique folders
        const uniqueFolders = Array.from(
          new Set(data.notes.map((note: any) => note.folder))
        ).filter(Boolean) as string[];
        
        // Extract unique tags
        const uniqueTags = Array.from(
          new Set(data.notes.flatMap((note: any) => note.tags || []))
        ).filter(Boolean) as string[];
        
        setFolders(uniqueFolders);
        setTags(uniqueTags);
      } catch (error) {
        console.error("Error fetching folders and tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoldersAndTags();
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <Card className={`p-4 h-full ${className}`}>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <Link href="/notes/new">
            <Button className="w-full flex items-center justify-center gap-2">
              <FiPlus size={16} /> New Note
            </Button>
          </Link>
        </div>

        <nav className="space-y-1">
          <Link href="/notes" className={`flex items-center px-3 py-2 rounded-md ${isActive("/notes") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
            <FiClock className="mr-2" /> Recent Notes
          </Link>
          <Link href="/notes/all" className={`flex items-center px-3 py-2 rounded-md ${isActive("/notes/all") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
            <FiStar className="mr-2" /> All Notes
          </Link>
        </nav>

        <Separator className="my-4" />

        <div className="flex-grow overflow-auto">
          {/* Folders Section */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => setIsFoldersOpen(!isFoldersOpen)}
            >
              <div className="flex items-center">
                <FiFolder className="mr-2 text-blue-600" />
                <span className="font-medium">Folders</span>
              </div>
              {isFoldersOpen ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {isFoldersOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {isLoading ? (
                  <div className="text-sm text-gray-500 pl-2 py-1">Loading...</div>
                ) : folders.length > 0 ? (
                  folders.map((folder) => (
                    <Link
                      href={`/notes/all?folder=${encodeURIComponent(folder)}`}
                      key={folder}
                      className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 text-gray-700"
                    >
                      {folder}
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 pl-2 py-1">No folders</div>
                )}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => setIsTagsOpen(!isTagsOpen)}
            >
              <div className="flex items-center">
                <FiTag className="mr-2 text-green-600" />
                <span className="font-medium">Tags</span>
              </div>
              {isTagsOpen ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {isTagsOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {isLoading ? (
                  <div className="text-sm text-gray-500 pl-2 py-1">Loading...</div>
                ) : tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 px-2 py-1">
                    {tags.map((tag) => (
                      <Link
                        href={`/notes/all?tag=${encodeURIComponent(tag)}`}
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700 hover:bg-gray-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 pl-2 py-1">No tags</div>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="text-xs text-gray-500 px-3">
          <p className="mb-1">Organize your notes using folders and tags to find them easily.</p>
          <p>Tip: You can search notes using <kbd className="px-1 bg-gray-100 border rounded">⌘K</kbd></p>
        </div>
      </div>
    </Card>
  );
}