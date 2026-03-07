import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import SafetyMenu from './SafetyMenu';
import SafetyEdgeTab from './SafetyEdgeTab';
import NotificationModal from './NotificationModal';
import { useNotifications } from '@/hooks/useNotifications';
import { useSafetyUI } from '@/contexts/SafetyContext';

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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [location, setLocationPath] = useLocation();
  const { uiStyle } = useSafetyUI();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  // Mobile swipe navigation between pages
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  
  // Navigation order: Home → Discover → Carpool → Map → Chat → Profile → Home
  const navOrder = ['/', '/discovery', '/carpooling', '/map', '/chat', '/profile'];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const currentIndex = navOrder.findIndex(path => {
        if (path === '/') return location === '/';
        return location.startsWith(path);
      });

      if (currentIndex !== -1) {
        if (diffX > 0) {
          // Swipe left = next page in order
          const nextIndex = (currentIndex + 1) % navOrder.length;
          setLocationPath(navOrder[nextIndex]);
        } else {
          // Swipe right = previous page in order
          const prevIndex = (currentIndex - 1 + navOrder.length) % navOrder.length;
          setLocationPath(navOrder[prevIndex]);
        }
      }
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      setLocationPath(notification.actionUrl);
      setNotificationOpen(false);
    }
  };

  // Only show safety menu on screens where user might need it
  // Hide on profile editing, settings, admin pages, etc.
  const shouldShowSafetyMenu = () => {
    const hiddenPaths = ['/settings', '/profile', '/admin', '/login', '/register'];
    return !hiddenPaths.some(path => location.startsWith(path));
  };

  // Only show mobile top navigation on home page
  const isHomePage = location === '/';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Top Navigation - Only on Home Page */}
      {isHomePage && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40">
          <div className="h-14 bg-background/95 backdrop-blur border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                P
              </div>
              <span className="text-sm font-semibold tracking-tight">PartyUp</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative h-9 w-9 rounded-lg hover:bg-secondary transition-smooth flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAll}
        onNotificationClick={handleNotificationClick}
      />

      {/* Mobile Navigation (visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileNavigation />
      </div>

      {/* Desktop Sidebar (visible only on desktop) */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-40 hover:w-64 w-20 transition-all duration-300 ease-out group">
        <DesktopSidebar
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
          onNotificationClick={handleNotificationClick}
        />
      </div>

      {/* Main Content Area */}
      <main 
        className={`${isHomePage ? 'pt-14' : 'pt-0'} md:pt-0 md:ml-20 group-hover:md:ml-64 pb-20 md:pb-0 min-h-screen transition-all duration-300 ease-out`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </main>

      {/* Safety Buttons - Render based on user preference */}
      {shouldShowSafetyMenu() && (
        <>
          {uiStyle === 'floating' ? (
            <div className="fixed bottom-28 md:bottom-8 right-4 md:right-8 z-50">
              <SafetyMenu />
            </div>
          ) : (
            <SafetyEdgeTab />
          )}
        </>
      )}
    </div>
  );
}
