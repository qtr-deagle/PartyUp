import { useLocation } from 'wouter';

/**
 * Custom hook to determine current page for navigation highlighting
 * Maps routes to page IDs for consistent active state detection
 */
export function useCurrentPage(): string {
  const [location] = useLocation();

  // Map routes to page IDs
  const pageMap: Record<string, string> = {
    '/': 'home',
    '/discovery': 'match',
    '/find-buddy': 'match',
    '/chat': 'chat',
    '/messages': 'chat',
    '/map': 'map',
    '/profile': 'profile',
    '/cars': 'profile', // Vehicle browsing accessed from profile
    '/my-trips': 'my-trips',
    '/trusted-circle': 'trusted',
    '/emergency': 'emergency',
    '/carpooling': 'carpooling',
    '/post-ride': 'post-ride',
  };

  // Return the page ID for the current location, default to 'home'
  return pageMap[location] || 'home';
}
