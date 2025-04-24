import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs"; // Changed from bcrypt to bcryptjs
import mongoose from "mongoose";
import connectToDatabase from "./mongodb";
import User from "@/models/User";

// Use the User model directly instead of the collection
async function getUser(email: string) {
  await connectToDatabase();
  return await User.findOne({ email }).exec();
}

export const authOptions: NextAuthOptions = {
  // When using credentials provider, an adapter should not be used
  // Remove the MongoDB adapter from here since it conflicts with JWT
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
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

          if (!user) {
            return null;
          }

          const passwordMatch = await compare(credentials.password, user.password);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
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
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, we need to check if the user exists in our database
      if (account && account.provider !== "credentials") {
        try {
          await connectToDatabase();
          
          // Check if user already exists in database
          const existingUser = await User.findOne({ email: user.email }).exec();
          
          if (!existingUser) {
            // Create new user entry if they don't exist
            const newUser = new User({
              name: user.name,
              email: user.email,
              image: user.image,
              // These users won't have a password since they authenticated via OAuth
              // You might want to add a field to indicate how they registered
              authProvider: account.provider,
            });
            await newUser.save();
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
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-that-should-be-changed'
};