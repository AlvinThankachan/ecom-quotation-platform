import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure, distributorProcedure } from '../trpc/trpc';
import { TRPCError } from '@trpc/server';

// Input validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url().optional().nullable(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  inStock: z.boolean().default(true),
  categoryId: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

export const productRouter = createTRPCRouter({
  // Get all products (public)
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
      categoryId: z.string().optional(),
      searchQuery: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, categoryId, searchQuery } = input;
      
      const items = await ctx.prisma.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        where: {
          ...(categoryId ? { categoryId } : {}),
          ...(searchQuery ? {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
              { sku: { contains: searchQuery, mode: 'insensitive' } },
            ],
          } : {}),
        },
        include: {
          category: true,
        } as any,
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

  // Get product by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const product = await ctx.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        } as any,
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      return product;
    }),

  // Create product (admin/distributor only)
  create: distributorProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create a product',
        });
      }

      const product = await ctx.prisma.product.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      return product;
    }),

  // Update product (admin/distributor only)
  update: distributorProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if product exists and user has permission
      const existingProduct = await ctx.prisma.product.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // Only allow admins or the creator to update the product
      if (ctx.session.user.role !== 'ADMIN' && existingProduct.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this product',
        });
      }

      const updatedProduct = await ctx.prisma.product.update({
        where: { id },
        data,
        include: {
          category: true,
        } as any,
      });

      return updatedProduct;
    }),

  // Delete product (admin/distributor only)
  delete: distributorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if product exists and user has permission
      const existingProduct = await ctx.prisma.product.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // Only allow admins or the creator to delete the product
      if (ctx.session.user.role !== 'ADMIN' && existingProduct.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this product',
        });
      }

      await ctx.prisma.product.delete({
        where: { id },
      });

      return { success: true };
    }),
});
