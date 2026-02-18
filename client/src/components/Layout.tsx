import React from 'react';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import SOSButton from './SOSButton';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * PartyUp Responsive Layout
 * 
 * Design Philosophy: Minimalist Luxury
 * - Mobile: Bottom navigation bar with 5 tabs + floating SOS button
 * - Desktop: Left sidebar navigation + top header + main content area
 * - Responsive breakpoint: 768px (md)
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Navigation (visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileNavigation />
      </div>

      {/* Desktop Sidebar (visible only on desktop) */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-40 hover:w-64 w-20 transition-all duration-300 ease-out group">
        <DesktopSidebar />
      </div>

      {/* Main Content Area */}
      <main className="md:ml-20 group-hover:md:ml-64 pb-20 md:pb-0 min-h-screen transition-all duration-300 ease-out">
        {children}
      </main>

      {/* Floating SOS Button - visible on all screens */}
      <div className="fixed bottom-28 md:bottom-8 right-4 md:right-8 z-50">
        <SOSButton />
      </div>
    </div>
  );
}
