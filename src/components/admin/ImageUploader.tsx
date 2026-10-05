import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Link2, X } from 'lucide-react';
import { uploadProductImage } from '../../firebase/products';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const isImg =
      file.type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|heic|heif|avif|bmp|svg)$/i.test(file.name) ||
      !file.type;
    if (!isImg) {
      setError('Please upload a valid image file from your gallery.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setError('Image file size must be less than 30MB.');
      return;
    }

    try {
      setUploading(true);
      const url = await uploadProductImage(file);
      onChange(url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Failed to upload image. Please try again or provide a direct image URL.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      onChange(urlInput.trim());
      setUrlInput('');
      setError(null);
    } catch {
      setError('Please enter a valid URL.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            mode === 'upload' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            mode === 'url' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Image Link</span>
        </button>
      </div>

      {/* Main Upload Box or URL input */}
      {mode === 'upload' ? (
        <label
          className={`block relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            value ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300 hover:border-amber-500 bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-600">Optimizing & uploading image...</p>
            </div>
          ) : value ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Image Uploaded Successfully</span>
                </div>
                <p className="text-[11px] text-slate-400">Click or tap to replace with another image.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to choose photo from Gallery
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports all Gallery photos • PNG, JPG, JPEG, WEBP, HEIC
              </p>
            </div>
          )}
        </label>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste high-res image URL (e.g. Unsplash or CDN)..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Active Preview if URL mode or existing */}
      {value && mode === 'url' && (
        <div className="relative inline-block mt-2">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-xs hover:bg-red-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
