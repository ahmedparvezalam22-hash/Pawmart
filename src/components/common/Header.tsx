import React, { useState, useRef, useEffect } from 'react';
import { Search, Heart, User, LogOut, Menu, X, ShieldCheck, Sparkles, ExternalLink, ChevronDown, Layers } from 'lucide-react';
import { Logo } from './Logo';
import { Link, useRouter } from '../../utils/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, profile, isAdmin, logout } = useAuth();
  const { favoriteIds } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { label: 'Cats', href: '/cats', icon: '🐱', desc: 'Comfort & grooming finds' },
    { label: 'Dogs', href: '/dogs', icon: '🐶', desc: 'Gear & everyday essentials' },
    { label: 'Kids Toys', href: '/kids-toys', icon: '🧸', desc: 'Fun & educational toys for kids' },
    { label: 'Skin Care', href: '/skin-care', icon: '🧴', desc: 'Serums, cleansers & daily glow' },
    { label: 'Furniture', href: '/furniture', icon: '🛋️', desc: 'Chairs, desks & decor' },
    { label: 'Shoes', href: '/shoes', icon: '👟', desc: 'Sneakers & casual footwear' },
    { label: 'Wedding Collection', href: '/wedding-collection', icon: '💍', desc: 'Bridal wear & gifts' },
    { label: 'Jewelry Collection', href: '/jewelry-collection', icon: '✨', desc: 'Fine rings, necklaces & earrings' },
    { label: 'Electronics', href: '/electronics', icon: '⚡', desc: 'Smart gadgets & audio' },
    { label: 'Other Products', href: '/other-products', icon: '🎁', desc: 'Trending lifestyle finds & gifts' },
    { label: 'T-Shirts', href: '/t-shirts', icon: '👕', desc: 'Graphic & minimalist tees' },
    { label: 'Hoodies', href: '/hoodies', icon: '🧥', desc: 'Fleece & cozy pullovers' },
    { label: 'Books', href: '/books', icon: '📚', desc: 'Care guides & memoirs' },
  ];

  const primaryNavLinks = [
    { label: 'Home', href: '/' },
    { label: 'Cats', href: '/cats', icon: '🐱' },
    { label: 'Dogs', href: '/dogs', icon: '🐶' },
    { label: 'Kids Toys', href: '/kids-toys', icon: '🧸' },
    { label: 'Skin Care', href: '/skin-care', icon: '🧴' },
    { label: 'Furniture', href: '/furniture', icon: '🛋️' },
    { label: 'Shoes', href: '/shoes', icon: '👟' },
    { label: 'Electronics', href: '/electronics', icon: '⚡' },
    { label: 'Blog', href: '/blog', icon: '📝' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Announcement Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 text-[10px]">
              <Sparkles className="w-3 h-3" />
              <span>Curated Selection</span>
            </span>
            <span className="truncate text-slate-400 hidden sm:inline">
              Curated Amazon product discovery • Zero markups • Guaranteed Amazon customer protection
            </span>
            <span className="truncate text-slate-400 sm:hidden">
              Curated Amazon product discovery
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 text-slate-400">
            {!user && (
              <div className="hidden sm:flex items-center gap-2.5 pr-2 border-r border-slate-700 text-[11px] font-semibold">
                <Link to="/login" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
            <Link to="/disclosure" className="hover:text-amber-400 transition-colors">
              Disclosure
            </Link>
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              aria-label="Portal"
              className="p-1 rounded-full text-slate-500 hover:text-amber-400 transition-colors flex items-center justify-center"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-2 xl:gap-4">
            
            {/* Logo */}
            <Link to="/" className="group flex-shrink-0 flex items-center gap-2">
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 whitespace-nowrap">
              <Link
                to="/"
                className={`px-2.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  path === '/'
                    ? 'text-amber-700 bg-amber-50 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>

              {/* All Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className={`px-2.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    categoriesDropdownOpen || categories.some((c) => isActive(c.href))
                      ? 'text-amber-700 bg-amber-50 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>All Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${
                      categoriesDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {categoriesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Curated Product Collections
                    </div>
                    <div className="grid grid-cols-1 gap-1 py-1 max-h-[380px] overflow-y-auto">
                      {categories.map((cat) => (
                        <Link
                          key={cat.href}
                          to={cat.href}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive(cat.href)
                              ? 'bg-amber-50 text-amber-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 leading-tight">{cat.label}</p>
                            <p className="text-[10px] text-slate-400 truncate">{cat.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Quick Categories Links */}
              {primaryNavLinks
                .filter((item) => item.label !== 'Home')
                .map((item) => {
                  const active = isActive(item.href);
                  const hideOnCompactLaptop =
                    item.label === 'Furniture' || item.label === 'Shoes' || item.label === 'Electronics';
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`${
                        hideOnCompactLaptop ? 'hidden 2xl:flex' : 'flex'
                      } px-2.5 py-2 text-xs font-semibold rounded-xl transition-all items-center gap-1 whitespace-nowrap ${
                        active
                          ? 'text-amber-700 bg-amber-50 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon && <span className="text-xs">{item.icon}</span>}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>

            {/* Right actions: Search, Favorites, Auth */}
            <div className="hidden md:flex items-center space-x-2 xl:space-x-2.5 flex-shrink-0">
              {/* Search Bar in header */}
              <form onSubmit={handleSearchSubmit} className="relative w-36 xl:w-48">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner-xs"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </form>

              {/* Favorites link */}
              <Link
                to="/favorites"
                className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-full transition-colors flex-shrink-0"
                title="My Favorites"
              >
                <Heart className="w-5 h-5" />
                {favoriteIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {favoriteIds.length > 99 ? '99+' : favoriteIds.length}
                  </span>
                )}
              </Link>

              {/* Language & Country Selector */}
              <LanguageSelector variant="header" />

              {/* Logged in state vs Visitor state */}
              {user ? (
                <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-2.5 flex-shrink-0">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      aria-label="Portal"
                      className="p-2 rounded-full bg-amber-500/15 text-amber-600 hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center justify-center"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="max-w-[90px] truncate">{profile?.name || user.email?.split('@')[0]}</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-2.5 flex-shrink-0 whitespace-nowrap">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs shadow-amber-500/20 transition-all uppercase tracking-wider whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Right Controls */}
            <div className="flex items-center gap-1.5 md:hidden">
              <LanguageSelector variant="pill" />

              <Link
                to="/favorites"
                className="relative p-2 text-slate-600 hover:text-amber-600 rounded-lg"
                title="Favorites"
              >
                <Heart className="w-5 h-5" />
                {favoriteIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Country & Language Selector */}
          <LanguageSelector variant="mobile" />

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products on Amazon..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-100 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>

          {/* Mobile Links */}
          <nav className="flex flex-col space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-between ${
                path === '/' ? 'text-amber-600 bg-amber-50' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🏠 Home</span>
              <span className="text-[10px] text-slate-400">Main</span>
            </Link>

            <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Browse Categories
            </div>

            {categories.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-between ${
                    active ? 'text-amber-600 bg-amber-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">View</span>
                </Link>
              );
            })}

            <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Editorial & Stories
            </div>

            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-between ${
                isActive('/blog') ? 'text-amber-600 bg-amber-50' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>📝</span>
                <span>Blog & Guides</span>
              </span>
              <span className="text-[10px] text-amber-500 font-bold">New</span>
            </Link>
          </nav>

          {/* Mobile Auth / Profile */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex justify-end">
              <Link
                to={isAdmin ? '/admin' : '/admin/login'}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Portal"
                className="p-1.5 rounded-full text-slate-400 hover:text-amber-500 transition-colors inline-flex items-center justify-center"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </div>

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-100"
                >
                  <User className="w-5 h-5 text-slate-400" />
                  <span>Profile ({profile?.name || user.email})</span>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-red-600 font-semibold text-sm hover:bg-red-50 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
