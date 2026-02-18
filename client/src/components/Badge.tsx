import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'secondary' | 'destructive' | 'success';
  size?: 'sm' | 'md';
}

/**
 * Badge Component
 * 
 * Design: Minimalist Luxury
 * - Status and category indicators
 * - Multiple color variants
 * - Consistent styling across app
 */
export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantMap = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive/10 text-destructive',
    success: 'bg-accent/10 text-accent',
  };

  const sizeMap = {
    sm: 'px-2 py-1 text-xs rounded-full',
    md: 'px-3 py-1.5 text-sm rounded-full',
  };

  return (
    <span className={`font-medium ${variantMap[variant]} ${sizeMap[size]} inline-block`}>
      {children}
    </span>
  );
}
