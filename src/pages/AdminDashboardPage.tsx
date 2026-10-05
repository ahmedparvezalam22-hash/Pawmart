import React, { useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { Product } from '../types';

interface AdminDashboardPageProps {
  products: Product[];
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ products }) => {
  useEffect(() => {
    document.title = 'Dashboard — PawMart Admin';
  }, []);

  return (
    <AdminRoute>
      <AdminLayout title="Dashboard Overview">
        <AdminDashboard products={products} />
      </AdminLayout>
    </AdminRoute>
  );
};
