import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ProductForm } from '../components/admin/ProductForm';
import { updateProduct, getProductByIdOrSlug } from '../firebase/products';
import { useRouter } from '../utils/navigation';
import { Product } from '../types';
import { AlertCircle } from 'lucide-react';

interface AdminEditProductPageProps {
  productId: string;
}

export const AdminEditProductPage: React.FC<AdminEditProductPageProps> = ({ productId }) => {
  const { navigate } = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Edit Product — PawMart Admin';
    const fetchProd = async () => {
      setLoading(true);
      const data = await getProductByIdOrSlug(productId);
      setProduct(data);
      setLoading(false);
    };
    fetchProd();
  }, [productId]);

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
    try {
      setSaving(true);
      await updateProduct(productId, data);
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert('Failed to update product: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="Edit Product">
        <div className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Edit Product Details
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Update information, product links, or publish status. Changes reflect immediately on PawMart.
            </p>
          </div>

          {loading ? (
            <div className="max-w-4xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 text-center animate-pulse">
              <p className="text-slate-400 text-sm">Loading product data...</p>
            </div>
          ) : !product ? (
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="text-slate-700 font-bold mb-4">Product not found</p>
              <button
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Back to Products
              </button>
            </div>
          ) : (
            <ProductForm
              initialProduct={product}
              onSubmit={handleSubmit}
              loading={saving}
            />
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
