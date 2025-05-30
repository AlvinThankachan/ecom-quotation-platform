import { DefaultSession } from 'next-auth';

/**
 * Module augmentation for next-auth types
 * Allows us to add custom properties to the session and user objects
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'DISTRIBUTOR' | 'CLIENT';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'ADMIN' | 'DISTRIBUTOR' | 'CLIENT';
  }
}
