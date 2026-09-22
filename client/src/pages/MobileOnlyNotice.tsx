import React from 'react';
import { Link } from 'wouter';
import { Smartphone } from 'lucide-react';

/**
 * Shown wherever the traveler dashboard would otherwise render on this
 * website. The traveler-facing product is the PartyUp mobile app -- this
 * site is for staff/admin tooling only. See ProtectedRoute in App.tsx.
 */
export default function MobileOnlyNotice() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 p-8 bg-primary/5 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
          <Smartphone className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Get the PartyUp App</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The traveler dashboard lives in the PartyUp mobile app. This website is for PartyUp staff and admins only.
        </p>
        <Link href="/login">
          <a className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-md">
            Staff / Admin Login
          </a>
        </Link>
      </div>
    </div>
  );
}
