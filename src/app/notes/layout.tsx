import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NotesSidebar from "@/components/NotesSidebar";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Notes | Cloud Notes App",
  description: "Your cloud notes dashboard and management",
};

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <Container className="py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <div className="md:sticky md:top-24">
            <NotesSidebar />
          </div>
        </div>
        <div className="flex-grow min-w-0">
          {children}
        </div>
      </div>
    </Container>
  );
}