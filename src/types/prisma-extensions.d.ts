import { Prisma } from '@prisma/client';

// Extend Prisma namespace for include types
declare namespace Prisma {
  // Add missing include properties
  interface ProductInclude {
    category?: boolean;
  }

  interface QuotationInclude {
    attachments?: boolean;
  }
}

// Extend PrismaClient to include missing models
declare module '@prisma/client' {
  interface PrismaClient {
    attachment: {
      findUnique: (args: any) => Promise<any>;
      findMany: (args: any) => Promise<any[]>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      delete: (args: any) => Promise<any>;
      deleteMany: (args: any) => Promise<any>;
    };
  }
}
