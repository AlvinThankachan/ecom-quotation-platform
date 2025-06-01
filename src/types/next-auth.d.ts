import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

/**
 * Module augmentation for next-auth types
 * Allows us to add custom properties to the session and user objects
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
  }
}
