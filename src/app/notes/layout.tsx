"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import { Container } from "@/components/ui/container";
import FolderSidebar from "@/components/FolderSidebar";
import NotesSidebar from "@/components/NotesSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client-side auth check
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        redirect("/login");
      }
    };
    
    checkSession();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow w-full">
        {/* Pass a placeholder userId; the component will fetch the actual data from the session */}
        <NotesSidebar />
        
        <div className="flex-grow p-4 overflow-auto">
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}