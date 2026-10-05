import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by title, category, or description...',
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-all"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
