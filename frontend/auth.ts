import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/schemas";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type AuthorizedUser = {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  roles: string[];
};

export const authOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data)
        });

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as {
          accessToken: string;
          user: { id: string; email: string; name: string; roles: string[] };
        };

        return {
          ...payload.user,
          accessToken: payload.accessToken,
          roles: payload.user.roles
        } satisfies AuthorizedUser;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const authorized = user as AuthorizedUser;
        token.accessToken = authorized.accessToken;
        token.roles = authorized.roles;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.roles = (token.roles as string[] | undefined) ?? [];
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
} satisfies NextAuthOptions;

export const authHandler = NextAuth(authOptions);
