import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NotesEditor from "@/components/NotesEditor";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";

export const metadata = {
  title: "Create New Note | Cloud Notes",
  description: "Create a new note in your cloud notes app",
};

export default async function NewNotePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }
  
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
        <NotesEditor isNew={true} />
      </div>
    </Container>
  );
}