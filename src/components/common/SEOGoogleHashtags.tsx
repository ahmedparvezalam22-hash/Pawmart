import React from 'react';
import { useRouter } from '../../utils/navigation';

interface SEOGoogleHashtagsProps {
  tags: string[];
  rawHashtagsString?: string;
  category?: string;
  className?: string;
}

export const SEOGoogleHashtags: React.FC<SEOGoogleHashtagsProps> = ({
  tags,
  className = '',
}) => {
  const { navigate } = useRouter();

  if (!tags || tags.length === 0) return null;

  const handleTagClick = (tag: string) => {
    const query = tag.replace(/^#/, '');
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 py-3 ${className}`}>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => handleTagClick(tag)}
          className="group inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-amber-500 text-slate-200 hover:text-slate-950 border border-slate-800 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
          title={`Explore #${tag.replace(/^#/, '')}`}
        >
          <span className="text-amber-400 group-hover:text-slate-950 font-black">#</span>
          <span>{tag.replace(/^#/, '')}</span>
        </button>
      ))}
    </div>
  );
};
