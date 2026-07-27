import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

const result = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID || "orbitiq",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
      issuer: process.env.AUTH_KEYCLOAK_ISSUER || "http://localhost:8081/realms/orbitiq",
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@company.com" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        if (!email || typeof email !== "string") return null;

        const [local, domain] = email.split("@");
        if (!local || !domain) return null;

        const name = local
          .split(/[._-]/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

        return {
          id: `email-${email}`,
          email,
          name,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.email) session.user.email = token.email as string;
      if (token.name) session.user.name = token.name as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export const handlers = result.handlers;
export const signIn = result.signIn;
export const signOut = result.signOut;
export const auth = result.auth as (req?: any) => Promise<any>;
