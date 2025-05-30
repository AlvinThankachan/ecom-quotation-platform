import { createTRPCRouter } from './trpc/trpc';

/**
 * This is the primary router for your server.
 * 
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Add routers here as we build them
  // Example: user: userRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
