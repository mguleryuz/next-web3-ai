import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { validateJWT } from "@/lib/auth-helpers";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
  }
}

export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token as string;
        if (typeof token !== "string" || !token) {
          throw new Error("Token is required");
        }

        const jwtPayload = await validateJWT(token);

        if (jwtPayload) {
          return {
            id: jwtPayload.sub || "",
            name: jwtPayload.name || "",
            email: jwtPayload.email || "",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return !!auth;
      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
