import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import connectToDatabase from "./mongodb";
import User from "@/models/User";

// Use the User model directly instead of the collection
async function getUser(email: string) {
  await connectToDatabase();
  // Explicitly select password field which is hidden by default
  return await User.findOne({ email }).select('+password').exec();
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error page for authentication errors
    signOut: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Enable account linking by email
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Enable account linking by email
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUser(credentials.email);

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await compare(credentials.password, user.password);

          if (!passwordMatch) {
            return null;
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, {
            $set: { lastLogin: new Date() }
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Add user id to session.user object
        session.user.id = token.id as string;
        
        // If we have additional user data in token, add it to session
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger }) {
      // Initial sign in
      if (user) {
        // Copy user data to token
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      
      // Handle token updates
      if (trigger === "update" && token.sub) {
        try {
          await connectToDatabase();
          const userData = await User.findById(token.id);
          if (userData) {
            token.name = userData.name;
            token.email = userData.email;
            token.image = userData.image;
          }
        } catch (err) {
          console.error("Failed to update JWT data:", err);
        }
      }
      
      return token;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, check if user exists in database
      if (account && account.provider !== "credentials") {
        try {
          await connectToDatabase();
          
          if (!user.email) {
            console.error("OAuth sign-in failed: No email provided");
            return false;
          }

          // Check if user already exists in database
          const existingUser = await User.findOne({ email: user.email?.toLowerCase() }).exec();
          
          if (!existingUser) {
            // Create new user entry if they don't exist
            const newUser = new User({
              name: user.name || user.email?.split('@')[0],
              email: user.email.toLowerCase(),
              image: user.image || null,
              authProviders: [account.provider],
              isVerified: true, // OAuth users are considered verified
              lastLogin: new Date()
            });
            await newUser.save();
          } else {
            // Update existing user's OAuth provider info if needed
            await User.findByIdAndUpdate(existingUser._id, {
              $set: {
                image: user.image || existingUser.image,
                lastLogin: new Date(),
                isVerified: true,
              },
              $addToSet: {
                authProviders: account.provider,
              }
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error during OAuth sign in:", error);
          return false;
        }
      }
      
      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};