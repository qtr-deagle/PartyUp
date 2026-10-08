import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Eye, EyeOff, ImagePlus, KeyRound, Loader2, Phone, ShieldCheck, Shuffle, Trash2, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PASSWORD_RULES, changeOwnPassword, validateNewPassword } from '@/lib/password';
import { roleLabel } from '@/lib/guilds';
import { removeOwnAvatar, setIllustratedAvatar, uploadOwnAvatar } from '@/lib/avatar';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { Pill } from '@/components/admin/AdminUI';

/**
 * Account Settings (admin console)
 *
 * - Shows the signed-in console account and its profile photo (upload one,
 *   use an illustrated avatar, or remove it). Travelers see this photo next
 *   to admin replies.
 * - Change password: requires the current password, then signs out every
 *   other session so a leaked password stops working everywhere
 */
export default function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Your console sign-in, photo and password</p>
        </div>

        {user && (
          <div className="relative bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            {/* Soft glow that fades out fully, so there's no visible edge. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%)' }}
            />
            <div className="relative p-6">
              <AvatarEditor name={user.name} avatarUrl={user.avatar ?? null} onChanged={refreshUser}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <Pill tone={isAdmin ? 'blue' : 'yellow'}>
                    <ShieldCheck className="w-3 h-3" /> {roleLabel(user.role)}
                  </Pill>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground break-all">
                  <UserCircle className="w-4 h-4 shrink-0" /> {user.email}
                </p>
              </AvatarEditor>
            </div>
          </div>
        )}

        {user && <MobileNumberCard userId={user.id} />}

        <ChangePasswordCard email={user?.email ?? ''} />
      </div>
    </AdminLayout>
  );
}

function AvatarEditor({
  name,
  avatarUrl,
  onChanged,
  children,
}: {
  name: string;
  avatarUrl: string | null;
  onChanged: () => Promise<void>;
  /** Name/email shown next to the photo. */
  children?: React.ReactNode;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'upload' | 'illustrated' | 'remove' | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const run = async (kind: 'upload' | 'illustrated' | 'remove', action: () => Promise<unknown>, success: string) => {
    setBusy(kind);
    try {
      await action();
      await onChanged();
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your photo.');
    } finally {
      setBusy(null);
    }
  };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // let the same file be picked again
    if (file) void run('upload', () => uploadOwnAvatar(file), 'Profile photo updated');
  };

  const baseButton =
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-smooth disabled:opacity-50 disabled:cursor-not-allowed';
  const buttonClass = `${baseButton} border-border text-foreground hover:bg-secondary`;
  // Separate class list (not buttonClass + overrides): two text colors on one
  // element resolve by stylesheet order, and text-foreground won.
  const removeButtonClass = `${baseButton} border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60`;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative w-24 h-24 shrink-0 rounded-full ring-2 ring-border ring-offset-4 ring-offset-card">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover bg-card" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary/15 text-primary flex items-center justify-center text-3xl font-bold bg-card">
            {name.trim().charAt(0).toUpperCase()}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {children && <div className="space-y-0.5">{children}</div>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileInput.current?.click()} disabled={busy !== null} className={buttonClass}>
            <ImagePlus className="w-4 h-4" />
            Upload photo
          </button>
          {/* A fresh seed each click, so it can be rerolled until one fits. */}
          <button
            type="button"
            onClick={() => void run('illustrated', () => setIllustratedAvatar(`${name}-${Date.now()}`), 'Avatar updated')}
            disabled={busy !== null}
            className={buttonClass}
          >
            <Shuffle className="w-4 h-4" />
            {avatarUrl ? 'New illustrated avatar' : 'Use illustrated avatar'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              disabled={busy !== null}
              className={removeButtonClass}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Cropped to a square. Travelers see it next to your replies.</p>
      </div>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
      <ConfirmActionDialog
        open={confirmingRemove}
        onOpenChange={setConfirmingRemove}
        tone="destructive"
        title="Remove your profile photo?"
        description="Your photo is deleted and your initial shows instead, here and wherever travelers see you. You can add a new one anytime."
        confirmLabel="Remove photo"
        onConfirm={() => {
          setConfirmingRemove(false);
          void run('remove', removeOwnAvatar, 'Profile photo removed');
        }}
      />
    </div>
  );
}

function ChangePasswordCard({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateNewPassword(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    const { error: changeError } = await changeOwnPassword(email, currentPassword, newPassword);
    setIsSaving(false);

    if (changeError) {
      setError(changeError.message);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password changed. Other devices have been signed out.');
  };

  const inputType = showPasswords ? 'text' : 'password';
  const passedRules = PASSWORD_RULES.filter((rule) => rule.test(newPassword)).length;
  const strength = passedRules / PASSWORD_RULES.length;
  const strengthTone = strength === 1 ? 'bg-green-500' : strength >= 0.6 ? 'bg-yellow-400' : 'bg-orange-500';
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword;
  const inputClass =
    'w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth';

  return (
    <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
      <div className="flex items-start gap-3 mb-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">Change password</h3>
          <p className="text-sm text-muted-foreground">
        After changing it, you stay signed in here and every other device is signed out.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Current password</label>
          <input
            type={inputType}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">New password</label>
          <input
            type={inputType}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={inputClass}
            required
          />
          {newPassword && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full rounded-full transition-all ${strengthTone}`} style={{ width: `${strength * 100}%` }} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {strength === 1 ? 'Strong' : `${passedRules}/${PASSWORD_RULES.length}`}
              </span>
            </div>
          )}
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
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
          <label className="block text-sm font-medium text-foreground mb-2">Confirm new password</label>
          <input
            type={inputType}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={inputClass}
            required
          />
          {confirmPassword && (
            <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${matches ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              <Check className={`w-3.5 h-3.5 ${matches ? '' : 'opacity-40'}`} />
              {matches ? 'Passwords match' : "Passwords don't match yet"}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
        >
          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPasswords ? 'Hide passwords' : 'Show passwords'}
        </button>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {isSaving ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}

// PH mobile number, stored as 09XXXXXXXXX (same as the mobile app,
// partyup-mobile lib/phone.ts). Format-checked only, not SMS-verified.
function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = `0${digits.slice(2)}`;
  else if (digits.startsWith('9')) digits = `0${digits}`;
  return digits.slice(0, 11);
}

function formatPhone(phone: string) {
  return [phone.slice(0, 4), phone.slice(4, 7), phone.slice(7, 11)].filter(Boolean).join(' ');
}

function MobileNumberCard({ userId }: { userId: string }) {
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const stored = (data?.phone as string | null) ?? null;
        setSaved(stored);
        setPhone(normalizePhone(stored ?? ''));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const valid = /^09\d{9}$/.test(phone);
  const changed = phone !== saved;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setError('Enter a valid PH mobile number, e.g. 0917 123 4567.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: saveError } = await supabase.from('profiles').update({ phone }).eq('id', userId);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSaved(phone);
    toast.success('Mobile number saved');
  };

  return (
    <form onSubmit={handleSave} className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Phone className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">Mobile number</h3>
          <p className="text-sm text-muted-foreground">Every PartyUp account needs one so the team can reach each other in an emergency.</p>
        </div>
        {!loading && !saved && <Pill tone="orange" className="ml-auto shrink-0">Missing</Pill>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="tel"
          inputMode="numeric"
          value={formatPhone(phone)}
          onChange={(e) => setPhone(normalizePhone(e.target.value))}
          placeholder={loading ? 'Loading…' : '0917 123 4567'}
          disabled={loading}
          className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || saving || !changed || !phone}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </form>
  );
}
