import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ProductDetails } from '../components/products/ProductDetails';
import { getProductByIdOrSlug } from '../firebase/products';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from '../utils/navigation';
import { useSEO } from '../hooks/useSEO';
import { buildProductSchema } from '../services/seoService';
import { getProductSEOHashtags } from '../services/seoHashtags';

interface ProductDetailPageProps {
  identifier: string; // id or slug
  allProducts: Product[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  identifier,
  allProducts,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const seoHashtags = product ? getProductSEOHashtags(product) : null;

  useSEO({
    title: product ? `${product.title}` : 'Product Details',
    description: product
      ? product.shortDescription || product.description.slice(0, 150)
      : 'Explore curated trending product details on PawMartFinder with verified Amazon partner links.',
    canonicalPath: product ? `/product/${product.slug || product.id}` : `/product/${identifier}`,
    ogImage: product?.imageUrl,
    ogType: 'product',
    keywords: seoHashtags ? seoHashtags.searchTerms : undefined,
    jsonLd: product ? buildProductSchema(product) : undefined,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentProduct = async () => {
      setLoading(true);
      // First check in-memory list
      const matched = allProducts.find(
        (p) => p.slug === identifier || p.id === identifier
      );

      if (matched) {
        if (isMounted) {
          setProduct(matched);
          setLoading(false);
        }
        return;
      }

      // Fallback query Firestore
      const fetched = await getProductByIdOrSlug(identifier);
      if (isMounted) {
        setProduct(fetched);
        setLoading(false);
      }
    };

    fetchCurrentProduct();

    return () => {
      isMounted = false;
    };
  }, [identifier, allProducts]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-12 bg-slate-200 rounded-2xl w-1/2 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 text-sm max-w-md mb-6">
          The product you are looking for may have been removed, unpublished, or the link has expired.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  const related = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id && p.published
  );

  return <ProductDetails product={product} relatedProducts={related} />;
};
