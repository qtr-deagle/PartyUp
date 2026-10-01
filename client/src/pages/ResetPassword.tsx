import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Check, Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PASSWORD_RULES, validateNewPassword } from '@/lib/password';

type LinkState = 'checking' | 'ready' | 'invalid';

/**
 * Landing page for the emailed password-reset link.
 *
 * The Supabase client is created with detectSessionInUrl: false, so the
 * one-time recovery tokens are read from the URL here. They arrive in the
 * hash (#access_token=...&type=recovery) or, for PKCE links, as ?code=.
 * After the new password is saved, every session is signed out and the
 * user signs in again with it.
 */
export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [linkState, setLinkState] = useState<LinkState>('checking');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const handledLink = useRef(false);

  useEffect(() => {
    // The tokens are single-use and removed from the URL below, so a second
    // effect run (React StrictMode) must not re-read the now-empty URL.
    if (handledLink.current) return;
    handledLink.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    // Strip the one-time tokens from the address bar and browser history.
    window.history.replaceState(null, '', '/reset-password');

    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    const code = query.get('code');

    if (hash.get('error') || query.get('error')) {
      setLinkState('invalid');
      return;
    }

    const establish = accessToken && refreshToken
      ? supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      : code
        ? supabase.auth.exchangeCodeForSession(code)
        : null;

    if (!establish) {
      setLinkState('invalid');
      return;
    }

    establish.then(({ error: sessionError }) => {
      setLinkState(sessionError ? 'invalid' : 'ready');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateNewPassword(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setIsSaving(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut({ scope: 'global' });
    setLocation('/login?reset=success');
  };

  const inputType = showPasswords ? 'text' : 'password';
  const inputClass =
    'w-full px-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth';

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elevation-3 border border-border p-8 space-y-6">
        {linkState === 'checking' && (
          <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Checking your reset link...
          </div>
        )}

        {linkState === 'invalid' && (
          <div className="text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Link expired or invalid</h1>
            <p className="text-sm text-muted-foreground">
              Password reset links work once and expire after a short time. Request a new one to continue.
            </p>
            <a
              href="/forgot-password"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
            >
              Request a new link
            </a>
          </div>
        )}

        {linkState === 'ready' && (
          <>
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <KeyRound className="w-6 h-6" /> Choose a new password
              </h1>
              <p className="text-sm text-muted-foreground">
                You'll be signed out everywhere and can sign in with the new password.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New password</label>
                <input
                  type={inputType}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  required
                />
                <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-xs ${passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                      >
                        <Check className={`w-3.5 h-3.5 ${passed ? 'opacity-100' : 'opacity-30'}`} />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm new password</label>
                <input
                  type={inputType}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPasswords ? 'Hide passwords' : 'Show passwords'}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
