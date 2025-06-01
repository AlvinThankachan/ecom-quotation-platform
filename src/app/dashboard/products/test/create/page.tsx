'use client';

import { useState } from 'react';
import { api } from '@/lib/api/trpc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProductFormData } from '@/types/product';

export default function TestCreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    sku: '',
    brand: '',
    inStock: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Use the tRPC mutation hook
  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      // Navigate back to product list on success
      router.push('/dashboard/products/test');
    },
    onError: (error) => {
      // Handle validation errors from the server
      setFormErrors({
        server: error.message,
      });
    },
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      errors.imageUrl = 'Image URL must be a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Submit the form data to the server via tRPC mutation
    createProduct.mutate({
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl || undefined,
      sku: formData.sku || undefined,
      brand: formData.brand || undefined,
      inStock: formData.inStock,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">tRPC Test: Create Product</h1>
        <p className="text-gray-600">
          This page demonstrates using tRPC mutations to create a new product.
        </p>
      </div>

      {/* Server error message */}
      {formErrors.server && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{formErrors.server}</p>
        </div>
      )}

      {/* Loading indicator */}
      {createProduct.isLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>Creating product...</p>
        </div>
      )}

      {/* Success message */}
      {createProduct.isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Success!</p>
          <p>Product created successfully. Redirecting...</p>
        </div>
      )}

      {/* Product creation form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md ${
              formErrors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {formErrors.price && (
            <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md ${
              formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/image.jpg"
          />
          {formErrors.imageUrl && (
            <p className="mt-1 text-sm text-red-600">{formErrors.imageUrl}</p>
          )}
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* In Stock */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
            In Stock
          </label>
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard/products/test"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createProduct.isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              createProduct.isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {createProduct.isLoading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
