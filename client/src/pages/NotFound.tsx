import React from 'react';
import { Link } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * PartyUp 404 Not Found Page
 * 
 * Design: Minimalist Luxury
 * - Clean, centered layout
 * - Navigation back to home
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Display */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Page Not Found</h2>
          <p className="text-lg text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8 p-8 bg-primary/5 rounded-lg">
          <div className="text-6xl">🗺️</div>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Link href="/">
            <a className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-md">
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </a>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-3 border border-border rounded-lg font-medium transition-smooth hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@partyup.com" className="text-primary font-medium hover:underline">
            support@partyup.com
          </a>
        </p>
      </div>
    </div>
  );
}
