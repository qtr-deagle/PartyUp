import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';
import SOSButton from './SOSButton';
import WarningButton from './WarningButton';

/**
 * SafetyMenu Component
 * 
 * Collapsible safety menu that contains both SOS and Warning buttons
 * - Main button: Shield icon (collapsed state)
 * - Expands to show both SOS and Warning buttons
 * - Less intrusive than always showing both buttons
 * - Easy to access when needed
 */

export default function SafetyMenu() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Expanded State - Show both buttons */}
      {isExpanded && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Warning Button */}
          <WarningButton />
          
          {/* SOS Button */}
          <SOSButton />
        </div>
      )}

      {/* Main Safety Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-16 h-16 rounded-full font-bold text-white transition-all duration-200 flex items-center justify-center shadow-elevation-3 hover:shadow-elevation-3 active:scale-95 ${
          isExpanded
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        title={isExpanded ? 'Close Safety Menu' : 'Safety Options'}
      >
        <div className="flex flex-col items-center justify-center">
          {isExpanded ? (
            <>
              <X className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Close</span>
            </>
          ) : (
            <>
              <Shield className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Safety</span>
            </>
          )}
        </div>

        {/* Pulse indicator to draw attention */}
        {!isExpanded && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background"></div>
        )}
      </button>
    </div>
  );
}
