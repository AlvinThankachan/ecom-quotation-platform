'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We&apos;ve sent you a magic link to sign in.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The link will expire after 24 hours. If you don&apos;t see the email, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/auth/signin">
              <Button variant="outline" className="mt-4">
                Use a different email
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
