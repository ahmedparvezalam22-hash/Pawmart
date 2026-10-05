import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogForm } from '../components/admin/BlogForm';
import { getBlogById, updateBlogPost } from '../firebase/blogs';
import { BlogPost } from '../types';
import { useRouter } from '../utils/navigation';
import { BookOpen } from 'lucide-react';

interface AdminEditBlogPageProps {
  blogId?: string;
}

export const AdminEditBlogPage: React.FC<AdminEditBlogPageProps> = ({ blogId }) => {
  const { navigate } = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!blogId) {
      navigate('/admin/blogs');
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      const data = await getBlogById(blogId);
      if (data) {
        setBlog(data);
      } else {
        alert('Blog post not found.');
        navigate('/admin/blogs');
      }
      setLoading(false);
    };

    fetchPost();
  }, [blogId, navigate]);

  const handleSubmit = async (blogData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!blogId) return;
    try {
      setSaving(true);
      await updateBlogPost(blogId, blogData);
      navigate('/admin/blogs');
    } catch (err: any) {
      alert('Failed to update blog post: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="Edit Blog Post">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>Edit Blog Guide</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Update article content, images, Amazon referral links, or publish status. Changes reflect immediately on PawMart.
            </p>
          </div>

          {loading ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Loading post data...
            </div>
          ) : blog ? (
            <BlogForm initialBlog={blog} onSubmit={handleSubmit} loading={saving} />
          ) : null}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
