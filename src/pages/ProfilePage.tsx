import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, KeyRound, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../utils/navigation';

export const ProfilePage: React.FC = () => {
  const { user, profile, logout, updateName, changePassword } = useAuth();
  const { navigate } = useRouter();

  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameMessage, setNameMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passMessage, setPassMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    document.title = 'My Profile — PawMart';
    if (!user) {
      navigate('/login');
    } else {
      setNewName(profile?.name || user.displayName || '');
    }
  }, [user, profile]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    if (!newName.trim()) {
      setNameMessage({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }
    try {
      setSavingName(true);
      await updateName(newName.trim());
      setNameMessage({ text: 'Profile name updated successfully!', type: 'success' });
    } catch (err: any) {
      setNameMessage({ text: err.message || 'Failed to update name.', type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    if (newPassword.length < 6) {
      setPassMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    try {
      setSavingPass(true);
      await changePassword(newPassword);
      setPassMessage({ text: 'Password changed successfully!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ text: err.message || 'Failed to change password. You may need to re-login.', type: 'error' });
    } finally {
      setSavingPass(false);
    }
  };

  if (!user) return null;

  const creationDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 mb-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-extrabold text-2xl">
                {(profile?.name || user.email || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.name || 'Member'}
                </h1>
                <p className="text-slate-500 text-sm">{user.email}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Account Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="font-bold text-slate-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block font-medium">Account Created</span>
                <span className="font-bold text-slate-800">{creationDate}</span>
              </div>
            </div>
          </div>

          {/* Forms Section */}
          <div className="pt-8 space-y-8">
            
            {/* Update Name Form */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>Update Personal Name</span>
              </h3>

              {nameMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
                    nameMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {nameMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{nameMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateName} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Full Name"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={savingName}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingName ? 'Saving...' : 'Update Name'}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Change Password</span>
              </h3>

              {passMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
                    passMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {passMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{passMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPass}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingPass ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
