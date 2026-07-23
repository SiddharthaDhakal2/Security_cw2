import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`} {...props}>
      {children}
    </div>
  );
}
