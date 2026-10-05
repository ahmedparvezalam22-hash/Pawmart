import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../utils/navigation';
import { ShieldAlert } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Administrator privileges are required to access this panel.
        </p>
        <button
          onClick={() => navigate('/admin/login')}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
