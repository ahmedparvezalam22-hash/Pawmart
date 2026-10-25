import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../utils/navigation';
import { ShieldAlert } from 'lucide-react';
import { ADMIN_EMAIL } from '../../firebase/authService';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const { navigate } = useRouter();

  // Strict Master Admin Verification:
  // Under NO circumstances can any email other than ahmedparvezalam22@gmail.com pass this check
  const isAuthorizedMasterAdmin = Boolean(
    user &&
    user.email &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    isAdmin
  );

  useEffect(() => {
    if (!loading && !isAuthorizedMasterAdmin) {
      const timer = setTimeout(() => {
        navigate('/admin/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthorizedMasterAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthorizedMasterAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold mb-2 tracking-tight text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Administrator privileges are required to access this console.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/login')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Admin Sign In
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
