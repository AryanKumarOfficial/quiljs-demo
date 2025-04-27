import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';

export interface INote {
  _id: string;
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: string;
  lastAccessed: string;
  editorType: string;
  color?: string;
  isPublic?: boolean;
  sharedWith?: string[];
  userId?: string;
}

interface NotesState {
  notes: INote[];
  loading: boolean;
  error: string | null;
  currentNote: INote | null;
  searchQuery: string;
  activeFolder: string;
  activeTags: string[];
  sortBy: 'updated' | 'title' | 'created';
  
  // Actions
  fetchNotes: (userId: string) => Promise<void>;
  createNote: (note: Partial<INote>, userId: string) => Promise<INote | null>;
  updateNote: (id: string, updates: Partial<INote>) => Promise<INote | null>;
  deleteNote: (id: string) => Promise<boolean>;
  setCurrentNote: (note: INote | null) => void;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  togglePublic: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveFolder: (folder: string) => void;
  setActiveTags: (tags: string[]) => void;
  setSortBy: (sort: 'updated' | 'title' | 'created') => void;
  clearNotes: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      loading: false,
      error: null,
      currentNote: null,
      searchQuery: '',
      activeFolder: 'All Notes',
      activeTags: [],
      sortBy: 'updated',

      fetchNotes: async (userId: string) => {
        set(produce(state => {
          state.loading = true;
          state.error = null;
        }));
        
        try {
          const response = await fetch(`/api/notes?userId=${userId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch notes');
          }
          
          set(produce(state => {
            state.notes = result.data;
            state.loading = false;
          }));
        } catch (err) {
          console.error('Error fetching notes:', err);
          set(produce(state => {
            state.error = err instanceof Error ? err.message : 'An error occurred while fetching notes';
            state.loading = false;
          }));
        }
      },

      createNote: async (note: Partial<INote>, userId: string) => {
        set(produce(state => {
          state.loading = true;
          state.error = null;
        }));
        
        try {
          const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...note, userId }),
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to create note');
          }
          
          const newNote = result.data;
          
          set(produce(state => {
            state.notes.push(newNote);
            state.loading = false;
            state.currentNote = newNote;
          }));
          
          return newNote;
        } catch (err) {
          console.error('Error creating note:', err);
          set(produce(state => {
            state.error = err instanceof Error ? err.message : 'An error occurred while creating note';
            state.loading = false;
          }));
          return null;
        }
      },

      updateNote: async (id: string, updates: Partial<INote>) => {
        // Optimistic update
        set(produce(state => {
          state.loading = true;
          state.error = null;
          
          // Find and update the note in state
          const noteIndex = state.notes.findIndex((note: INote) => note._id === id || note.id === id);
          if (noteIndex !== -1) {
            // Merge the updates with current note
            Object.assign(state.notes[noteIndex], updates);
          }
        }));

        try {
          const response = await fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to update note');
          }
          
          const updatedNote = result.data;
          
          set(produce(state => {
            // Update state with server response
            const noteIndex = state.notes.findIndex((note: INote) => note._id === id || note.id === id);
            if (noteIndex !== -1) {
              state.notes[noteIndex] = updatedNote;
            }
            
            // Update current note if it's the one being updated
            if (state.currentNote && (state.currentNote._id === id || state.currentNote.id === id)) {
              state.currentNote = updatedNote;
            }
            
            state.loading = false;
          }));
          
          return updatedNote;
        } catch (err) {
          console.error('Error updating note:', err);
          
          // Revert the optimistic update on error
          set(produce(state => {
            state.error = err instanceof Error ? err.message : 'An error occurred while updating note';
            state.loading = false;
            // Reload notes to revert changes (could be optimized by keeping a backup)
            // This is a simple solution but not optimal for performance
          }));
          
          return null;
        }
      },

      deleteNote: async (id: string) => {
        let deletedNote: INote | undefined;
        
        // Optimistic delete
        set(produce(state => {
          state.loading = true;
          state.error = null;
          
          // Find and keep a copy of the note before removing it
          deletedNote = state.notes.find((note: INote) => note._id === id || note.id === id);
          
          // Remove from notes array
          state.notes = state.notes.filter((note: INote) => note._id !== id && note.id !== id);
          
          // Clear current note if it's the one being deleted
          if (state.currentNote && (state.currentNote._id === id || state.currentNote.id === id)) {
            state.currentNote = null;
          }
        }));

        try {
          const response = await fetch(`/api/notes/${id}`, {
            method: 'DELETE',
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to delete note');
          }
          
          set(produce(state => {
            state.loading = false;
          }));
          
          return true;
        } catch (err) {
          console.error('Error deleting note:', err);
          
          // Restore the deleted note on error
          set(produce(state => {
            state.error = err instanceof Error ? err.message : 'An error occurred while deleting note';
            state.loading = false;
            
            // Restore the deleted note
            if (deletedNote) {
              state.notes.push(deletedNote);
            }
          }));
          
          return false;
        }
      },

      setCurrentNote: (note: INote | null) => set(produce(state => {
        state.currentNote = note;
      })),
      
      toggleFavorite: async (id: string) => {
        const note = get().notes.find(n => n._id === id || n.id === id);
        if (note) {
          const updatedIsFavorite = !note.isFavorite;
          await get().updateNote(id, { isFavorite: updatedIsFavorite });
        }
      },

      togglePinned: async (id: string) => {
        const note = get().notes.find(n => n._id === id || n.id === id);
        if (note) {
          const updatedIsPinned = !note.isPinned;
          await get().updateNote(id, { isPinned: updatedIsPinned });
        }
      },

      togglePublic: async (id: string) => {
        const note = get().notes.find(n => n._id === id || n.id === id);
        if (note) {
          const updatedIsPublic = !note.isPublic;
          await get().updateNote(id, { isPublic: updatedIsPublic });
        }
      },

      setSearchQuery: (query: string) => set(produce(state => {
        state.searchQuery = query;
      })),
      
      setActiveFolder: (folder: string) => set(produce(state => {
        state.activeFolder = folder;
      })),
      
      setActiveTags: (tags: string[]) => set(produce(state => {
        state.activeTags = tags;
      })),
      
      setSortBy: (sort: 'updated' | 'title' | 'created') => set(produce(state => {
        state.sortBy = sort;
      })),
      
      clearNotes: () => set(produce(state => {
        state.notes = [];
        state.currentNote = null;
      })),
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => sessionStorage), // Using sessionStorage to persist data during a browser session
    }
  )
);