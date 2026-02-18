import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty State Component
 * 
 * Design: Minimalist Luxury
 * - Used when no data is available
 * - Clean, centered layout
 * - Optional call-to-action button
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
