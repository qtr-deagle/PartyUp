import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * SOS Emergency Button Component
 * 
 * Design: Minimalist Luxury with Emergency Emphasis
 * - Floating red button with pulse animation
 * - Visible on all screens (mobile and desktop)
 * - Positioned: bottom-right on desktop, above mobile nav on mobile
 * - Click to activate emergency alert
 * - Sends alert to trusted circle and admin
 * - Shares live location when activated
 */
export default function SOSButton() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSOSClick = async () => {
    if (isActive) {
      // Deactivate SOS
      setIsActive(false);
      toast.success('Emergency alert deactivated');
    } else {
      // Activate SOS
      setIsLoading(true);
      try {
        // Simulate sending emergency alert
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsActive(true);
        toast.error('Emergency alert activated! Location shared with trusted circle and admin.');
        
        // In a real app, this would:
        // 1. Send alert to trusted circle
        // 2. Send alert to admin
        // 3. Share live location
        // 4. Start location tracking
      } catch (error) {
        toast.error('Failed to activate emergency alert');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleSOSClick}
      disabled={isLoading}
      className={`relative w-16 h-16 rounded-full font-bold text-white transition-all duration-200 flex items-center justify-center shadow-elevation-3 hover:shadow-elevation-3 active:scale-95 ${
        isActive
          ? 'bg-destructive animate-pulse'
          : 'bg-destructive hover:bg-red-700'
      }`}
      title="Emergency SOS - Click to activate"
    >
      <div className="flex flex-col items-center justify-center">
        <AlertTriangle className="w-6 h-6 mb-1" />
        <span className="text-xs font-bold">SOS</span>
      </div>

      {/* Pulse ring animation when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-75"></div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
      )}
    </button>
  );
}
