import React, { useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ProductTable } from '../components/admin/ProductTable';
import { Product } from '../types';
import { Link } from '../utils/navigation';
import { PlusCircle } from 'lucide-react';

interface AdminProductsPageProps {
  products: Product[];
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ products }) => {
  useEffect(() => {
    document.title = 'Manage Products — PawMart Admin';
  }, []);

  return (
    <AdminRoute>
      <AdminLayout title="Product Management">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                All Products ({products.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your catalog listings, toggle visibility, and update product details.
              </p>
            </div>

            <Link
              to="/admin/products/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>

          <ProductTable products={products} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
