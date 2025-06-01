'use client';

import { useState } from 'react';
import { api } from '@/lib/api/trpc';
import Link from 'next/link';
import { Package, Plus, Search, Filter } from 'lucide-react';
import type { Product, Category } from '@/types/product';

export default function ProductsPage() {
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
    <div className="container p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <Link 
          href="/dashboard/products/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-grow flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            className="px-4 py-2 border rounded-md"
            onChange={(e) => setCategoryId(e.target.value || undefined)}
            value={categoryId || ''}
          >
            <option value="">All Categories</option>
            {/* We would fetch categories from the API in a real implementation */}
            <option value="category1">Electronics</option>
            <option value="category2">Furniture</option>
            <option value="category3">Clothing</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading products</p>
          <p>{error?.message || 'An unknown error occurred'}</p>
        </div>
      )}

      {/* Products table */}
      {data && data.items.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search term or clear filters' : 'Get started by adding your first product'}
            </p>
            {!searchQuery && (
              <Link 
                href="/dashboard/products/create" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            )}
          </div>
        )
      )}

      {/* Pagination */}
      {data && data.nextCursor && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              // This would typically load the next page of results
              alert('Next page functionality would be implemented here');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Load More
          </button>
        </div>
      )}

      {/* Link to test page */}
      <div className="mt-8 pt-4 border-t">
        <Link href="/dashboard/products/test" className="text-blue-600 hover:underline">
          Go to tRPC Test Page
        </Link>
      </div>
    </div>
  );
}