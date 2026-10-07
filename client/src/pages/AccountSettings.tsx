import React, { useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import StaffLayout from '@/components/StaffLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Eye, EyeOff, ImagePlus, KeyRound, Loader2, ShieldCheck, Shuffle, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PASSWORD_RULES, changeOwnPassword, validateNewPassword } from '@/lib/password';
import { roleLabel } from '@/lib/guilds';
import { removeOwnAvatar, setIllustratedAvatar, uploadOwnAvatar } from '@/lib/avatar';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';

/**
 * Account Settings (staff & admin)
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
  const Layout = isAdmin ? AdminLayout : StaffLayout;

  return (
    <Layout>
      {/* AdminLayout pads its <main>; StaffLayout leaves padding to each page. */}
      <div className={`max-w-2xl mx-auto space-y-6 ${isAdmin ? '' : 'p-8'}`}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Your console sign-in and password</p>
        </div>

        {user && (
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Signed in as
            </h3>
            <AvatarEditor name={user.name} avatarUrl={user.avatar ?? null} onChanged={refreshUser} />
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium text-foreground">{user.name}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground break-all">{user.email}</dd>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium text-foreground capitalize">{roleLabel(user.role)}</dd>
            </dl>
          </div>
        )}

        <ChangePasswordCard email={user?.email ?? ''} />
      </div>
    </Layout>
  );
}

function AvatarEditor({ name, avatarUrl, onChanged }: { name: string; avatarUrl: string | null; onChanged: () => Promise<void> }) {
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
      <div className="relative w-20 h-20 shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            {name.trim().charAt(0).toUpperCase()}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="space-y-2">
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
  const inputClass =
    'w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth';

  return (
    <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <KeyRound className="w-5 h-5" />
        Change password
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        After changing it, you stay signed in here and every other device is signed out.
      </p>

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
          <label className="block text-sm font-medium text-foreground mb-2">Confirm new password</label>
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
