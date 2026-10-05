import React, { useState } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogForm } from '../components/admin/BlogForm';
import { createBlogPost } from '../firebase/blogs';
import { BlogPost } from '../types';
import { useRouter } from '../utils/navigation';
import { BookOpen } from 'lucide-react';

export const AdminAddBlogPage: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (blogData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newId = await createBlogPost(blogData);
      navigate('/admin/blogs');
    } catch (err: any) {
      alert('Failed to publish blog post: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="Add Blog Post">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>Create New Blog Guide</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add advice, tips, cover photography, and the featured Amazon referral link. Once submitted, it appears immediately on the visitor website.
            </p>
          </div>

          <BlogForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
