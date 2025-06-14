"use client";

import {Suspense, useCallback, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import NotesList from "@/components/NotesList";
import {Button} from "@/components/ui/button";
import {FiFileText, FiFilter, FiPlus} from "react-icons/fi";
import {Container} from "@/components/ui/container";
import {motion} from "framer-motion";
import {useNotesStore} from "@/store/notesStore";

// Simplified type for frontend use (without Mongoose methods)
type NoteData = {
    id: string;
    _id: string; // Mongoose ID
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
};

function Notes() {
    const {data: session, status} = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {notes: storeNotes = [], loading: storeLoading, fetchNotes} = useNotesStore();

    const [notes, setNotes] = useState<NoteData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredView, setFilteredView] = useState<boolean>(false);
    const [filterDescription, setFilterDescription] = useState<string>("");

    // Derived state from store data
    const pinnedNotes = (storeNotes || []).filter(note => note.isPinned === true);
    const recentNotes = (storeNotes || [])
        .filter(note => !note.isPinned)
        .sort((a, b) =>
            new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
        )
        .slice(0, 5);
    const favoriteNotes = (storeNotes || [])
        .filter(note =>
            note.isFavorite &&
            !note.isPinned &&
            !recentNotes.some(rn => rn.id === note.id)
        )
        .slice(0, 5);

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch API notes based on search params
    const fetchApiNotes = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            const apiUrl = new URL("/api/notes", window.location.origin);
            searchParams.forEach((value, key) => {
                apiUrl.searchParams.append(key, value);
            });

            const isFiltered = searchParams.size > 0;
            setFilteredView(isFiltered);

            if (isFiltered) {
                const folder = searchParams.get('folder');
                const tag = searchParams.get('tag');
                const editorType = searchParams.get('editorType');
                const isFavorite = searchParams.get('isFavorite');
                const isPinned = searchParams.get('isPinned');

                let description = 'Showing notes';
                if (folder) description += ` in folder "${folder}"`;
                if (tag) description += ` with tag "${tag}"`;
                if (editorType) {
                    const typeLabels = {
                        'rich': 'Rich Text',
                        'markdown': 'Markdown',
                        'simple': 'Plain Text'
                    };
                    description += ` of type "${typeLabels[editorType as keyof typeof typeLabels] || editorType}"`;
                }
                if (isFavorite === 'true') description += ` that are favorited`;
                if (isPinned === 'true') description += ` that are pinned`;

                setFilterDescription(description);
            } else {
                setFilterDescription("");
            }

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch notes");

            const data = await response.json();
            setNotes(data.notes);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, searchParams]);

    // Fetch notes on component mount and when session changes
    useEffect(() => {
        if (session?.user?.id) {
            if (searchParams.size === 0) {
                fetchNotes(session.user.id);
            } else {
                fetchApiNotes();
            }
        }
    }, [session?.user?.id, fetchNotes, searchParams, fetchApiNotes]);

    // Loading state
    if (status === "loading" || (loading && !notes.length && storeLoading)) {
        return (
            <Container className="py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-32 w-full max-w-md bg-gray-100 rounded"></div>
                    </div>
                </div>
            </Container>
        );
    }

    // Error state
    if (error) {
        return (
            <Container className="py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    <h3 className="font-medium">Error loading notes</h3>
                    <p>{error}</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-8">
            <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
            >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {filteredView ? "Filtered Notes" : "My Notes"}
                </h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                        <Link href="/notes/all">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FiFilter/> Browse All
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                        <Link href="/notes/new">
                            <Button
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <FiPlus/> New Note
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {filteredView && filterDescription && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-blue-700 text-sm flex items-center">
                        <FiFilter className="mr-2"/>
                        {filterDescription}
                    </p>
                </div>
            )}

            {notes.length === 0 && storeNotes.length === 0 ? (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4}}
                >
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <FiFileText size={64} className="mb-4"/>
                        <h2 className="text-xl font-medium mb-2">No notes yet</h2>
                        <p className="mb-4">Create your first note to get started</p>
                        <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            <Link href="/notes/new">
                                <Button
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    <FiPlus/> Create a Note
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            ) : filteredView ? (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Results</h2>
                        <NotesList notes={notes} showViewToggle={true}/>
                    </div>

                    <motion.div
                        whileHover={{scale: 1.02}}
                        transition={{duration: 0.2}}
                        className="inline-block"
                    >
                        <Link href="/notes"
                              className="flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear filters and view all categories
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="ml-1">
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            ) : (
                <div className="space-y-8">
                    {pinnedNotes.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Pinned Notes</h2>
                            <NotesList notes={pinnedNotes} showViewToggle={true}/>
                        </div>
                    )}

                    {recentNotes.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Recent Notes</h2>
                            <NotesList notes={recentNotes} showViewToggle={true}/>
                        </div>
                    )}

                    {favoriteNotes.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Favorite Notes</h2>
                            <NotesList notes={favoriteNotes} showViewToggle={true}/>
                        </div>
                    )}

                    <motion.div
                        whileHover={{scale: 1.02}}
                        transition={{duration: 0.2}}
                        className="inline-block"
                    >
                        <Link href="/notes/all"
                              className="flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View all notes
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="ml-1">
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            )}
        </Container>
    );
}

function LoadingSkeleton() {
    return (
        <Container className="py-8">
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-32 w-full max-w-md bg-gray-100 rounded"></div>
                </div>
            </div>
        </Container>
    );
}

export default function NotesPage() {
    return (
        <Suspense fallback={<LoadingSkeleton/>}>
            <Notes/>
        </Suspense>
    );
}