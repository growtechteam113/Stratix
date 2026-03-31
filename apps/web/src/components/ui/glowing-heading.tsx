'use client';

import { ReactNode } from 'react';

interface GlowingHeadingProps {
  children: ReactNode;
  className?: string;
  level?: 'h1' | 'h2' | 'h3';
}

export function GlowingHeading({
  children,
  className = '',
  level = 'h1',
}: GlowingHeadingProps) {
  const baseClasses =
    'font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent';

  const sizeClasses = {
    h1: 'text-5xl md:text-6xl',
    h2: 'text-4xl md:text-5xl',
    h3: 'text-3xl md:text-4xl',
  };

  const Component = level;

  return (
    <Component className={`${baseClasses} ${sizeClasses[level]} ${className}`}>
      {children}
    </Component>
  );
}
