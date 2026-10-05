import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useRouter } from '../../utils/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
  adminMode?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, adminMode = false }) => {
  const { login, isAdmin, resetPassword } = useAuth();
  const { navigate } = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      
      if (adminMode) {
        if (email.trim().toLowerCase() !== 'ahmedparvezalam22@gmail.com') {
          setError('Access denied. Administrator privileges required.');
          setLoading(false);
          return;
        }
        if (onSuccess) onSuccess();
        navigate('/admin');
      } else {
        if (onSuccess) onSuccess();
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again in a few minutes.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address to reset password.');
      return;
    }
    try {
      setLoading(true);
      await resetPassword(email.trim());
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {adminMode ? 'Administrator Sign In' : 'Welcome Back'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {adminMode
            ? 'Enter your administrator credentials to access the PawMart management console.'
            : 'Sign in to access your saved favorites and preferences.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {resetSent && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm">
          Password reset email sent! Please check your inbox.
        </div>
      )}

      {!showForgot ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : adminMode ? 'Sign In as Administrator' : 'Sign In'}</span>
          </button>

          {!adminMode && (
            <div className="pt-4 text-center text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-bold text-amber-600 hover:underline">
                Sign Up for free
              </Link>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Enter your account email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
