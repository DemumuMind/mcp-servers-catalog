import type { DefaultSession } from "@auth/core/types"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db, users } from "./db"
import { eq } from "drizzle-orm"
import { logger } from "./logger"

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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1)

          const user = result[0]

          if (!user || !user.password) return null

          const isValid = await compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) return null

          if (process.env.NODE_ENV !== 'production') {
            logger.info('[AUTH] Login success:', credentials.email)
          }

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
