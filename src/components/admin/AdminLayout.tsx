import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  BookOpen,
  PenTool,
  MessageSquareQuote,
  Bell
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Link, useRouter } from '../../utils/navigation';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { path, navigate } = useRouter();
  const { user, profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Add Product', href: '/admin/products/add', icon: PlusCircle },
    { label: 'Customer Reviews', href: '/admin/reviews', icon: MessageSquareQuote },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Bell },
    { label: 'Blogs & Guides', href: '/admin/blogs', icon: BookOpen },
    { label: 'Add Blog Post', href: '/admin/blogs/add', icon: PenTool },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size="sm" variant="light" />
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between z-50 transition-transform duration-300 border-r border-slate-800 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Logo & Admin Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <Logo size="md" variant="light" />
              <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </div>
            </div>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = path === item.href || (item.href !== '/admin' && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2.5 flex-shrink-0">
          
          {/* Admin User info */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30 flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{profile?.name || 'Parvez'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Admin Session'}</p>
            </div>
          </div>

          {/* Link to public website */}
          <Link
            to="/"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </span>
          </Link>

          {/* Prominent Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout of Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between h-18 px-8 bg-white border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <Link
              to="/admin/products/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-xs shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
};
