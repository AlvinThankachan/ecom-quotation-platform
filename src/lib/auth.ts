import type { Adapter, AdapterUser } from 'next-auth/adapters';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaClient, User, Role } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { PrismaUserToAdapterUser } from '@/types/next-auth-adapter';

/**
 * Helper function to convert Prisma User to AdapterUser
 */
const convertPrismaUserToAdapterUser = (user: User | null): AdapterUser | null => {
  if (!user) return null;
  return {
    ...user,
    email: user.email || '', // Convert null to empty string for NextAuth compatibility
  };
};

/**
 * Custom Prisma adapter for NextAuth that works with our schema
 */
export function customPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    createUser: async (data: Omit<AdapterUser, "id">) => {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          emailVerified: data.emailVerified,
          image: data.image,
          role: 'CLIENT', // Default role for new users
        },
      });
      return convertPrismaUserToAdapterUser(user) as AdapterUser;
    },
    getUser: async (id) => {
      const user = await prisma.user.findUnique({ where: { id } });
      return convertPrismaUserToAdapterUser(user);
    },
    getUserByEmail: async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      return convertPrismaUserToAdapterUser(user);
    },
    getUserByAccount: async (provider_providerAccountId) => {
      const account = await prisma.account.findUnique({
        where: { 
          provider_providerAccountId: {
            provider: provider_providerAccountId.provider,
            providerAccountId: provider_providerAccountId.providerAccountId,
          },
        },
        select: { user: true },
      });
      return convertPrismaUserToAdapterUser(account?.user ?? null);
    },
    updateUser: async (data) => {
      const user = await prisma.user.update({
        where: { id: data.id },
        data,
      });
      return convertPrismaUserToAdapterUser(user) as AdapterUser;
    },
    deleteUser: async (id) => {
      await prisma.user.delete({ where: { id } });
      return; // Return void as expected by NextAuth
    },
    linkAccount: async (data: any) => {
      await prisma.account.create({
        data: {
          userId: data.userId,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          type: data.type,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        },
      });
      return; // Return void as expected by NextAuth
    },
    unlinkAccount: async (provider_providerAccountId) => {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider: provider_providerAccountId.provider,
            providerAccountId: provider_providerAccountId.providerAccountId,
          },
        },
      });
      return; // Return void as expected by NextAuth
    },
    createSession: (data: any) => {
      return prisma.session.create({ data });
    },
    getSessionAndUser: async (sessionToken) => {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      
      const adaptedUser = convertPrismaUserToAdapterUser(session.user);
      if (!adaptedUser) return null;
      
      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: adaptedUser,
      };
    },
    updateSession: (data: any) => {
      return prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },
    deleteSession: (sessionToken) => {
      return prisma.session.delete({ where: { sessionToken } });
    },
    createVerificationToken: (data: any) => {
      return prisma.verificationToken.create({ data });
    },
    useVerificationToken: async (identifier_token) => {
      try {
        return await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: identifier_token.identifier,
              token: identifier_token.token,
            },
          },
        });
      } catch {
        return null;
      }
    },
  };
}

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : undefined,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // In development, we can use a mock email service
      ...(process.env.NODE_ENV === 'development'
        ? {
            sendVerificationRequest: async ({ identifier, url }) => {
              console.log(`🔑 Magic link for ${identifier}: ${url}`);
            },
          }
        : {}),
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // Add user ID and role to the session
        if (token) {
          // When using JWT strategy
          session.user.id = token.sub as string;
          session.user.role = (token.role as 'ADMIN' | 'DISTRIBUTOR' | 'CLIENT') || 'CLIENT';
        } else if (user) {
          // When using database strategy
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true },
          });

          session.user.id = user.id;
          // Use a type assertion to ensure TypeScript knows this is a valid Role
          session.user.role = (dbUser?.role || 'CLIENT') as Role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add role to the JWT token when user first signs in
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role || 'CLIENT' as const;
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
