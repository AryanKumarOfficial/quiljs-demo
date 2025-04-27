"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiTag, FiFilter, FiStar, FiPaperclip, FiClock, FiChevronDown, FiChevronUp, FiX, FiFolder } from "react-icons/fi";
import { showToast } from "@/lib/utils";

export default function NotesSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    views: true,
    folders: true,
    tags: true,
    filters: true,
  });
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  
  // Get current filters from URL
  const currentTagFilter = searchParams?.get('tag') || null;
  const currentFolderFilter = searchParams?.get('folder') || null;

  // Fetch all available tags
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/notes/search?tagsOnly=true");
        if (!response.ok) throw new Error("Failed to fetch tags");
        
        const data = await response.json();
        setTags(data.tags || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        showToast.error("Failed to load tags");
      } finally {
        setIsLoadingTags(false);
      }
    }

    fetchTags();
  }, []);

  // Fetch all available folders
  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch("/api/notes/folders");
        if (!response.ok) throw new Error("Failed to fetch folders");
        
        const data = await response.json();
        setFolders(data.folders || []);
      } catch (error) {
        console.error("Error fetching folders:", error);
        showToast.error("Failed to load folders");
      } finally {
        setIsLoadingFolders(false);
      }
    }

    fetchFolders();
  }, []);

  // Fetch folder counts
  useEffect(() => {
    async function fetchFolderCounts() {
      try {
        const response = await fetch("/api/notes/folder-counts");
        if (!response.ok) throw new Error("Failed to fetch folder counts");

        const data = await response.json();
        console.log("Folder counts received:", data.counts); // Debug log
        setFolderCounts(data.counts || {});
      } catch (error) {
        console.error("Error fetching folder counts:", error);
      }
    }

    // Don't wait for folders to be loaded before fetching counts
    // This ensures we get counts even when folder list might be cached
    fetchFolderCounts();
    
    // Set up a refresh interval to periodically update folder counts
    const intervalId = setInterval(fetchFolderCounts, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []); // Run once on component mount

  // Toggle section expanded state
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Create a URL for filtering
  const createFilterUrl = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set(param, value);
    return `${pathname}?${params.toString()}`;
  };

  // Apply filter directly without using Link component
  const applyFilter = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set(param, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear a specific filter
  const clearFilter = (param: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete(param);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Check if a view is active
  const isViewActive = (view: string) => {
    if (view === 'all' && pathname.includes('/notes/all')) return true;
    if (view === 'favorites' && searchParams?.get('isFavorite') === 'true') return true;
    if (view === 'pinned' && searchParams?.get('isPinned') === 'true') return true;
    if (view === 'recent' && searchParams?.get('sort') === '-lastAccessed') return true;
    return false;
  };

  // Handle folder click
  const handleFolderClick = (folderName: string) => {
    if (folderName === "All Notes") {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.delete('folder');
      router.push(`${pathname}?${params.toString()}`);
    } else {
      applyFilter('folder', folderName);
    }
  };

  return (
    <div className="w-64 border-r p-4 bg-white">
      {/* Views Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('views')}
        >
          <h3 className="text-sm font-medium text-gray-600">VIEWS</h3>
          {expandedSections.views ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
        
        <AnimatePresence>
          {expandedSections.views && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-1">
                <div
                  onClick={() => router.push('/notes/all')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    isViewActive('all') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FiFilter className="mr-2" />
                  All Notes
                </div>
                <div 
                  onClick={() => applyFilter('isFavorite', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    isViewActive('favorites') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FiStar className="mr-2" />
                  Favorites
                </div>
                <div
                  onClick={() => applyFilter('isPinned', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    isViewActive('pinned') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FiPaperclip className="mr-2" />
                  Pinned
                </div>
                <div 
                  onClick={() => applyFilter('sort', '-lastAccessed')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    isViewActive('recent') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FiClock className="mr-2" />
                  Recent
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Folders Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('folders')}
        >
          <h3 className="text-sm font-medium text-gray-600">FOLDERS</h3>
          {expandedSections.folders ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
        
        <AnimatePresence>
          {expandedSections.folders && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {isLoadingFolders ? (
                <div className="animate-pulse space-y-2 pl-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-1 pl-1">
                  <div
                    onClick={() => handleFolderClick("All Notes")}
                    className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${
                      !currentFolderFilter ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <FiFolder className="mr-2" />
                      <span>All Notes</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Object.values(folderCounts).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  {folders.length > 0 ? (
                    folders.map((folder, index) => (
                      <div
                        key={index}
                        onClick={() => handleFolderClick(folder)}
                        className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${
                          currentFolderFilter === folder ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center">
                          <FiFolder className="mr-2" />
                          <span>{folder}</span>
                        </div>
                        <span className="text-xs text-gray-500">{folderCounts[folder] || 0}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 pl-2">No folders found</p>
                  )}
                </div>
              )}

              {/* Clear folder filter if one is applied */}
              {currentFolderFilter && (
                <button
                  onClick={() => clearFilter('folder')}
                  className="mt-2 text-xs text-blue-600 hover:underline pl-3 flex items-center"
                >
                  <FiX className="mr-1" /> Clear folder filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('tags')}
        >
          <h3 className="text-sm font-medium text-gray-600">TAGS</h3>
          {expandedSections.tags ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
        
        <AnimatePresence>
          {expandedSections.tags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {isLoadingTags ? (
                <div className="animate-pulse space-y-2 pl-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : tags.length > 0 ? (
                <div className="space-y-1 pl-1">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      onClick={() => applyFilter('tag', tag)}
                      className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                        currentTagFilter === tag ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FiTag className="mr-2" />
                      {tag}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 pl-2">No tags found</p>
              )}

              {/* Clear tag filter if one is applied */}
              {currentTagFilter && (
                <button
                  onClick={() => clearFilter('tag')}
                  className="mt-2 text-xs text-blue-600 hover:underline pl-3 flex items-center"
                >
                  <FiX className="mr-1" /> Clear tag filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('filters')}
        >
          <h3 className="text-sm font-medium text-gray-600">FILTERS</h3>
          {expandedSections.filters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
        
        <AnimatePresence>
          {expandedSections.filters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-1">
                <div
                  onClick={() => applyFilter('editorType', 'rich')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    searchParams?.get('editorType') === 'rich' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-[10px] mr-2">R</span>
                  Rich Text Notes
                </div>
                <div
                  onClick={() => applyFilter('editorType', 'markdown')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    searchParams?.get('editorType') === 'markdown' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-[10px] mr-2">M</span>
                  Markdown Notes
                </div>
                <div
                  onClick={() => applyFilter('editorType', 'simple')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    searchParams?.get('editorType') === 'simple' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-[10px] mr-2">T</span>
                  Plain Text Notes
                </div>
                <div
                  onClick={() => applyFilter('isPublic', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    searchParams?.get('isPublic') === 'true' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Public Notes
                </div>
                <div
                  onClick={() => applyFilter('hasShares', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${
                    searchParams?.get('hasShares') === 'true' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Shared Notes
                </div>
              </div>

              {/* Clear filter button */}
              {(searchParams?.has('editorType') || searchParams?.has('isPublic') || searchParams?.has('hasShares')) && (
                <button
                  onClick={() => {
                    clearFilter('editorType');
                    clearFilter('isPublic');
                    clearFilter('hasShares');
                  }}
                  className="mt-2 text-xs text-blue-600 hover:underline pl-3 flex items-center"
                >
                  <FiX className="mr-1" /> Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}