import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'dark' }) => {
  const isLight = variant === 'light';
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Modern Paw Discovery Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm shadow-amber-500/20 text-slate-900 ${iconSizes[size]} transition-transform duration-200 group-hover:scale-105`}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5/8 h-5/8 text-slate-950"
        >
          {/* Main paw pad */}
          <path d="M12 11.5c-2.3 0-4.2 1.6-4.2 3.6 0 1.9 1.8 3.4 4.2 3.4s4.2-1.5 4.2-3.4c0-2-1.9-3.6-4.2-3.6z" />
          {/* 4 toe pads */}
          <ellipse cx="6.8" cy="10.2" rx="1.6" ry="2.2" transform="rotate(-18 6.8 10.2)" />
          <ellipse cx="10.2" cy="7.2" rx="1.6" ry="2.2" transform="rotate(-6 10.2 7.2)" />
          <ellipse cx="13.8" cy="7.2" rx="1.6" ry="2.2" transform="rotate(6 13.8 7.2)" />
          <ellipse cx="17.2" cy="10.2" rx="1.6" ry="2.2" transform="rotate(18 17.2 10.2)" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight leading-none ${textSizes[size]} ${isLight ? 'text-white' : 'text-slate-900'}`}>
          Paw<span className="text-amber-500">Mart</span>
        </span>
        {size === 'lg' && (
          <span className={`text-[10px] uppercase font-semibold tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Product Discovery
          </span>
        )}
      </div>
    </div>
  );
};
