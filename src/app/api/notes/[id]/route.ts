import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/Note";

// Get a specific note by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const note = await Note.findOne({
            _id: id,
            $or: [
                { userId: session.user.id },
                { isPublic: true },
                { sharedWith: session.user.id }
            ]
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        // Update lastAccessed timestamp
        await Note.findByIdAndUpdate(id, { lastAccessed: new Date() });

        return NextResponse.json(note);
    } catch (error: any) {
        console.error("Error fetching note:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch note" },
            { status: 500 }
        );
    }
}

// Update a specific note by ID
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await req.json();

        await connectToDatabase();

        // Only allow updating own notes
        const note = await Note.findOne({
            _id: id,
            userId: session.user.id
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to edit it" },
                { status: 404 }
            );
        }

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { ...body, lastAccessed: new Date() },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedNote);
    } catch (error: any) {
        console.error("Error updating note:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update note" },
            { status: 500 }
        );
    }
}

// Delete a specific note by ID
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        // Only allow deleting own notes
        const note = await Note.findOne({
            _id: id,
            userId: session.user.id
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to delete it" },
                { status: 404 }
            );
        }

        await Note.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting note:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete note" },
            { status: 500 }
        );
    }
}