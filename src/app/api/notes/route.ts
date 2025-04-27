import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/Note";

// Get all notes for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const folder = url.searchParams.get("folder");
        const tag = url.searchParams.get("tag");
        const searchQuery = url.searchParams.get("query");
        const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 50;
        const skip = url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : 0;
        const sort = url.searchParams.get("sort") || "-updatedAt"; // Default sort by updatedAt desc

        await connectToDatabase();

        const query: any = { userId: session.user.id };

        // Filter by folder if provided
        if (folder) {
            query.folder = folder;
        }

        // Filter by tag if provided
        if (tag) {
            query.tags = tag;
        }

        // Search by title or content
        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const notes = await Note.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Note.countDocuments(query);

        return NextResponse.json({
            notes,
            pagination: {
                total,
                limit,
                skip
            }
        });
    } catch (error: any) {
        console.error("Error fetching notes:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

// Create a new note
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
        await connectToDatabase();

        const note = new Note({
            ...body,
            userId: session.user.id,
        });

        await note.save();

        return NextResponse.json(note, { status: 201 });
    } catch (error: any) {
        console.error("Error creating note:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create note" },
            { status: 500 }
        );
    }
}