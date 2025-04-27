import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note, { INote } from "@/models/Note";
import NotesEditor from "@/components/NotesEditor";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Document } from 'mongoose';
import { FiArrowLeft } from "react-icons/fi";

interface NotePageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: NotePageProps) {
    const { id } = params;
    await connectToDatabase();

    try {
        const note = await Note.findById(id);

        if (!note) {
            return {
                title: "Note Not Found",
            };
        }

        return {
            title: `${note.title} | Cloud Notes`,
        };
    } catch (error) {
        return {
            title: "Note | Cloud Notes",
        };
    }
}

export default async function NotePage({ params }: NotePageProps) {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    await connectToDatabase();

    // Check if the user has access to this note
    const noteDoc = await Note.findOne({
        _id: id,
        $or: [
            { userId: session.user.id },
            { isPublic: true },
            { sharedWith: session.user.id }
        ]
    }).lean();

    if (!noteDoc) {
        notFound();
    }

    // Cast the Mongoose document to a plain object type that we can safely work with
    const notePlainDoc = noteDoc as any;

    // Convert MongoDB document to proper INote type
    const note: INote = {
        _id: notePlainDoc._id.toString(),
        id: notePlainDoc._id.toString(),
        title: notePlainDoc.title || '',
        content: notePlainDoc.content || '',
        tags: Array.isArray(notePlainDoc.tags) ? notePlainDoc.tags : [],
        folder: notePlainDoc.folder || 'Default',
        color: notePlainDoc.color || '#ffffff',
        isPinned: Boolean(notePlainDoc.isPinned),
        isFavorite: Boolean(notePlainDoc.isFavorite),
        editorType: notePlainDoc.editorType || 'rich',
        userId: notePlainDoc.userId.toString(),
        isPublic: Boolean(notePlainDoc.isPublic),
        sharedWith: Array.isArray(notePlainDoc.sharedWith) 
            ? notePlainDoc.sharedWith.map((id: any) => id.toString()) 
            : [],
        lastAccessed: notePlainDoc.lastAccessed || new Date(),
        updatedAt: notePlainDoc.updatedAt || new Date(),
        createdAt: notePlainDoc.createdAt || new Date()
    };

    // Update last accessed time
    await Note.findByIdAndUpdate(id, { lastAccessed: new Date() });

    const isOwner = note.userId === session.user.id;

    return (
        <Container className="py-6">
            <div className="mb-4">
                <Link href="/notes">
                    <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <FiArrowLeft /> Back to Notes
                    </Button>
                </Link>
            </div>

            <div className="h-[calc(100vh-180px)] rounded-lg shadow-sm border bg-white">
                <NotesEditor note={note} isNew={false} readOnly={!isOwner} />

                {!isOwner && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        This note was shared with you by another user. You cannot edit it.
                    </div>
                )}
            </div>
        </Container>
    );
}