import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import { RouterProvider, useRouter } from './utils/navigation';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { IOSQuickAccessPrompt } from './components/common/IOSQuickAccessPrompt';

import { Product } from './types';
import {
  subscribeToPublishedProducts,
  subscribeToAllProducts,
  seedProductsIfEmpty,
} from './firebase/products';
import { seedInitialBlogsIfEmpty } from './firebase/blogs';
import { CATEGORIES, getCategoryBySlug } from './services/categories';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogDetailPage } from './pages/BlogDetailPage';

// Admin Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminAddProductPage } from './pages/AdminAddProductPage';
import { AdminEditProductPage } from './pages/AdminEditProductPage';
import { AdminBlogsPage } from './pages/AdminBlogsPage';
import { AdminAddBlogPage } from './pages/AdminAddBlogPage';
import { AdminEditBlogPage } from './pages/AdminEditBlogPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import { AdminWebsiteReviewsPage } from './pages/AdminWebsiteReviewsPage';
import { AdminSubscribersPage } from './pages/AdminSubscribersPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

// Info Pages
import {
  AboutPage,
  ContactPage,
  PrivacyPage,
  TermsPage,
  AffiliateDisclosurePage,
  NotFoundPage,
} from './pages/InfoPages';

import { initAllMarketingPixels, trackAllPageView } from './services/adTracking';

const MainApp: React.FC = () => {
  const { path } = useRouter();
  const { isAdmin } = useAuth();
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Marketing Pixels (Meta, TikTok, Snapchat) & Seed database on mount
  useEffect(() => {
    initAllMarketingPixels();
    seedProductsIfEmpty();
    seedInitialBlogsIfEmpty();

    // Subscribe to published products for visitors
    const unsubPublished = subscribeToPublishedProducts((items) => {
      setPublishedProducts(items);
      setLoading(false);
    });

    return () => unsubPublished();
  }, []);

  // Track PageView across Meta, TikTok & Snapchat whenever route changes
  useEffect(() => {
    trackAllPageView(path);
  }, [path]);

  // When admin is logged in, subscribe to all products
  useEffect(() => {
    if (!isAdmin) return;
    const unsubAll = subscribeToAllProducts((items) => {
      setAllProducts(items);
    });
    return () => unsubAll();
  }, [isAdmin]);

  // Determine current page based on pathname
  const renderContent = () => {
    const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

    // 1. Admin Routes
    if (cleanPath === '/admin/login') {
      return <AdminLoginPage />;
    }
    if (cleanPath === '/admin') {
      return <AdminDashboardPage products={allProducts.length ? allProducts : publishedProducts} />;
    }
    if (cleanPath === '/admin/products') {
      return <AdminProductsPage products={allProducts.length ? allProducts : publishedProducts} />;
    }
    if (cleanPath === '/admin/products/add') {
      return <AdminAddProductPage />;
    }
    if (cleanPath.startsWith('/admin/products/edit/')) {
      const editId = path.split('/admin/products/edit/')[1]?.replace(/\/$/, '');
      return <AdminEditProductPage productId={editId} />;
    }
    if (cleanPath === '/admin/blogs') {
      return <AdminBlogsPage />;
    }
    if (cleanPath === '/admin/blogs/add') {
      return <AdminAddBlogPage />;
    }
    if (cleanPath.startsWith('/admin/blogs/edit/')) {
      const editBlogId = path.split('/admin/blogs/edit/')[1]?.replace(/\/$/, '');
      return <AdminEditBlogPage blogId={editBlogId} />;
    }
    if (cleanPath === '/admin/categories') {
      return <AdminCategoriesPage products={allProducts.length ? allProducts : publishedProducts} />;
    }
    if (cleanPath === '/admin/reviews') {
      return <AdminReviewsPage products={allProducts.length ? allProducts : publishedProducts} />;
    }
    if (cleanPath === '/admin/website-reviews') {
      return <AdminWebsiteReviewsPage />;
    }
    if (cleanPath === '/admin/subscribers') {
      return <AdminSubscribersPage />;
    }
    if (cleanPath === '/admin/settings') {
      return <AdminSettingsPage />;
    }

    // 2. Public Auth & User Routes
    if (cleanPath === '/login') {
      return <LoginPage />;
    }
    if (cleanPath === '/signup') {
      return <SignupPage />;
    }
    if (cleanPath === '/profile') {
      return <ProfilePage />;
    }
    if (cleanPath === '/favorites') {
      return <FavoritesPage products={publishedProducts} />;
    }

    // 3. Search Route
    if (cleanPath === '/search') {
      return <SearchPage products={publishedProducts} />;
    }

    // 4. Product Details Route: /product/:slug or /product/:id
    if (cleanPath.startsWith('/product/')) {
      const slugOrId = path.replace('/product/', '').replace(/\/$/, '');
      return <ProductDetailPage identifier={slugOrId} allProducts={publishedProducts} />;
    }

    // 5. Category Routes (/cats, /dogs, /t-shirts, /hoodies, /books)
    const categoryMatch = getCategoryBySlug(cleanPath);
    if (categoryMatch) {
      return <CategoryPage category={categoryMatch} products={publishedProducts} />;
    }

    // 5.5. Public Blog Routes
    if (cleanPath === '/blog' || cleanPath === '/blogs') {
      return <BlogListPage />;
    }
    if (cleanPath.startsWith('/blog/')) {
      const blogSlugOrId = path.replace('/blog/', '').replace(/\/$/, '');
      return <BlogDetailPage identifier={blogSlugOrId} />;
    }

    // 6. Homepage
    if (cleanPath === '/') {
      return <HomePage products={publishedProducts} loading={loading} />;
    }

    // 7. Informational & Legal
    if (cleanPath === '/about') return <AboutPage />;
    if (cleanPath === '/contact') return <ContactPage />;
    if (cleanPath === '/privacy') return <PrivacyPage />;
    if (cleanPath === '/terms') return <TermsPage />;
    if (cleanPath === '/disclosure' || cleanPath === '/affiliate-disclosure') return <AffiliateDisclosurePage />;

    // 8. 404 Fallback
    return <NotFoundPage />;
  };

  const isAdminSection = path.startsWith('/admin') && path !== '/admin/login';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminSection && <Header />}
      <div className="flex-1">{renderContent()}</div>
      {!isAdminSection && <Footer />}
      <AuthModal />
      <IOSQuickAccessPrompt />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <RouterProvider>
            <MainApp />
          </RouterProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
