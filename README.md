# E-Commerce Quotation Platform

A scalable, modular, and user-centric platform that enables distributors to manage product inventories, generate custom quotations, and communicate efficiently with clients.

## Features

### MVP Features
- **Authentication & Access**
  - Email magic link login via NextAuth
  - Role-based route protection and dashboard access

- **Product Catalog**
  - Add/edit/delete products (Admin & Distributor)
  - Import via Excel file (SheetJS)
  - Firebase Storage for image uploads
  - Product search + filters by type/brand/category

- **Quotation System**
  - Multi-step quotation builder
  - Add products with quantity, discounts, and notes
  - Quotation status tracking (Draft, Sent, Approved, Rejected)
  - View quotation as client with accept/reject actions

- **Admin Dashboard**
  - Manage users (create, update, remove)
  - View basic analytics on quotes & products

- **UI/UX & Navigation**
  - Responsive layout (Next.js + Tailwind)
  - Sidebar layout with page routing
  - Clear separation between client/distributor/admin flows

### Post-MVP Features
- Stripe integration for deposit payments
- Email + SMS via SendGrid and Twilio
- Firebase Functions for background jobs
- Admin impersonation of users
- PDF export with custom branding
- Theme switcher (light/dark mode)
- Multi-language support (i18n)

## Tech Stack

- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS)
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Query or Zustand
- **UI Components**: Headless UI, ShadCN, Lucide
- **Backend**: tRPC (typed client-server communication)
- **Database ORM**: Prisma
- **Database**: PostgreSQL (or PlanetScale for serverless)
- **File Storage**: Firebase Storage
- **Excel Handling**: SheetJS or PapaParse for file parsing
- **Hosting & DevOps**: Vercel, Railway/PlanetScale, GitHub Actions

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Firebase project (for storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ecom-quotation-platform.git
cd ecom-quotation-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Copy the `.env.example` file to `.env` and fill in your values.

4. Set up the database
```bash
npx prisma migrate dev --name init
```

5. Run the development server
```bash
npm run dev
```

## Project Structure

```
/src
  /app - Next.js App Router pages
  /components - Reusable UI components
  /lib - Utilities and helpers
  /server - Backend logic (tRPC, Prisma)
/prisma - Database schema and migrations
/public - Static assets
```

## License
MIT
