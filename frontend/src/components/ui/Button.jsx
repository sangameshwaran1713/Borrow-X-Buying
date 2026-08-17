import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

  const variants = {
    primary: 'bg-[#001F4D] hover:bg-[#001533] text-white shadow-md shadow-navy-500/20 hover:shadow-lg focus:ring-navy-500 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
    secondary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/20 hover:shadow-lg focus:ring-teal-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
    outline: 'border-2 border-[#001F4D] text-[#001F4D] hover:bg-[#001F4D] hover:text-white dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-400 dark:hover:text-slate-900 focus:ring-navy-500',
    ghost: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 focus:ring-red-500 hover:-translate-y-0.5 active:scale-95',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-xs sm:text-sm gap-2',
    lg: 'h-12 px-6 text-sm sm:text-base gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
