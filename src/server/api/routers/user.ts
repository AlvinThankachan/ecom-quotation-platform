import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc/trpc';
import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';

// Input validation schemas
const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userRouter = createTRPCRouter({
  // Get all users (admin only)
  getAll: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
      role: z.nativeEnum(Role).optional(),
      searchQuery: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, role, searchQuery } = input;
      
      const items = await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        where: {
          ...(role ? { role } : {}),
          ...(searchQuery ? {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
            ],
          } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              quotations: true,
              clientQuotations: true,
              products: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Get user by ID (protected)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      
      // Users can only view their own profile unless they're an admin
      if (userRole !== 'ADMIN' && id !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this user',
        });
      }
      
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          emailVerified: true,
          _count: {
            select: {
              quotations: true,
              clientQuotations: true,
              products: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    }),

  // Get current user (protected)
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              quotations: true,
              clientQuotations: true,
              products: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    }),

  // Update user (admin only)
  update: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Check if user exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
        },
      });

      return updatedUser;
    }),

  // Get clients (distributors and admins only)
  getClients: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
      searchQuery: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, searchQuery } = input;
      const userRole = ctx.session.user.role;
      
      // Only distributors and admins can view clients
      if (userRole !== 'ADMIN' && userRole !== 'DISTRIBUTOR') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view clients',
        });
      }
      
      const items = await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        where: {
          role: 'CLIENT',
          ...(searchQuery ? {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
            ],
          } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          _count: {
            select: {
              clientQuotations: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
