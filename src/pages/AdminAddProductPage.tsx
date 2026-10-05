import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ProductForm } from '../components/admin/ProductForm';
import { createProduct } from '../firebase/products';
import { useRouter } from '../utils/navigation';
import { Product } from '../types';

export const AdminAddProductPage: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Add New Product — PawMart Admin';
  }, []);

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
    try {
      setLoading(true);
      await createProduct(data);
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Error adding product:', err);
      alert('Failed to save product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="Add Product">
        <div className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Create New Product
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add product imagery, details, and the Amazon referral link. Once published, it immediately displays publicly.
            </p>
          </div>

          <ProductForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
