"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Response", href: "/response" },
    ];

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="flex flex-wrap gap-4 items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2">
                <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9 7H10M9 13H15M9 17H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                <h1 className="text-white text-xl font-bold">
                    <span className="text-blue-500">R</span>ich
                    <span className="text-blue-500">T</span>ext
                    <span className="text-blue-500">E</span>ditor
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <ul className="flex flex-wrap gap-6 m-0 p-0 list-none">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`px-2 py-1 rounded transition duration-300 ease-in-out font-semibold text-white hover:text-blue-500 hover:bg-white/10 ${isActive ? "text-blue-500 bg-white/10" : ""
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="text-white text-sm">
                                {session?.user?.name || session?.user?.email}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
