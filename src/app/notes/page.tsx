import { Suspense } from "react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note, { INote } from "@/models/Note";
import NotesList from "@/components/NotesList";
import { Button } from "@/components/ui/button";
import { FiPlus, FiFileText } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { Types } from "mongoose";

export const metadata = {
    title: "My Notes | Cloud Notes",
    description: "Your personal cloud notes dashboard",
};

// Define a type that matches what NotesList expects
type NoteListItem = {
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
};

async function getNotes(userId: string): Promise<NoteListItem[]> {
    try {
        await connectToDatabase();
        const notes = await Note.find({ userId: userId })
            .sort({ updatedAt: -1 })
            .limit(100)
            .lean();
        
        // Explicitly transform MongoDB documents to the expected format
        return notes.map((note: any) => {
            // Ensure _id is properly converted to string
            const id = note._id ? note._id.toString() : "";
            
            return {
                id: id,
                _id: id,
                title: note.title || "",
                content: note.content || "",
                tags: Array.isArray(note.tags) ? note.tags : [],
                folder: note.folder || "Default",
                isFavorite: Boolean(note.isFavorite),
                isPinned: Boolean(note.isPinned),
                updatedAt: note.updatedAt ? new Date(note.updatedAt).toISOString() : new Date().toISOString(),
                lastAccessed: note.lastAccessed ? new Date(note.lastAccessed).toISOString() : new Date().toISOString(),
                editorType: note.editorType || "rich"
            };
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
        return []; // Return empty array on error
    }
}

export default async function NotesPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    const notes = await getNotes(userId);

    // Find pinned notes
    const pinnedNotes = notes.filter(note => note.isPinned);

    // Find recent notes that are not pinned
    const recentNotes = notes
        .filter(note => !note.isPinned)
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 5);

    // Find favorites that are not in pinned or recent
    const favoriteNotes = notes
        .filter(note => note.isFavorite && !note.isPinned && !recentNotes.some(rn => rn._id === note._id))
        .slice(0, 5);

    return (
        <Container className="py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Notes</h1>
                <Link href="/notes/new">
                    <Button className="flex items-center gap-2">
                        <FiPlus /> New Note
                    </Button>
                </Link>
            </div>

            {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FiFileText size={64} className="mb-4" />
                    <h2 className="text-xl font-medium mb-2">No notes yet</h2>
                    <p className="mb-4">Create your first note to get started</p>
                    <Link href="/notes/new">
                        <Button>Create a Note</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {pinnedNotes.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Pinned Notes</h2>
                            <Suspense fallback={<div>Loading pinned notes...</div>}>
                                <NotesList notes={pinnedNotes} />
                            </Suspense>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-semibold mb-3">Recent Notes</h2>
                        <Suspense fallback={<div>Loading recent notes...</div>}>
                            <NotesList notes={recentNotes} />
                        </Suspense>
                    </div>

                    {favoriteNotes.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Favorite Notes</h2>
                            <Suspense fallback={<div>Loading favorite notes...</div>}>
                                <NotesList notes={favoriteNotes} />
                            </Suspense>
                        </div>
                    )}

                    <Link href="/notes/all" className="inline-block mt-4 text-blue-600 hover:underline">
                        View all notes
                    </Link>
                </div>
            )}
        </Container>
    );
}