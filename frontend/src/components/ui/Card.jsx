import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = true,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-elevation-1 transition-all duration-300 ${
        hoverEffect ? 'hover:-translate-y-1 hover:shadow-elevation-4 hover:border-slate-200 dark:hover:border-slate-700' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
