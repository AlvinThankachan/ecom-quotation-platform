import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import type { Session } from 'next-auth';
import superjson from 'superjson';
import { getServerSession } from 'next-auth';
import { prisma } from '../../db/client';
import { authOptions } from '@/lib/auth';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 */

/**
 * Context creation for tRPC requests
 * Supports both App Router and Pages Router
 */
type ContextOptions = {
  session?: Session | null;
} & Partial<CreateNextContextOptions>;

export const createTRPCContext = async (opts: ContextOptions) => {
  let session = opts.session;
  
  // If session is not provided but we have req/res (Pages Router), get the session
  if (!session && opts.req && opts.res) {
    session = await getServerSession(authOptions);
  }

  return {
    prisma,
    session,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 */
export const publicProcedure = t.procedure;

/**
 * Middleware to check if user is authenticated
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authed) procedure
 */
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Role-based middleware for admin access
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await prisma.user.findUnique({
    where: { id: ctx.session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Admin-only procedure
 */
export const adminProcedure = t.procedure.use(isAdmin);

/**
 * Role-based middleware for distributor access
 */
const isDistributor = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await prisma.user.findUnique({
    where: { id: ctx.session.user.id },
  });

  if (!user || (user.role !== 'DISTRIBUTOR' && user.role !== 'ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Distributor access required' });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Distributor-only procedure (also allows admin)
 */
export const distributorProcedure = t.procedure.use(isDistributor);
 