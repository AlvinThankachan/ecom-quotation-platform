import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc/trpc';
import { TRPCError } from '@trpc/server';
import { QuotationStatus } from '@prisma/client';

// Input validation schemas
const quotationItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).max(100).default(0),
});

const createQuotationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string(),
  notes: z.string().optional(),
  validUntil: z.date().optional(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
});

const updateQuotationSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').optional(),
  notes: z.string().optional(),
  validUntil: z.date().optional(),
  status: z.nativeEnum(QuotationStatus).optional(),
});

const updateQuotationItemsSchema = z.object({
  quotationId: z.string(),
  items: z.array(quotationItemSchema.extend({
    id: z.string().optional(), // For existing items
  })),
});

export const quotationRouter = createTRPCRouter({
  // Get all quotations (protected - users see their own, admins see all)
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
      status: z.nativeEnum(QuotationStatus).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, status } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      
      // Determine filter based on user role
      const where = {
        ...(status ? { status } : {}),
        ...(userRole === 'ADMIN' 
          ? {} // Admins can see all quotations
          : userRole === 'DISTRIBUTOR'
            ? { createdById: userId } // Distributors see quotations they created
            : { clientId: userId }), // Clients see quotations addressed to them
      };
      
      const items = await ctx.prisma.quotation.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          attachments: true,
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

  // Get quotation by ID (protected)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      
      const quotation = await ctx.prisma.quotation.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          attachments: true,
        } as any,
      });

      if (!quotation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quotation not found',
        });
      }

      // Check permissions
      if (
        userRole !== 'ADMIN' && 
        quotation.createdById !== userId && 
        quotation.clientId !== userId
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this quotation',
        });
      }

      return quotation;
    }),

  // Create quotation (protected - distributors and admins only)
  create: protectedProcedure
    .input(createQuotationSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...data } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      
      // Only distributors and admins can create quotations
      if (userRole !== 'ADMIN' && userRole !== 'DISTRIBUTOR') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only distributors and admins can create quotations',
        });
      }
      
      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => {
        const itemTotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
        return sum + itemTotal;
      }, 0);
      
      // Create quotation with items in a transaction
      const quotation = await ctx.prisma.$transaction(async (prisma) => {
        // Create the quotation
        const newQuotation = await prisma.quotation.create({
          data: {
            ...data,
            totalAmount,
            status: QuotationStatus.DRAFT,
            createdById: userId,
            items: {
              create: items.map(item => ({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                product: {
                  connect: { id: item.productId }
                }
              }))
            }
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            client: true,
            createdBy: true,
          },
        });
        
        return newQuotation;
      });
      
      return quotation;
    }),

  // Update quotation (protected)
  update: protectedProcedure
    .input(updateQuotationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      
      // Check if quotation exists and user has permission
      const existingQuotation = await ctx.prisma.quotation.findUnique({
        where: { id },
        select: { 
          createdById: true,
          status: true,
        },
      });

      if (!existingQuotation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quotation not found',
        });
      }

      // Only allow admins or the creator to update the quotation
      if (userRole !== 'ADMIN' && existingQuotation.createdById !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this quotation',
        });
      }
      
      // Prevent updates to non-draft quotations unless you're an admin or changing status
      if (
        existingQuotation.status !== QuotationStatus.DRAFT &&
        userRole !== 'ADMIN' &&
        (!data.status || Object.keys(data).length > 1)
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only draft quotations can be fully updated',
        });
      }

      const updatedQuotation = await ctx.prisma.quotation.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          client: true,
          createdBy: true,
          attachments: true,
        } as any,
      });

      return updatedQuotation;
    }),

  // Update quotation items (protected)
  updateItems: protectedProcedure
    .input(updateQuotationItemsSchema)
    .mutation(async ({ ctx, input }) => {
      const { quotationId, items } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      
      // Check if quotation exists and user has permission
      const existingQuotation = await ctx.prisma.quotation.findUnique({
        where: { id: quotationId },
        include: {
          items: true,
        },
      });

      if (!existingQuotation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quotation not found',
        });
      }

      // Only allow admins or the creator to update items
      if (userRole !== 'ADMIN' && existingQuotation.createdById !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this quotation',
        });
      }
      
      // Prevent updates to non-draft quotations
      if (existingQuotation.status !== QuotationStatus.DRAFT) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only draft quotations can be updated',
        });
      }

      // Get existing item IDs
      const existingItemIds = existingQuotation.items.map(item => item.id);
      
      // Identify items to create, update, or delete
      const itemsToCreate = items.filter(item => !item.id);
      const itemsToUpdate = items.filter(item => item.id && existingItemIds.includes(item.id));
      const itemIdsToKeep = itemsToUpdate.map(item => item.id) as string[];
      const itemIdsToDelete = existingItemIds.filter(id => !itemIdsToKeep.includes(id));

      // Calculate new total amount
      const totalAmount = items.reduce((sum, item) => {
        const itemTotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
        return sum + itemTotal;
      }, 0);

      // Update quotation and items in a transaction
      const updatedQuotation = await ctx.prisma.$transaction(async (prisma) => {
        // Delete removed items
        if (itemIdsToDelete.length > 0) {
          await prisma.quotationItem.deleteMany({
            where: {
              id: {
                in: itemIdsToDelete,
              },
            },
          });
        }

        // Update existing items
        for (const item of itemsToUpdate) {
          const { id, ...itemData } = item;
          await prisma.quotationItem.update({
            where: { id },
            data: {
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              discount: itemData.discount,
              productId: itemData.productId,
            },
          });
        }

        // Create new items
        for (const item of itemsToCreate) {
          await prisma.quotationItem.create({
            data: {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              quotation: {
                connect: { id: quotationId },
              },
              product: {
                connect: { id: item.productId },
              },
            },
          });
        }

        // Update quotation total
        return prisma.quotation.update({
          where: { id: quotationId },
          data: {
            totalAmount,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            client: true,
            createdBy: true,
          },
        });
      });

      return updatedQuotation;
    }),

  // Delete quotation (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Check if quotation exists and user has permission
      const existingQuotation = await ctx.prisma.quotation.findUnique({
        where: { id },
        select: { 
          createdById: true,
          status: true,
        },
      });

      if (!existingQuotation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quotation not found',
        });
      }

      // Only allow admins or the creator to delete the quotation
      if (userRole !== 'ADMIN' && existingQuotation.createdById !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this quotation',
        });
      }

      // Only allow deletion of draft quotations unless you're an admin
      if (existingQuotation.status !== QuotationStatus.DRAFT && userRole !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only draft quotations can be deleted',
        });
      }

      // Delete quotation and related items in a transaction
      await ctx.prisma.$transaction(async (tx) => {
        // Delete quotation items
        await tx.quotationItem.deleteMany({
          where: { quotationId: id },
        });
        
        // Delete attachments
        await tx.attachment.deleteMany({
          where: { quotationId: id },
        });
        
        // Delete the quotation itself
        await tx.quotation.delete({
          where: { id },
        });
      });

      return { success: true };
    }),
});
