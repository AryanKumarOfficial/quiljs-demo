import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/Note";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const query = url.searchParams.get("q") || "";
        const type = url.searchParams.get("type") || "all"; // all, title, content, tags
        const folder = url.searchParams.get("folder");
        const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 10;

        await connectToDatabase();

        const searchQuery: any = {
            userId: session.user.id,
        };

        // Apply type-specific search
        if (query) {
            if (type === "title") {
                searchQuery.title = { $regex: query, $options: "i" };
            } else if (type === "content") {
                searchQuery.content = { $regex: query, $options: "i" };
            } else if (type === "tags") {
                searchQuery.tags = { $regex: query, $options: "i" };
            } else {
                // Default: search all fields
                searchQuery.$or = [
                    { title: { $regex: query, $options: "i" } },
                    { content: { $regex: query, $options: "i" } },
                    { tags: { $regex: query, $options: "i" } },
                ];
            }
        }

        // Apply folder filter if provided
        if (folder) {
            searchQuery.folder = folder;
        }

        const notes = await Note.find(searchQuery)
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        // For each note, extract a relevant snippet from the content based on the search query
        const notesWithSnippets = notes.map((note: any) => {
            const { content, ...rest } = note;

            let snippet = content;
            if (query && content) {
                const plainContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
                const lowerQuery = query.toLowerCase();
                const lowerContent = plainContent.toLowerCase();
                const queryIndex = lowerContent.indexOf(lowerQuery);

                if (queryIndex > -1) {
                    // Get snippet around the search term
                    const snippetStart = Math.max(0, queryIndex - 50);
                    const snippetEnd = Math.min(plainContent.length, queryIndex + query.length + 50);
                    snippet = plainContent.substring(snippetStart, snippetEnd);

                    // Add ellipsis if we're not at the start/end
                    if (snippetStart > 0) snippet = "..." + snippet;
                    if (snippetEnd < plainContent.length) snippet += "...";
                } else {
                    // If query not found in content, just take a brief preview
                    snippet = plainContent.substring(0, 100) + (plainContent.length > 100 ? "..." : "");
                }
            } else if (content) {
                // If no search query, just take the beginning of the content
                const plainContent = content.replace(/<[^>]*>/g, "");
                snippet = plainContent.substring(0, 100) + (plainContent.length > 100 ? "..." : "");
            }

            return {
                ...rest,
                snippet
            };
        });

        return NextResponse.json({ notes: notesWithSnippets });
    } catch (error: any) {
        console.error("Error searching notes:", error);
        return NextResponse.json(
            { error: error.message || "Failed to search notes" },
            { status: 500 }
        );
    }
}