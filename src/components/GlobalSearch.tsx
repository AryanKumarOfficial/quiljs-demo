"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiFile, FiX, FiClock } from "react-icons/fi";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface SearchResult {
  id: string;
  _id: string;
  title: string;
  snippet: string;
  updatedAt: string;
  folder: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Handle parsing error
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updated = [
      searchTerm,
      ...recentSearches.filter(term => term !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close search with Escape
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/notes/search?q=${encodeURIComponent(query)}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setResults(data.notes);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle keyboard navigation in results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    saveRecentSearch(query);
    router.push(`/notes/${result.id || result._id}`);
    setIsOpen(false);
  };

  const handleSearchClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <div>
          <p className="px-4 py-2 text-xs text-gray-500">Search results</p>
          {results.map((result, index) => (
            <div
              key={result.id || result._id}
              className={`px-4 py-3 cursor-pointer ${
                selectedIndex === index ? "bg-blue-50" : ""
              }`}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start">
                <div className="mt-0.5 mr-3 text-blue-500">
                  <FiFile />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {result.title || "Untitled Note"}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {result.snippet}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {result.folder}
                    </p>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <p className="text-xs text-gray-500">
                      {formatDate(result.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (query.trim() && !isLoading) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      );
    }

    if (recentSearches.length > 0) {
      return (
        <div>
          <p className="px-4 py-2 text-xs text-gray-500">Recent searches</p>
          {recentSearches.map((term) => (
            <div
              key={term}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => handleSearchClick(term)}
            >
              <FiClock className="text-gray-400 mr-2" />
              <span className="text-gray-700">{term}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Type to search your notes</p>
        <p className="text-xs text-gray-400 mt-1">
          Search by title, content, or tags
        </p>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="w-[260px] justify-between text-gray-500 bg-white hover:bg-gray-50"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <FiSearch className="mr-2" />
          <span>Search notes...</span>
        </div>
        <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-gray-100 px-1.5 text-xs text-gray-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
      <Card className="w-full max-w-2xl bg-white rounded-lg shadow-2xl max-h-[60vh] flex flex-col">
        <div className="p-4 flex items-center border-b">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes by title, content or tags..."
            className="flex-grow outline-none border-none bg-transparent"
            autoComplete="off"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FiX />
          </Button>
        </div>
        <div className="overflow-auto flex-grow">
          {renderContent()}
        </div>
        <Separator />
        <div className="p-3 text-xs text-gray-500 flex justify-between items-center bg-gray-50 rounded-b-lg">
          <div>
            Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↑</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↓</kbd> to navigate
          </div>
          <div>
            Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Enter</kbd> to select
          </div>
          <div>
            Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Esc</kbd> to close
          </div>
        </div>
      </Card>
    </div>
  );
}