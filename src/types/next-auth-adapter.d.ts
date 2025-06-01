import { Adapter, AdapterUser, AdapterSession, AdapterAccount } from "next-auth/adapters";
import { PrismaClient, User, Role } from "@prisma/client";

/**
 * Type definitions to help bridge the gap between Prisma models and NextAuth adapter requirements
 */

// Define a type that converts nullable fields to non-nullable for NextAuth compatibility
export type PrismaUserToAdapterUser = Omit<User, 'email'> & {
  email: string; // Make email non-nullable for NextAuth
};

// Helper type for the adapter
export interface PrismaAdapter extends Adapter {
  createUser: (user: Omit<AdapterUser, "id">) => Promise<AdapterUser>;
  getUser: (id: string) => Promise<AdapterUser | null>;
  getUserByEmail: (email: string) => Promise<AdapterUser | null>;
  getUserByAccount: (providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">) => Promise<AdapterUser | null>;
  updateUser: (user: Partial<AdapterUser> & Pick<AdapterUser, "id">) => Promise<AdapterUser>;
  deleteUser: (userId: string) => Promise<void>;
  linkAccount: (account: AdapterAccount) => Promise<void>;
  unlinkAccount: (providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">) => Promise<void>;
  getSessionAndUser: (sessionToken: string) => Promise<{ session: AdapterSession; user: AdapterUser } | null>;
}

// Helper function type to convert Prisma User to AdapterUser
export type PrismaUserConverter = (user: User | null) => AdapterUser | null;
