import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import StaffLayout from '@/components/StaffLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PASSWORD_RULES, changeOwnPassword, validateNewPassword } from '@/lib/password';
import { roleLabel } from '@/lib/guilds';

/**
 * Account Settings (staff & admin)
 *
 * - Shows the signed-in console account
 * - Change password: requires the current password, then signs out every
 *   other session so a leaked password stops working everywhere
 */
export default function AccountSettings() {
  const { user } = useAuth();
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
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
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
