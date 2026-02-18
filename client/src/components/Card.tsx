import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * Card Component
 * 
 * Design: Minimalist Luxury
 * - Consistent card styling
 * - Soft shadows and rounded corners
 * - Optional hover effects
 */
export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card-luxury ${hoverable ? 'hover:shadow-md cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-border pb-4 mb-4 ${className}`}>{children}</div>;
}

/**
 * Card Body Component
 */
export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card Footer Component
 */
export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-t border-border pt-4 mt-4 ${className}`}>{children}</div>;
}
