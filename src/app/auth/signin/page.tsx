'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormData } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      
      await signIn('email', {
        email: data.email,
        redirect: false,
      });
      
      setSuccess(true);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="mt-2 text-gray-600">
            Enter your email to receive a magic link
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4 text-center">
            <h3 className="text-lg font-medium text-green-800">Check your email</h3>
            <p className="mt-2 text-sm text-green-700">
              We&apos;ve sent you a magic link to sign in.
            </p>
            <Button
              variant="link"
              className="mt-4"
              onClick={() => setSuccess(false)}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                Back to home
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
