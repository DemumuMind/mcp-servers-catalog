import type { DefaultSession } from "@auth/core/types"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { NextResponse } from "next/server"

declare module "@auth/core/types" {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

        const [{ compare }, { prisma }] = await Promise.all([
          import("bcryptjs"),
          import("./db"),
        ])

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const isValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
      }
      return session
    },
    authorized({ request, auth }) {
      const pathname = request.nextUrl.pathname
      if (pathname.startsWith("/admin/login")) return true
      if (pathname.startsWith("/admin")) {
        if (!auth?.user) return false
        if (auth.user.role !== "admin") {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
})
