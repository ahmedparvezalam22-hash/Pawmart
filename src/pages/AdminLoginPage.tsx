import React, { useEffect, useState } from 'react';
import { Logo } from '../components/common/Logo';
import { Link, useRouter } from '../utils/navigation';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  LogIn,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ADMIN_EMAIL } from '../firebase/authService';

export const AdminLoginPage: React.FC = () => {
  const { user, isAdmin, loading, login, setupAdmin } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'setup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Clean login state - never reveal or pre-populate admin credentials to visitors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Setup state
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Administrator Portal — PawMart';

    // If already signed in as admin on this device, redirect to /admin
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please provide both administrator email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(loginEmail.trim(), loginPassword);
      setSuccessMsg('Authenticated! Entering PawMart admin console...');
      setTimeout(() => {
        navigate('/admin');
      }, 300);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Incorrect administrator email or password. Please verify and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!setupEmail.trim()) {
      setError('Please enter the administrator email address.');
      return;
    }

    if (setupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (setupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await setupAdmin(setupPassword, setupEmail.trim());
      setSuccessMsg('Admin credentials successfully established!');
      setTimeout(() => {
        navigate('/admin');
      }, 300);
    } catch (err: any) {
      console.error('Admin setup error:', err);
      setError(err.message || 'Failed to update administrator account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-block group">
          <Logo size="lg" variant="light" />
        </Link>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-xs font-bold text-amber-400 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Administrator Control Console</span>
          </span>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Authorized management console for PawMart catalog and configuration.
        </p>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* If already authenticated session active on this browser */}
        {user && isAdmin && (
          <div className="mb-6 p-5 rounded-3xl bg-slate-900 border border-amber-500/40 text-center space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Authenticated Administrator Active</p>
              <p className="text-sm text-slate-200 mt-1 font-semibold">{user.email}</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Enter Admin Dashboard Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In with Credentials
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('setup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset / Change Password
            </button>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs leading-relaxed flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs leading-relaxed flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {activeTab === 'login' ? (
            /* Tab 1: Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="admin-email"
                    autoComplete="username"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter administrator email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="admin-password"
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              </button>
            </form>
          ) : (
            /* Tab 2: Setup / Change Password Form */
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-amber-400">Custom Password Setup: </span>
                Update or establish administrator credentials securely in the database.
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="setup-email"
                    autoComplete="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="Enter administrator email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Admin Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{submitting ? 'Updating...' : 'Save Password & Enter Dashboard'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Back Link */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <Link to="/" className="text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-semibold">
            <span>← Return to Public PawMart Discovery Website</span>
          </Link>
        </div>

      </div>

    </div>
  );
};
