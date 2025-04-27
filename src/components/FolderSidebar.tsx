"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiFolder, FiPlus, FiFolderPlus, FiEdit, FiX, FiChevronDown, FiChevronRight, FiTrash2, FiStar, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/lib/utils";
import { useFoldersStore } from "@/store/foldersStore";
import { useUIStore } from "@/store/uiStore";

interface FolderSidebarProps {
  activeFolderId?: string;
  userId: string;
}

export default function FolderSidebar({ activeFolderId, userId }: FolderSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get folder state and actions from Zustand store
  const { 
    folders,
    loading,
    error,
    activeFolder,
    expandedSections,
    isEditing,
    isCreatingFolder,
    folderBeingDeleted,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    setActiveFolder,
    toggleSection,
    setIsEditing,
    setIsCreatingFolder,
    setFolderBeingDeleted,
    getFolderCounts
  } = useFoldersStore();

  // For UI state
  const [newFolderName, setNewFolderName] = React.useState("");
  const [editFolderName, setEditFolderName] = React.useState("");
  
  // Load folders when component mounts
  React.useEffect(() => {
    if (userId) {
      fetchFolders(userId);
    }
  }, [fetchFolders, userId]);

  // Keep track of favorite folders (we'll maintain this in localStorage for simplicity)
  const [favoriteFolders, setFavoriteFolders] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    // Load favorite folders from localStorage
    const savedFavorites = localStorage.getItem("favoriteFolders");
    if (savedFavorites) {
      setFavoriteFolders(JSON.parse(savedFavorites));
    }
  }, []);

  // Update active folder based on URL
  React.useEffect(() => {
    const urlFolder = searchParams.get("folder");
    if (urlFolder) {
      setActiveFolder(decodeURIComponent(urlFolder));
    } else if (pathname === "/notes") {
      setActiveFolder("All Notes");
    }
  }, [searchParams, pathname, setActiveFolder]);

  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      return showToast.error("Folder name cannot be empty");
    }

    const result = await createFolder({
      name: newFolderName,
      userId: userId
    });
    
    if (result) {
      setNewFolderName("");
      setIsCreatingFolder(false);
      showToast.success("Folder created successfully");
    }
  };

  // Edit a folder name
  const handleEditFolder = async (folder: typeof folders[0]) => {
    if (!editFolderName.trim() || editFolderName === folder.name) {
      setIsEditing(null);
      return;
    }

    const result = await updateFolder(folder._id, {
      ...folder,
      name: editFolderName
    });
    
    if (result) {
      // Update favorites if needed
      if (favoriteFolders.includes(folder.name)) {
        const newFavorites = favoriteFolders.map(f => f === folder.name ? editFolderName : f);
        setFavoriteFolders(newFavorites);
        localStorage.setItem("favoriteFolders", JSON.stringify(newFavorites));
      }

      // Update navigation if it was the active folder
      if (activeFolder === folder._id) {
        router.push(`/notes?folder=${encodeURIComponent(editFolderName)}`);
      }

      showToast.success("Folder renamed successfully");
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folder: typeof folders[0]) => {
    const success = await deleteFolder(folder._id);
    
    if (success) {
      // Remove folder from favorites if needed
      if (favoriteFolders.includes(folder.name)) {
        const newFavorites = favoriteFolders.filter(f => f !== folder.name);
        setFavoriteFolders(newFavorites);
        localStorage.setItem("favoriteFolders", JSON.stringify(newFavorites));
      }
      
      // Redirect to All Notes if the active folder was deleted
      if (activeFolder === folder._id) {
        setActiveFolder("");
        router.push("/notes");
      }
      
      showToast.success("Folder deleted successfully");
    }
  };

  // Toggle a folder in favorites
  const toggleFavoriteFolder = (folder: typeof folders[0]) => {
    let newFavorites;
    if (favoriteFolders.includes(folder.name)) {
      newFavorites = favoriteFolders.filter(f => f !== folder.name);
    } else {
      newFavorites = [...favoriteFolders, folder.name];
    }
    setFavoriteFolders(newFavorites);
    localStorage.setItem("favoriteFolders", JSON.stringify(newFavorites));
  };

  // Handle folder click - update state and navigate
  const handleFolderClick = (folderId: string, folderName: string) => {
    setActiveFolder(folderId);
    if (folderName === "All Notes") {
      router.push("/notes");
    } else {
      router.push(`/notes?folder=${encodeURIComponent(folderName)}`);
    }
  };

  // Calculate total notes
  const totalNotes = folders.reduce((sum, folder) => sum + (folder.count || 0), 0);

  // Get favorite folders from the folders list
  const favoriteFolderObjects = folders.filter(folder => 
    favoriteFolders.includes(folder.name)
  );

  return (
    <div className="w-64 h-full border-r p-4 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">Notes</h3>
        <button
          onClick={() => setIsCreatingFolder(!isCreatingFolder)}
          className="text-gray-500 hover:text-blue-600"
          title={isCreatingFolder ? "Cancel" : "Create new folder"}
        >
          {isCreatingFolder ? <FiX /> : <FiFolderPlus />}
        </button>
      </div>

      <AnimatePresence>
        {isCreatingFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="border rounded-l px-3 py-1 text-sm flex-grow"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setIsCreatingFolder(false);
                }}
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="bg-blue-600 text-white px-2 py-1 rounded-r text-sm"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 mt-3 flex-grow overflow-auto">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            {/* All Notes Link - Always visible */}
            <div
              onClick={() => handleFolderClick("", "All Notes")}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${activeFolder === "" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center">
                <FiFolder className="mr-2" />
                <span>All Notes</span>
              </div>
              <span className="text-xs text-gray-500">
                {totalNotes}
              </span>
            </div>

            {/* Favorites Section */}
            <div className="mt-2">
              <div
                className="flex items-center justify-between px-1 py-1 text-sm text-gray-500 cursor-pointer"
                onClick={() => toggleSection("favorites")}
              >
                {expandedSections.favorites ? <FiChevronDown className="mr-1" /> : <FiChevronRight className="mr-1" />}
                <span className="font-medium">Favorites</span>
                <span className="text-xs">{favoriteFolderObjects.length}</span>
              </div>

              <AnimatePresence>
                {expandedSections.favorites && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-2 space-y-1"
                  >
                    {favoriteFolderObjects.length === 0 ? (
                      <div className="text-xs text-gray-400 italic ml-4 mt-1">No favorite folders</div>
                    ) : (
                      favoriteFolderObjects.map((folder) => (
                        <div
                          key={`fav-${folder._id}`}
                          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${activeFolder === folder._id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                            }`}
                          onClick={() => handleFolderClick(folder._id, folder.name)}
                        >
                          <div className="flex items-center">
                            <FiFolder className="mr-2" />
                            <span>{folder.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{folder.count || 0}</span>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Folders Section */}
            <div className="mt-2">
              <div
                className="flex items-center justify-between px-1 py-1 text-sm text-gray-500 cursor-pointer"
                onClick={() => toggleSection("folders")}
              >
                {expandedSections.folders ? <FiChevronDown className="mr-1" /> : <FiChevronRight className="mr-1" />}
                <span className="font-medium">Folders</span>
                <span className="text-xs">{folders.length}</span>
              </div>

              <AnimatePresence>
                {expandedSections.folders && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-2 space-y-1"
                  >
                    {folders.map((folder) => (
                      <div key={folder._id} className="group relative">
                        {isEditing === folder._id ? (
                          <div className="flex items-center px-1 py-1 rounded-md">
                            <input
                              type="text"
                              value={editFolderName}
                              onChange={(e) => setEditFolderName(e.target.value)}
                              className="border rounded px-2 py-1 text-sm flex-grow"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditFolder(folder);
                                if (e.key === "Escape") setIsEditing(null);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditFolder(folder)}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={() => setIsEditing(null)}
                              className="ml-1 text-red-600 hover:text-red-800"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${activeFolder === folder._id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                                }`}
                              onClick={() => handleFolderClick(folder._id, folder.name)}
                            >
                              <div className="flex items-center">
                                <FiFolder className="mr-2" />
                                <span>{folder.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">{folder.count || 0}</span>
                                <div className="opacity-0 group-hover:opacity-100 flex">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavoriteFolder(folder);
                                    }}
                                    className={`text-xs p-1 hover:text-yellow-500 ${favoriteFolders.includes(folder.name) ? 'text-yellow-500' : 'text-gray-400'}`}
                                    title={favoriteFolders.includes(folder.name) ? "Remove from favorites" : "Add to favorites"}
                                  >
                                    <FiStar size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsEditing(folder._id);
                                      setEditFolderName(folder.name);
                                    }}
                                    className="text-xs p-1 text-gray-400 hover:text-blue-600"
                                    title="Rename folder"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFolderBeingDeleted(folder);
                                    }}
                                    className="text-xs p-1 text-gray-400 hover:text-red-600"
                                    title="Delete folder"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Delete Confirmation Dialog */}
                            {folderBeingDeleted && folderBeingDeleted._id === folder._id && (
                              <div className="absolute z-10 top-0 left-0 w-full bg-white border border-red-200 rounded-md shadow-md p-2 mt-8">
                                <p className="text-xs text-red-600 mb-2">Delete "{folder.name}"?</p>
                                <div className="flex justify-between">
                                  <button
                                    onClick={() => handleDeleteFolder(folder)}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setFolderBeingDeleted(null)}
                                    className="text-xs border px-2 py-1 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}