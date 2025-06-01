import { PrismaClient, Prisma } from '@prisma/client';

// Extend Prisma namespace to include missing types
declare global {
  namespace PrismaNamespace {
    // Define the structure of Product and Quotation models
    interface Product {
      category?: { name: string } | null;
    }

    interface Quotation {
      attachments?: any[];
    }
  }
}

// Extend Prisma client types
declare module '@prisma/client' {
  // Fix missing attachment property in PrismaClient
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

// Extend Prisma namespace for include types
declare namespace Prisma {
  export interface ProductInclude extends Prisma.ProductInclude {
    category?: boolean;
  }

  export interface QuotationInclude extends Prisma.QuotationInclude {
    attachments?: boolean;
  }
}
