import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Commerce Quotation Platform',
  description: 'A platform for managing product inventories and generating custom quotations',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
