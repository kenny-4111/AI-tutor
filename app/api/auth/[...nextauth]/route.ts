import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password.");
        }

        const demoEmail = process.env.DEMO_USER_EMAIL;
        const demoPassword = process.env.DEMO_USER_PASSWORD;

        if (demoEmail && demoPassword) {
          if (
            credentials.email.toLowerCase() === demoEmail.toLowerCase() &&
            credentials.password === demoPassword
          ) {
            return {
              id: demoEmail,
              email: demoEmail,
              name: demoEmail.split("@")[0],
            };
          }

          throw new Error("Invalid credentials.");
        }

        throw new Error("Email/password sign-in is not available yet.");
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
