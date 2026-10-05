import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { seedProductsIfEmpty, forceSeedProducts } from '../firebase/products';

export const AdminSettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Settings — PawMart Admin';
  }, []);

  const handleSeed = async (force: boolean = false) => {
    try {
      setSeeding(true);
      setMessage(null);
      if (force) {
        await forceSeedProducts();
        setMessage('Complete 20-product curated catalog re-seeded successfully!');
      } else {
        const res = await seedProductsIfEmpty();
        if (res) {
          setMessage('Sample catalog loaded successfully!');
        } else {
          setMessage('Catalog already has products. Use "Force Re-Seed" if you want to overwrite/refresh.');
        }
      }
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Operation failed'));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="System Settings">
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Platform & Database Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configuration details for Cloud Firestore, Amazon product link handling, and administrative permissions.
            </p>
          </div>

          {/* Admin Profile Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Administrator Account</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Admin Name</span>
                <span className="font-bold text-slate-800 text-sm">{profile?.name || 'Parvez'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Admin Email</span>
                <span className="font-bold text-slate-800 text-sm">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Database & Seed Utilities */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Database Utilities</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              If your database was newly provisioned or reset, you can re-seed all 20 curated sample products across Cats, Dogs, T-Shirts, Hoodies, and Books with pre-configured images and direct store link structures.
            </p>

            {message && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSeed(false)}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Seeding...' : 'Seed Catalog If Empty'}</span>
              </button>

              <button
                onClick={() => handleSeed(true)}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Updating...' : '⚡ Force Refresh / Restore 20 Items'}</span>
              </button>
            </div>
          </div>

          {/* Amazon Partner Policy Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Partner Policy & Integrity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PawMart never replaces or alters the administrator's custom product tags. All product detail pages dynamically render the exact URL stored in Firestore and open in secure external tabs with <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">rel="noopener noreferrer"</code>.
            </p>
          </div>

        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
