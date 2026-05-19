import React, { useState } from 'react';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSafetyUI } from '@/contexts/SafetyContext';
import SOSButton from './SOSButton';
import WarningButton from './WarningButton';

/**
 * SafetyEdgeTab Component
 * 
 * Edge-style UI for safety buttons
 * - Small vertical tab on the right edge of screen
 * - Slides out when clicked to reveal Warning + SOS buttons
 * - More discrete than floating button style
 */

export default function SafetyEdgeTab() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { edgeTabEnabled, sosEnabled } = useSafetyUI();

    if (!edgeTabEnabled || !sosEnabled) return null;

    return (
        <>
            {/* Tab on the edge */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`fixed ${isExpanded ? 'right-24' : 'right-0'
                    } top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out`}
            >
                <div
                    className={`flex items-center gap-2 py-3 px-2 rounded-l-xl shadow-lg transition-all duration-300 ${isExpanded
                            ? 'bg-gray-700 hover:bg-gray-800'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {/* Icon */}
                    <div className="shrink-0">
                        {isExpanded ? (
                            <ChevronRight className="w-5 h-5 text-white" />
                        ) : (
                            <Shield className="w-5 h-5 text-white" />
                        )}
                    </div>

                    {/* Vertical Text */}
                    <div className="flex flex-col items-center">
                        <span
                            className="text-white font-bold text-sm tracking-wider"
                            style={{
                                textOrientation: 'mixed',
                            }}
                        >
                            {isExpanded ? 'CLOSE' : 'SAFETY'}
                        </span>
                    </div>
                </div>
            </button>

            {/* Expanded Panel with Safety Buttons */}
            {isExpanded && (
                <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col gap-3 p-4 bg-card/95 backdrop-blur-sm border-l border-t border-b border-border rounded-l-xl shadow-xl">
                        {/* Warning Button */}
                        <WarningButton />

                        {/* SOS Button */}
                        <SOSButton />
                    </div>
                </div>
            )}

            {/* Backdrop overlay when expanded */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 animate-in fade-in duration-300"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </>
    );
}
