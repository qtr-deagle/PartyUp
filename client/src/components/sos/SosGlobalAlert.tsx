import { useEffect, useRef, useState } from 'react';
import { Siren, X } from 'lucide-react';
import { useLocation } from 'wouter';
import type { SosAlertDetail } from '@/lib/sos';

// Browsers only allow audio after the page has had a user gesture, so the
// context is created (or resumed) on the first click anywhere.
let audioContext: AudioContext | null = null;
function unlockAudio() {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume();
  } catch {
    // No Web Audio: the banner and browser notification still show.
  }
}

// A few seconds of rising/falling siren tone, generated so no asset is needed.
function playSiren() {
  if (!audioContext || audioContext.state !== 'running') return;
  const ctx = audioContext;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sawtooth';
  const start = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    oscillator.frequency.setValueAtTime(650, start + i * 0.8);
    oscillator.frequency.linearRampToValueAtTime(1100, start + i * 0.8 + 0.4);
    oscillator.frequency.linearRampToValueAtTime(650, start + i * 0.8 + 0.8);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.05);
  gain.gain.setValueAtTime(0.18, start + 3.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.2);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + 3.2);
}

interface SosGlobalAlertProps {
  alerts: SosAlertDetail[];
  isLoading: boolean;
  basePath: '/staff' | '/admin';
}

// Rendered by StaffLayout/AdminLayout so a new SOS reaches staff on every
// page: a sticky banner, a siren, and a browser notification. The banner stays
// until the alert is resolved or dismissed here.
export default function SosGlobalAlert({ alerts, isLoading, basePath }: SosGlobalAlertProps) {
  const [location, navigate] = useLocation();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio);
    if ('Notification' in window && Notification.permission === 'default') {
      const ask = () => void Notification.requestPermission();
      window.addEventListener('pointerdown', ask, { once: true });
      return () => {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('pointerdown', ask);
      };
    }
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  // Alerts already active when the page loaded are shown but don't ring; each
  // one that arrives afterwards rings once.
  useEffect(() => {
    if (isLoading) return;
    if (knownIds.current === null) {
      knownIds.current = new Set(alerts.map((alert) => alert.id));
      return;
    }
    const fresh = alerts.filter((alert) => !knownIds.current!.has(alert.id));
    if (fresh.length === 0) return;
    fresh.forEach((alert) => knownIds.current!.add(alert.id));
    playSiren();
    if ('Notification' in window && Notification.permission === 'granted') {
      for (const alert of fresh) {
        const notification = new Notification(`🚨 SOS: ${alert.profile?.display_name ?? 'A traveler'} needs help`, {
          body: 'Open the SOS Center to see their live location.',
          tag: `sos-${alert.id}`,
          requireInteraction: true,
        });
        notification.onclick = () => {
          window.focus();
          navigate(`${basePath}/sos?alert=${alert.id}`);
          notification.close();
        };
      }
    }
  }, [alerts, isLoading, basePath, navigate]);

  const onSosPage = location.startsWith(`${basePath}/sos`);
  const visible = alerts.filter((alert) => !dismissed.has(alert.id));
  if (onSosPage || visible.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-destructive text-destructive-foreground px-6 py-3 shadow-elevation-3 flex flex-wrap items-center gap-3">
      <Siren className="w-5 h-5 shrink-0 animate-pulse" />
      <span className="font-semibold">
        {visible.length === 1
          ? `${visible[0].profile?.display_name ?? 'A traveler'} sent an SOS`
          : `${visible.length} active SOS alerts`}
      </span>
      <div className="flex flex-wrap gap-2">
        {visible.slice(0, 4).map((alert) => (
          <button
            key={alert.id}
            onClick={() => navigate(`${basePath}/sos?alert=${alert.id}`)}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-semibold transition-colors"
          >
            {visible.length === 1 ? 'Open live location' : (alert.profile?.display_name ?? 'Unknown')}
          </button>
        ))}
      </div>
      <button
        onClick={() => setDismissed(new Set(Array.from(dismissed).concat(visible.map((alert) => alert.id))))}
        className="ml-auto p-1 rounded hover:bg-white/20 transition-colors"
        title="Hide banner (alerts stay in the SOS Center)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
