import { z } from 'zod';

/**
 * Schema for validating sign-in form data
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
});

/**
 * Schema for validating sign-up form data
 */
export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  role: z.enum(['ADMIN', 'DISTRIBUTOR', 'CLIENT'], {
    required_error: 'Please select a role',
  }),
});

/**
 * Type definitions derived from the schemas
 */
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
