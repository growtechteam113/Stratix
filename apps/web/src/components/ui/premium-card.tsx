'use client';

import { ReactNode } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function PremiumCard({
  children,
  className = '',
  hover = true,
}: PremiumCardProps) {
  const baseClasses =
    'bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300';

  const hoverClasses = hover
    ? 'hover:shadow-lg hover:border-gray-300 hover:-translate-y-1'
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}
