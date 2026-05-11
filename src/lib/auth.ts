import type { DefaultSession } from "@auth/core/types"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./db"

declare module "@auth/core/types" {
  interface User {
    role?: string
    id?: string
  }
  interface Session {
    user: {
      role?: string
      id?: string
    } & DefaultSession["user"]
  }
}

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  secret,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("Auth attempt:", credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          console.log("Prisma user model exists:", !!prisma.user)
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          console.log("User found:", !!user)

          if (!user || !user.password) return null

          const isValid = await compare(
            credentials.password as string,
            user.password
          )

          console.log("Password valid:", isValid)

          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        } catch (err) {
          console.error("Auth authorize error:", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ request, auth }) {
      const pathname = request.nextUrl.pathname
      if (pathname.startsWith("/a-login") || pathname.startsWith("/api/auth")) return true
      if (pathname.startsWith("/admin")) {
        return !!auth?.user && auth.user.role === "admin"
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
