// Product and category type definitions

export type Category = {
  id: string;
  name: string;
} | string | null | undefined;

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  sku?: string | null;
  brand?: string | null;
  inStock: boolean;
  category: Category;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// Form data type for product creation/editing
export type ProductFormData = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  sku: string;
  brand: string;
  inStock: boolean;
  categoryId?: string;
};
