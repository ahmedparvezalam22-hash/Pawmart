import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Video,
  Film,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  AlertCircle,
  Link2,
  Play,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { uploadProductMedia, isVideoUrl } from '../../firebase/products';

interface MediaGalleryUploaderProps {
  mediaUrls: string[];
  primaryUrl: string;
  onChange: (mediaUrls: string[], primaryUrl: string) => void;
  maxItems?: number;
}

export const MediaGalleryUploader: React.FC<MediaGalleryUploaderProps> = ({
  mediaUrls,
  primaryUrl,
  onChange,
  maxItems = 6,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeMediaList = mediaUrls.filter(Boolean);

  const processSelectedFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setError(null);

    const availableSlots = maxItems - safeMediaList.length;
    if (availableSlots <= 0) {
      setError(`Maximum of ${maxItems} media items reached. Please delete an item first.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      setError(`Only ${availableSlots} slots were available. First ${availableSlots} file(s) are being uploaded.`);
    }

    // Validate types & sizes (support mobile gallery formats where MIME type may be empty or HEIC/AVIF)
    for (const f of filesToUpload) {
      const isImg =
        f.type.startsWith('image/') ||
        /\.(jpg|jpeg|png|webp|gif|heic|heif|avif|bmp|svg)$/i.test(f.name) ||
        !f.type;
      const isVid =
        f.type.startsWith('video/') ||
        /\.(mp4|webm|mov|ogg|mkv|m4v)$/i.test(f.name);
      if (!isImg && !isVid) {
        setError(`File "${f.name}" is not a supported image or video format.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      // 50MB max limit
      if (f.size > 50 * 1024 * 1024) {
        setError(`File "${f.name}" exceeds the 50MB size limit.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    try {
      setUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(`Uploading ${i + 1} of ${filesToUpload.length}: ${file.name}...`);
        const uploadedUrl = await uploadProductMedia(file);
        newUrls.push(uploadedUrl);
      }

      const updated = [...safeMediaList, ...newUrls];
      const newPrimary = primaryUrl || updated[0];
      onChange(updated, newPrimary);
      setUploadProgress('');
    } catch (err: any) {
      console.error('Media upload failed:', err);
      setError(err.message || 'Failed to upload media. Please try again or provide a direct URL.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processSelectedFiles(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeMediaList.length >= maxItems || uploading) return;
    const files = Array.from(e.dataTransfer.files || []);
    await processSelectedFiles(files);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (safeMediaList.length >= maxItems) {
      setError(`Maximum limit of ${maxItems} media items reached.`);
      return;
    }

    try {
      new URL(trimmed);
      const updated = [...safeMediaList, trimmed];
      const newPrimary = primaryUrl || updated[0];
      onChange(updated, newPrimary);
      setUrlInput('');
      setError(null);
    } catch {
      setError('Please enter a valid URL.');
    }
  };

  const handleRemoveItem = (index: number) => {
    const targetUrl = safeMediaList[index];
    const updated = safeMediaList.filter((_, i) => i !== index);
    let newPrimary = primaryUrl;
    if (primaryUrl === targetUrl) {
      newPrimary = updated[0] || '';
    }
    onChange(updated, newPrimary);
    if (previewMedia === targetUrl) {
      setPreviewMedia(null);
    }
  };

  const handleSetPrimary = (url: string) => {
    // Ensure the selected primary item moves to slot 1 (index 0)
    const filtered = safeMediaList.filter((u) => u !== url);
    const reordered = [url, ...filtered];
    onChange(reordered, url);
  };

  return (
    <div className="space-y-4">
      {/* Header Info & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Product Photos & Videos (1 to 6 Media Items)</span>
          </span>
          <p className="text-[11px] text-slate-600 mt-0.5">
            <strong>Slot 1 (Main Cover):</strong> Appears large on the main product view and discovery cards.<br />
            <strong>Slots 2 to 6 (Gallery Thumbnails):</strong> Displayed below as clickable thumbnails; visitors click to automatically enlarge.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              safeMediaList.length >= 5
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {safeMediaList.length} of {maxItems} media items added
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            mode === 'upload'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Photos & Videos</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            mode === 'url'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Add Media via URL</span>
        </button>
      </div>

      {/* Upload Zone */}
      {mode === 'upload' ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleDrop}
          className={`block relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 ${
            safeMediaList.length >= maxItems
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
              : 'border-amber-300 hover:border-amber-500 bg-amber-50/20 hover:bg-amber-50/40 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFilesSelected}
            disabled={safeMediaList.length >= maxItems || uploading}
            className="sr-only"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">{uploadProgress || 'Processing upload...'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Optimizing & saving media...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                  <Film className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {safeMediaList.length >= maxItems
                    ? `Maximum ${maxItems} photos/videos added`
                    : `Click to choose from Gallery (${maxItems - safeMediaList.length} slots left)`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports all Gallery photos & videos • JPG, PNG, WEBP, HEIC or MP4, MOV
                </p>
              </div>
            </div>
          )}
        </label>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste direct image or video URL (e.g. https://.../demo.mp4 or Unsplash image)..."
              disabled={safeMediaList.length >= maxItems}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={safeMediaList.length >= maxItems || !urlInput.trim()}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Gallery</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Enter high-resolution image URLs or direct MP4/video URLs from YouTube or cloud hosting.
          </p>
        </div>
      )}

      {/* Media Thumbnails Grid (Up to 6 Items) */}
      {safeMediaList.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Uploaded Media ({safeMediaList.length}/{maxItems})</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Click ⭐ to set the primary catalog cover
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {safeMediaList.map((url, idx) => {
              const isVid = isVideoUrl(url);
              const isPrimary = (primaryUrl && primaryUrl === url) || (!primaryUrl && idx === 0);

              return (
                <div
                  key={idx}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-slate-900 transition-all shadow-xs ${
                    isPrimary ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {/* Media Content */}
                  {isVid ? (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white cursor-pointer relative"
                      onClick={() => setPreviewMedia(url)}
                    >
                      {url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.webm') ? (
                        <video src={url} className="w-full h-full object-cover opacity-60" />
                      ) : null}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-black/40">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md mb-1 group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          Video #{idx + 1}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setPreviewMedia(url)}
                    />
                  )}

                  {/* Primary Badge or Number Badge */}
                  {idx === 0 || isPrimary ? (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>#1 Cover</span>
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(url);
                        }}
                        title="Set as Slot #1 Main Cover"
                        className="px-1.5 py-0.5 rounded-md bg-slate-900/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm flex items-center gap-0.5"
                      >
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Make #1</span>
                      </button>
                    </div>
                  )}

                  {/* Media Type Icon Badge */}
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="p-1 rounded-md bg-black/70 text-white text-[9px] font-semibold flex items-center gap-0.5">
                      {isVid ? <Film className="w-2.5 h-2.5 text-amber-400" /> : <ImageIcon className="w-2.5 h-2.5 text-slate-300" />}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    title="Remove item"
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/90 hover:bg-red-600 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Empty Slot Placeholder if < maxItems */}
            {safeMediaList.length < maxItems && (
              <div
                onClick={() => {
                  if (mode === 'upload') {
                    fileInputRef.current?.click();
                  }
                }}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500">
                  Slot #{safeMediaList.length + 1}
                </span>
                <span className="text-[9px] text-slate-400">Photo / Video</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Preview for Clicked Media */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-4 sm:p-6 flex items-center justify-center max-h-[70vh]">
              {isVideoUrl(previewMedia) ? (
                previewMedia.includes('youtube.com') || previewMedia.includes('youtu.be') ? (
                  <iframe
                    src={previewMedia.replace('watch?v=', 'embed/')}
                    title="Video preview"
                    className="w-full aspect-video rounded-xl"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewMedia}
                    controls
                    autoPlay
                    className="max-h-[60vh] max-w-full rounded-xl"
                  />
                )
              ) : (
                <img
                  src={previewMedia}
                  alt="Full preview"
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                />
              )}
            </div>

            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-300 truncate max-w-md">
                {previewMedia}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleSetPrimary(previewMedia);
                  setPreviewMedia(null);
                }}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Make Primary Cover</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
