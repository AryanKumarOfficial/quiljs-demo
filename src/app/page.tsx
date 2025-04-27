import Link from "next/link";
import { getServerSession } from "next-auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import { Card } from "@/components/ui/card";
import { MotionDiv } from "@/components/ui/motion-div";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  return (
    <main>
      <Hero
        title={
          <>
            Your <span className="text-blue-500">Cloud Notes</span> Solution
          </>
        }
        subtitle="Create, organize, and access your notes from anywhere. Rich text editing with cloud sync and sharing features."
        image="/file.svg"
        primaryAction={
          isAuthenticated ? (
            <Link href="/notes">
              <Button className="font-semibold" size="lg">
                Go to My Notes
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="font-semibold" size="lg">
                Get Started
              </Button>
            </Link>
          )
        }
        secondaryAction={
          isAuthenticated ? (
            <Link href="/notes/new">
              <Button variant="outline" className="font-semibold" size="lg">
                Create New Note
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button variant="outline" className="font-semibold" size="lg">
                Sign Up for Free
              </Button>
            </Link>
          )
        }
      />

      {/* Features Section */}
      <Container className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Powerful Notes Taking Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our cloud notes app comes with everything you need to capture, organize and
            share your ideas, research, and knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Multiple Editor Types"
            description="Choose between rich text, markdown, or simple text editors based on your preference."
            icon={
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />

          <FeatureCard
            title="Organization Tools"
            description="Organize notes with tags, folders, and favorites for quick access."
            icon={
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
          />

          <FeatureCard
            title="Cloud Sync"
            description="Access your notes from any device with secure cloud synchronization."
            icon={
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            }
          />

          <FeatureCard
            title="Collaboration"
            description="Share notes with colleagues and friends. Control who can view or edit."
            icon={
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />

          <FeatureCard
            title="Auto-Save"
            description="Never lose your work with automatic saving of all your changes."
            icon={
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            }
          />

          <FeatureCard
            title="Powerful Search"
            description="Find any note instantly with our powerful search functionality."
            icon={
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to organize your notes in the cloud?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Join thousands of users who have transformed the way they take and manage notes.
              Get started for free today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/notes">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      Go to My Notes
                    </Button>
                  </Link>
                  <Link href="/notes/new">
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-blue-700">
                      Create New Note
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-blue-700">
                      Sign Up for Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <MotionDiv
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="p-6 h-full flex flex-col border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 flex-grow">{description}</p>
      </Card>
    </MotionDiv>
  );
}
