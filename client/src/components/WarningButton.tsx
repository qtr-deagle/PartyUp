import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Warning Button Component
 * 
 * Design: Safety Alert System for Non-Emergency Situations
 * 
 * Use Cases:
 * - User feels uncomfortable or threatened
 * - Someone is following them
 * - Unsafe environment or suspicious activity
 * - Walking alone at night
 * 
 * Features:
 * 1. Send low-level alert to trusted contacts
 * 2. Share live location silently
 * 3. Start background monitoring
 * 4. 60-second countdown escalation to full SOS if not canceled
 */

interface WarningButtonProps {
  className?: string;
}

export default function WarningButton({ className = '' }: WarningButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isEscalating, setIsEscalating] = useState(false);

  // Countdown timer for auto-escalation
  useEffect(() => {
    if (!isActive || !isEscalating) return;

    if (countdown <= 0) {
      // Auto-escalate to SOS
      handleEscalateToSOS();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isEscalating, countdown]);

  const handleWarningClick = () => {
    if (isActive) {
      // Deactivate warning mode
      handleDeactivate();
    } else {
      // Show confirmation dialog
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmWarning = async () => {
    setShowConfirmDialog(false);
    setIsActive(true);
    setIsEscalating(true);
    setCountdown(60);

    // Simulate sending warning alert
    await new Promise(resolve => setTimeout(resolve, 500));

    toast.warning('Warning Mode Activated', {
      description: 'Your location is being shared with trusted contacts. Auto-escalation in 60s.',
      duration: 5000,
    });

    // In a real app, this would:
    // 1. Send alert to trusted contacts
    // 2. Enable GPS tracking
    // 3. Share live location silently
    // 4. Start background monitoring (audio recording, etc.)
  };

  const handleDeactivate = () => {
    setIsActive(false);
    setIsEscalating(false);
    setCountdown(60);
    toast.success('Warning Mode Deactivated', {
      description: 'You are safe. Monitoring stopped.',
    });
  };

  const handleEscalateToSOS = () => {
    setIsActive(false);
    setIsEscalating(false);
    toast.error('Auto-Escalated to Emergency SOS!', {
      description: 'Full emergency alert activated. Authorities and emergency contacts notified.',
      duration: 10000,
    });

    // In a real app, this would trigger the full SOS system
    // Simulate SOS activation
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <button
        onClick={handleWarningClick}
        className={`relative w-16 h-16 rounded-full font-bold text-white transition-all duration-200 flex items-center justify-center shadow-elevation-3 hover:shadow-elevation-3 active:scale-95 ${
          isActive
            ? 'bg-orange-500 animate-pulse'
            : 'bg-yellow-500 hover:bg-yellow-600'
        } ${className}`}
        title="Warning - Click if you feel unsafe"
      >
        <div className="flex flex-col items-center justify-center">
          <Shield className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold">Alert</span>
        </div>

        {/* Pulse ring animation when active */}
        {isActive && (
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-75"></div>
        )}

        {/* Countdown indicator */}
        {isActive && isEscalating && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
            {countdown}
          </div>
        )}
      </button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <Shield className="w-5 h-5" />
              Activate Warning Mode?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p className="text-sm text-foreground">
                Warning Mode will:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Share Your Location</p>
                    <p className="text-xs text-muted-foreground">Live location sent to trusted contacts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Shield className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Start Safety Monitoring</p>
                    <p className="text-xs text-muted-foreground">Background tracking and monitoring enabled</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Auto-Escalation Timer</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically triggers full SOS in 60 seconds if not canceled
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-xs text-orange-800 dark:text-orange-300">
                  <strong>Note:</strong> You can cancel at any time by clicking the Alert button again.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmWarning}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Activate Warning Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active Warning Status Modal */}
      {isActive && (
        <div className="fixed bottom-24 md:bottom-6 right-6 bg-card border-2 border-orange-500 rounded-xl shadow-xl p-4 max-w-xs z-50 animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-orange-600">Warning Mode Active</h3>
                <button
                  onClick={handleDeactivate}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                Your location is being monitored and shared with trusted contacts.
              </p>

              {isEscalating && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-3">
                  <p className="text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Auto-escalation: {formatCountdown(countdown)}
                  </p>
                </div>
              )}

              <button
                onClick={handleDeactivate}
                className="w-full py-2 px-3 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold transition-colors"
              >
                I'm Safe - Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
