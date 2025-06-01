'use client';

import { useState } from 'react';
import { api } from '@/lib/api/trpc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Product, Category } from '@/types/product';

export default function TestProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  
  // Use the tRPC hook to fetch products
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = api.product.getAll.useQuery(
    {
      limit: 10,
      searchQuery: searchQuery || undefined,
      categoryId: categoryId,
    },
    {
      // Don't refetch on window focus for this test page
      refetchOnWindowFocus: false,
    }
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Helper function to get category name
  const getCategoryName = (category: Product['category']): string => {
    if (!category) return 'Uncategorized';
    
    if (typeof category === 'string') {
      return category;
    }
    
    if (typeof category === 'object' && category !== null && 'name' in category) {
      return String((category as any).name);
    }
    
    return 'Uncategorized';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">tRPC Test: Product List</h1>
        <p className="text-gray-600">
          This page demonstrates the tRPC integration with React Query to fetch products from the backend.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="px-4 py-2 border rounded-md flex-grow"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading products...</div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading products</p>
          <p>{error?.message || 'An unknown error occurred'}</p>
        </div>
      )}

      {/* Products grid */}
      {data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-700 mb-2 line-clamp-2">
                  {product.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold">${product.price.toString()}</span>
                  <span className="text-sm text-gray-500">
                    {getCategoryName(product.category)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">No products found</p>
            <p className="text-sm text-gray-500">
              Try a different search or add some products to get started.
            </p>
          </div>
        )
      )}

      {/* Pagination */}
      {data && data.nextCursor && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              // This would typically load the next page of results
              // For this test, we're just showing the button
              alert('Next page functionality would be implemented here');
            }}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Load More
          </button>
        </div>
      )}

      {/* Create product test button */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Test Product Creation</h2>
        <button
          onClick={() => router.push('/dashboard/products/test/create')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Test Create Product
        </button>
      </div>

      {/* Back to dashboard */}
      <div className="mt-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}