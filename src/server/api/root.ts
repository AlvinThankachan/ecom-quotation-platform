import { createTRPCRouter } from './trpc/trpc';
import { productRouter } from './routers/product';
import { quotationRouter } from './routers/quotation';
import { userRouter } from './routers/user';

/**
 * This is the primary router for your server.
 * 
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  quotation: quotationRouter,
  user: userRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
