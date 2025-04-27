import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";
import NotesEditor from "@/components/NotesEditor";
import { Container } from "@/components/ui/container";

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
    const note = await Note.findOne({
        _id: id,
        $or: [
            { userId: session.user.id },
            { isPublic: true },
            { sharedWith: session.user.id }
        ]
    }).lean();

    if (!note) {
        notFound();
    }

    // Update last accessed time
    await Note.findByIdAndUpdate(id, { lastAccessed: new Date() });

    const isOwner = note.userId.toString() === session.user.id;

    return (
        <Container className="py-6">
            <div className="h-[calc(100vh-150px)]">
                <NotesEditor note={note} isNew={false} />

                {!isOwner && (
                    <div className="mt-4 p-2 bg-blue-50 text-blue-800 rounded-md text-sm">
                        This note was shared with you by another user. You cannot edit it.
                    </div>
                )}
            </div>
        </Container>
    );
}