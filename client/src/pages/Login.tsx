import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Info,
  ShieldCheck,
  Siren,
  IdCard,
  BarChart3,
  Smartphone,
} from 'lucide-react';

const SHOW_DEMO_LOGIN = import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true';
const DEMO_STAFF_EMAIL = import.meta.env.VITE_DEMO_STAFF_EMAIL;
const DEMO_STAFF_PASSWORD = import.meta.env.VITE_DEMO_STAFF_PASSWORD;
const DEMO_ADMIN_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL;
const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD;

const CONSOLE_FEATURES = [
  { icon: Siren, label: 'Respond to live SOS alerts' },
  { icon: IdCard, label: 'Review ID verifications' },
  { icon: ShieldCheck, label: 'Moderate reports and disputes' },
  { icon: BarChart3, label: 'Monitor trips, payments and analytics' },
];

/**
 * PartyUp Staff & Admin Console sign-in
 *
 * This website is staff/admin tooling only -- travelers sign in through the
 * PartyUp mobile app. Accounts without a staff or admin role are signed back
 * out immediately instead of being routed anywhere.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser?.role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (loggedInUser?.role === 'staff') {
        setLocation('/staff/dashboard');
      } else {
        await logout();
        setError(
          'This console is for PartyUp staff and admins only. Travelers can sign in through the PartyUp mobile app.'
        );
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-sidebar border-r border-sidebar-border p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <p className="text-lg font-bold text-primary leading-tight">PartyUp</p>
            <p className="text-xs text-muted-foreground">Staff &amp; Admin Console</p>
          </div>
        </div>

        <div className="space-y-8 max-w-md">
          <div>
            <h2 className="text-3xl font-bold mb-3">Keep every trip safe and running.</h2>
            <p className="text-muted-foreground">
              The operations console for the PartyUp team — moderation, safety response and
              platform oversight in one place.
            </p>
          </div>
          <ul className="space-y-4">
            {CONSOLE_FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Authorized personnel only. Activity in this console is logged and audited.
        </p>
      </aside>

      {/* Sign-in panel */}
      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Compact brand header for small screens */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
              P
            </div>
            <div>
              <p className="text-lg font-bold text-primary leading-tight">PartyUp</p>
              <p className="text-xs text-muted-foreground">Staff &amp; Admin Console</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> Restricted access
            </span>
            <h1 className="text-3xl font-bold mb-2">Console sign in</h1>
            <p className="text-muted-foreground">
              Use the staff or admin account issued to you by PartyUp.
            </p>
          </div>

          {/* Demo Access Hint */}
          {SHOW_DEMO_LOGIN && (DEMO_STAFF_EMAIL || DEMO_ADMIN_EMAIL) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 space-y-1">
              <p className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4" /> Demo access — for review only
              </p>
              {DEMO_STAFF_EMAIL && (
                <p>Staff: {DEMO_STAFF_EMAIL} / {DEMO_STAFF_PASSWORD}</p>
              )}
              {DEMO_ADMIN_EMAIL && (
                <p>Admin: {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}</p>
              )}
            </div>
          )}

          <div className="bg-card rounded-2xl shadow-elevation-3 border border-border p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@partyup.team"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {isLoading ? 'Verifying access...' : 'Sign in to console'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Need access or locked out? Contact your PartyUp administrator.
            </p>
          </div>

          {/* Traveler redirect */}
          <a
            href="/landing"
            className="mt-6 flex items-center gap-3 p-4 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth"
          >
            <Smartphone className="w-5 h-5 shrink-0" />
            <span>
              Looking for PartyUp as a traveler?{' '}
              <span className="text-primary font-medium">Get the mobile app</span>
            </span>
          </a>
        </div>
      </main>
    </div>
  );
}
