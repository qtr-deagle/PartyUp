import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { KeyRound, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { grantAdmin, listStaff, removeAdmin, type StaffRow } from '@/lib/adminStaff';
import { adminSendPasswordReset } from '@/lib/password';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Admins (Team & Access)
 *
 * Admins are the PartyUp team: referees who review IDs and vehicles, handle
 * SOS and reports, and run the economy. They never play (no guild, no
 * leaderboard). Because admin is the most powerful role, adding one asks
 * for the email twice, you can't remove yourself, and the last admin can't
 * be removed (both also enforced by set_admin_role in the database).
 */
export default function AdminTeam() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<StaffRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removing, setRemoving] = useState<StaffRow | null>(null);
  const [resetting, setResetting] = useState<StaffRow | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const { data } = await listStaff(['admin']);
    setAdmins(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useTableRealtime(['profiles'], () => void load(true));

  const emailsMatch = email.trim().length > 0 && email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  const handleAdd = async () => {
    if (!emailsMatch) {
      toast.error('The two emails must match');
      return;
    }
    setIsSubmitting(true);
    const { error, name } = await grantAdmin(email);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${name ?? email} is now an admin`);
    setEmail('');
    setConfirmEmail('');
    setShowAddForm(false);
    await load();
  };

  const handleRemove = async () => {
    if (!removing) return;
    setIsSubmitting(true);
    const { error } = await removeAdmin(removing.id);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${removing.display_name} is no longer an admin`);
    setRemoving(null);
    await load();
  };

  const handleSendReset = async () => {
    if (!resetting) return;
    setIsSubmitting(true);
    const { error } = await adminSendPasswordReset(resetting);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Password reset link sent to ${resetting.email}`);
    setResetting(null);
  };

  const lastAdmin = admins.filter((admin) => admin.is_active).length <= 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admins</h1>
            <p className="text-sm text-muted-foreground mt-2">The PartyUp team: reviews, safety, reports and the rewards economy</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex shrink-0 items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
          >
            <Plus className="w-5 h-5" />
            Add Admin
          </button>
        </div>

        {showAddForm && (
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Give Someone Admin Access</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Admins can see ID documents, change roles and run the platform, so only add PartyUp team members. They need a
              PartyUp account first. If they're in a guild they'll leave it, and a Guild Leader must be revoked first
              (admins don't play).
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
              <input
                type="email"
                placeholder="Type the email again to confirm"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
              {confirmEmail && !emailsMatch ? <p className="text-xs text-destructive">The emails don&apos;t match yet.</p> : null}
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={isSubmitting || !emailsMatch}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
                >
                  Grant admin access
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Admin</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => {
                    const isMe = admin.id === user?.id;
                    const cantRemove = isMe || (lastAdmin && admin.is_active);
                    return (
                      <tr key={admin.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {admin.display_name}
                                {isMe ? <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span> : null}
                              </p>
                              <p className="text-xs text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              admin.is_active
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {admin.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(admin.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          <button
                            onClick={() => setResetting(admin)}
                            disabled={!admin.email}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Send password reset link"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRemoving(admin)}
                            disabled={cantRemove}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isMe ? "You can't remove your own admin access" : cantRemove ? 'PartyUp needs at least one admin' : 'Remove admin access'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {removing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Remove Admin Access</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{removing.display_name}</span> becomes a regular traveler and
                loses access to this console. Their account is kept.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRemoving(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isSubmitting}
                  className="flex-1 bg-destructive text-white py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:bg-destructive/90"
                >
                  Remove admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resetting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Send Password Reset Link</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                This emails <span className="font-medium text-foreground">{resetting.email}</span> a one-time link to choose a
                new password. You won&apos;t see or set their password.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setResetting(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReset}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:shadow-lg"
                >
                  Send Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
