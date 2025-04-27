import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";

// Get all folders for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Get distinct folders for the user
        const folders = await Note.distinct("folder", { 
            userId: session.user.id 
        });

        return NextResponse.json({ folders });
    } catch (error: any) {
        console.error("Error fetching folders:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch folders" },
            { status: 500 }
        );
    }
}

// Create a new folder (by creating a note in that folder)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Folder name is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if this folder already exists for this user
        const existingFolder = await Note.findOne({
            folder: name,
            userId: session.user.id
        });

        // If not, create a placeholder note in this folder
        if (!existingFolder) {
            const note = new Note({
                title: `${name} - Getting Started`,
                content: `Welcome to your new folder "${name}". This is your first note in this folder.`,
                folder: name,
                userId: session.user.id,
                editorType: "rich"
            });

            await note.save();
        }

        return NextResponse.json({ 
            success: true, 
            folderName: name,
            message: existingFolder ? "Folder already exists" : "Folder created successfully" 
        });
    } catch (error: any) {
        console.error("Error creating folder:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create folder" },
            { status: 500 }
        );
    }
}

// Update (rename) a folder
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { oldName, newName } = body;

        if (!oldName || !newName || typeof oldName !== "string" || typeof newName !== "string") {
            return NextResponse.json(
                { error: "Both old and new folder names are required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Update all notes in the old folder to the new folder name
        const result = await Note.updateMany(
            { folder: oldName, userId: session.user.id },
            { $set: { folder: newName } }
        );

        return NextResponse.json({
            success: true,
            message: `Folder renamed from "${oldName}" to "${newName}"`,
            modifiedCount: result.modifiedCount
        });
    } catch (error: any) {
        console.error("Error renaming folder:", error);
        return NextResponse.json(
            { error: error.message || "Failed to rename folder" },
            { status: 500 }
        );
    }
}

// Delete a folder and optionally its notes
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }
        
        // Get parameters from URL instead of body
        const url = new URL(req.url);
        const name = url.searchParams.get("name");
        const deleteNotes = url.searchParams.get("deleteNotes") === "true";

        if (!name) {
            return NextResponse.json(
                { error: "Folder name is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        let result;
        if (deleteNotes) {
            // Delete all notes in this folder
            result = await Note.deleteMany({
                folder: name,
                userId: session.user.id
            });
        } else {
            // Move notes to "Default" folder instead of deleting them
            result = await Note.updateMany(
                { folder: name, userId: session.user.id },
                { $set: { folder: "Default" } }
            );
        }

        return NextResponse.json({
            success: true,
            message: deleteNotes 
                ? `Folder "${name}" and all its notes deleted` 
                : `Folder "${name}" deleted, notes moved to Default folder`,
            modifiedCount: result.modifiedCount,
            deletedCount: result.deletedCount || 0
        });
    } catch (error: any) {
        console.error("Error deleting folder:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete folder" },
            { status: 500 }
        );
    }
}