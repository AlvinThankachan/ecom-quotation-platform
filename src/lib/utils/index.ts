import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names or class values into a single string
 * Uses clsx and tailwind-merge to handle conditional classes and resolve Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price value to a currency string
 */
export function formatPrice(price: number, options: {
  currency?: 'USD' | 'EUR' | 'GBP' | 'INR',
  notation?: Intl.NumberFormatOptions['notation']
} = {}) {
  const { currency = 'USD', notation = 'standard' } = options;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
