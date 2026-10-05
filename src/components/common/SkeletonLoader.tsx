import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse">
      <div className="aspect-square w-full bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-3 bg-slate-200 rounded-md w-full" />
        <div className="h-3 bg-slate-200 rounded-md w-5/6" />
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded-md w-1/3" />
          <div className="h-8 bg-slate-200 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
};

export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-8 bg-slate-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
};
