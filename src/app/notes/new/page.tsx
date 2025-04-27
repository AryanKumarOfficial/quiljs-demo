import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NotesEditor from "@/components/NotesEditor";
import { Container } from "@/components/ui/container";

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
      <div className="h-[calc(100vh-150px)]">
        <NotesEditor isNew={true} />
      </div>
    </Container>
  );
}