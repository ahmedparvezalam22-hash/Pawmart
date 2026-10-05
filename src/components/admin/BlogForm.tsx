import React, { useState, useRef } from 'react';
import { BlogPost, BlogCategory } from '../../types';
import { generateBlogSlug } from '../../firebase/blogs';
import { uploadProductImage } from '../../firebase/products';
import { ImageUploader } from './ImageUploader';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';

interface BlogFormProps {
  initialBlog?: Partial<BlogPost>;
  onSubmit: (blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loading?: boolean;
}

const PRESET_IMAGES = [
  { label: 'Cats Comfort', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Puppy Training', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kids Toys', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Skin Care', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Graphic T-Shirts', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cozy Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Pet Books', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80' },
];

export const BlogForm: React.FC<BlogFormProps> = ({
  initialBlog,
  onSubmit,
  loading = false,
}) => {
  const [title, setTitle] = useState(initialBlog?.title || '');
  const [slug, setSlug] = useState(initialBlog?.slug || '');
  const [category, setCategory] = useState<string>(initialBlog?.category || 'Cats');
  const [imageUrl, setImageUrl] = useState(initialBlog?.imageUrl || '');
  const [viewsCount, setViewsCount] = useState<string>(initialBlog?.viewsCount || '1.5k');
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || '');
  const [content, setContent] = useState(
    initialBlog?.content ||
      `Share your detailed advice, tips, or product review here...\n\n### 1. Key Highlight\nExplain the most important benefit or feature for pet owners.\n\n### 2. Practical Tips\nStep-by-step guidance on how to make the best use of this item.\n\n### Recommended Gear\nSee our verified Amazon recommendation linked below.`
  );
  const [amazonProductLink, setAmazonProductLink] = useState(
    initialBlog?.amazonProductLink || ''
  );
  const [amazonButtonText, setAmazonButtonText] = useState(
    initialBlog?.amazonButtonText || 'View Recommended Item on Amazon'
  );
  const [author, setAuthor] = useState(initialBlog?.author || 'Parvez');
  const [readTime, setReadTime] = useState(initialBlog?.readTime || '4 min read');
  const [featured, setFeatured] = useState<boolean>(initialBlog?.featured || false);
  const [published, setPublished] = useState<boolean>(
    initialBlog?.published !== undefined ? initialBlog.published : true
  );
  const [inlineUploading, setInlineUploading] = useState(false);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialBlog) {
      setSlug(generateBlogSlug(val));
    }
  };

  const handleInlineGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInlineUploading(true);
      setError(null);
      const uploadedDataUrl = await uploadProductImage(file);
      if (!imageUrl) {
        setImageUrl(uploadedDataUrl);
      }
      setContent((prev) => `${prev}\n\n![Blog Image](${uploadedDataUrl})\n\n`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image from gallery.');
    } finally {
      setInlineUploading(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setError('Please provide a blog title.');
      return false;
    }
    if (!excerpt.trim()) {
      setError('Please provide a short excerpt/summary for preview cards.');
      return false;
    }
    if (!content.trim()) {
      setError('Please provide the full blog content.');
      return false;
    }
    if (!imageUrl.trim()) {
      setError('Please upload a photo from your Gallery or provide a cover image URL.');
      return false;
    }
    if (!amazonProductLink.trim()) {
      setError('Please provide the Amazon link for the featured product in this blog.');
      return false;
    }
    try {
      const parsed = new URL(amazonProductLink.trim());
      if (!parsed.protocol.startsWith('http')) {
        setError('Amazon link must be a valid HTTP or HTTPS URL.');
        return false;
      }
    } catch {
      setError('Please provide a valid Amazon URL.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      slug: slug.trim() ? generateBlogSlug(slug) : generateBlogSlug(title),
      category,
      imageUrl: imageUrl.trim(),
      viewsCount: viewsCount.trim() || '1.5k',
      excerpt: excerpt.trim(),
      content: content.trim(),
      amazonProductLink: amazonProductLink.trim(),
      amazonButtonText: amazonButtonText.trim() || 'View Recommended Item on Amazon',
      author: author.trim() || 'Parvez',
      readTime: readTime.trim() || '4 min read',
      featured,
      published,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Title & Category & Views Count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            1. Blog Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. 5 Cozy Winter Cat Beds for Happy Paws"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="Cats">Cats (🐱)</option>
            <option value="Dogs">Dogs (🐶)</option>
            <option value="Kids Toys">Kids Toys (🧸)</option>
            <option value="Skin Care">Skin Care (🧴)</option>
            <option value="Furniture">Furniture (🛋️)</option>
            <option value="Shoes">Shoes (👟)</option>
            <option value="Wedding Collection">Wedding Collection (💍)</option>
            <option value="Jewelry Collection">Jewelry Collection (✨)</option>
            <option value="Electronics">Electronics (⚡)</option>
            <option value="Other Products">Other Products (🎁)</option>
            <option value="T-Shirts">T-Shirts (👕)</option>
            <option value="Hoodies">Hoodies (🧥)</option>
            <option value="Books">Books (📚)</option>
            <option value="Guides">Guides (📝)</option>
            <option value="Pet Care">Pet Care (🐾)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Views (e.g. 1.5k)</span>
            </span>
          </label>
          <div className="relative">
            <Eye className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={viewsCount}
              onChange={(e) => setViewsCount(e.target.value)}
              placeholder="e.g. 1.5k, 2.4k"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
            <span>Visitor sees:</span>
            <strong className="inline-flex items-center gap-1 text-amber-700">
              <Eye className="w-3 h-3" /> {viewsCount || '1.5k'} views
            </strong>
          </p>
        </div>
      </div>

      {/* 2. Slug & Author & Read Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            URL Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="winter-cat-beds-guide"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            Author Name
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Parvez"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            Reading Duration
          </label>
          <input
            type="text"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            placeholder="4 min read"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 3. Blog Cover Photo (Upload from Gallery or URL) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
          2. Blog Photo — Upload from Gallery or Image Link <span className="text-red-500">*</span>
        </label>

        <ImageUploader value={imageUrl} onChange={(url) => setImageUrl(url)} />

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Or choose a Quick Preset:</span>
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setImageUrl(preset.url)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Short Summary / Excerpt */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
          3. Short Summary / Excerpt <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={2}
          required
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief 1-2 sentence hook displayed on blog cards and search results..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
      </div>

      {/* 5. Full Article Content + Gallery Image Upload Inside Content */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            4. Full Article Content (Supports Subheadings '###' and Bullets '-') <span className="text-red-500">*</span>
          </label>

          {/* Direct Gallery Photo Upload Button right where Blog is written */}
          <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-xs transition-all self-start sm:self-auto">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{inlineUploading ? 'Uploading from Gallery...' : 'Upload Photo from Gallery'}</span>
            <input
              ref={inlineFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInlineGalleryUpload}
              disabled={inlineUploading}
              className="sr-only"
            />
          </label>
        </div>
        <textarea
          rows={10}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your article here..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white leading-relaxed"
        />
      </div>

      {/* 6. Amazon Product Link & Button Text */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
          <LinkIcon className="w-4 h-4 text-amber-600" />
          <span>Featured Amazon Product Recommendation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Amazon Product URL <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={amazonProductLink}
                onChange={(e) => setAmazonProductLink(e.target.value)}
                placeholder="https://www.amazon.com/dp/... or search URL"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {amazonProductLink && (
                <button
                  type="button"
                  onClick={() => window.open(amazonProductLink, '_blank')}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-amber-600 hover:border-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Test link"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Test Link</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              When visitors read this blog post, a prominent callout button will take them directly to this Amazon listing.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Call-to-Action Button Label
            </label>
            <input
              type="text"
              value={amazonButtonText}
              onChange={(e) => setAmazonButtonText(e.target.value)}
              placeholder="View Recommended Item on Amazon"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 7. Toggles: Featured & Published */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Featured Post</span>
            <span className="text-[11px] text-slate-500">Show as large highlight banner at top of blog page</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Publish Immediately</span>
            <span className="text-[11px] text-slate-500">Visible publicly on the visitor website</span>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-98 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Saving Blog Post...</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              <span>{initialBlog ? 'Save & Update Blog Post' : 'Submit & Publish Blog Post'}</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
