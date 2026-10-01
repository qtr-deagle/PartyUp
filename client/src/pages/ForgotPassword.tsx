import React, { useState } from 'react';
import { ArrowLeft, Loader2, Mail, MailCheck } from 'lucide-react';
import { sendPasswordResetEmail } from '@/lib/password';

/**
 * "Forgot password?" for staff/admin console accounts.
 *
 * Always shows the same confirmation whether or not the email has an
 * account, so this page can't be used to discover which emails are staff.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSending(true);
    const { error: sendError } = await sendPasswordResetEmail(email);
    setIsSending(false);

    if (sendError && sendError.status === 429) {
      setError('Too many reset requests. Please wait a few minutes and try again.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <a href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </a>

        <div className="bg-card rounded-2xl shadow-elevation-3 border border-border p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-3">
              <MailCheck className="w-12 h-12 text-primary mx-auto" />
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span> belongs to a PartyUp console account,
                we sent it a link to set a new password. The link can only be used once.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your work email and we'll send you a link to choose a new password.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSending ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
