import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CalendarDays, Check, KeyRound, Mail, Plus, ShieldAlert, ShieldCheck, Trash2, UserCheck, X } from 'lucide-react';
import { Avatar, PageHeader, Pill, StatGrid, StatTile } from '@/components/admin/AdminUI';
import { toast } from 'sonner';
import { grantAdmin, listStaff, removeAdmin, type StaffRow } from '@/lib/adminStaff';
import { adminSendPasswordReset } from '@/lib/password';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { runUndoable, usePendingUndoKeys } from '@/lib/undoable';
import { formatDate } from '@/lib/datetime';

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
  const pendingKeys = usePendingUndoKeys();
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

  const handleAdd = () => {
    if (!emailsMatch) {
      toast.error('The two emails must match');
      return;
    }
    const target = email.trim();
    runUndoable({
      key: `admin-grant:${target.toLowerCase()}`,
      message: `Giving ${target} admin access…`,
      commit: async () => {
        const { error } = await grantAdmin(target);
        return { error };
      },
      onCommitted: () => void load(true),
      success: `${target} is now an admin`,
      error: 'Could not add admin',
    });
    setEmail('');
    setConfirmEmail('');
    setShowAddForm(false);
  };

  const handleRemove = (admin: StaffRow) => {
    runUndoable({
      key: `admin-remove:${admin.id}`,
      message: `Removing ${admin.display_name}'s admin access…`,
      commit: () => removeAdmin(admin.id),
      onCommitted: () => void load(true),
      success: `${admin.display_name} is no longer an admin`,
      error: 'Could not remove admin',
    });
  };

  // Emails can't be unsent, so this is confirm-only (no Undo).
  const handleSendReset = async (admin: StaffRow) => {
    const { error } = await adminSendPasswordReset(admin);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(`Password reset link sent to ${admin.email}`);
  };

  const lastAdmin = admins.filter((admin) => admin.is_active).length <= 1;

  // You first, then active admins, newest first.
  const shownAdmins = admins
    .filter((admin) => !pendingKeys.has(`admin-remove:${admin.id}`))
    .sort(
      (a, b) =>
        Number(b.id === user?.id) - Number(a.id === user?.id) ||
        Number(b.is_active) - Number(a.is_active) ||
        b.created_at.localeCompare(a.created_at)
    );
  const activeCount = admins.filter((admin) => admin.is_active).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Admins" subtitle="The PartyUp team: reviews, safety, reports and the rewards economy">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex shrink-0 items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-smooth ${
              showAddForm ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground hover:shadow-lg'
            }`}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Add admin
          </button>
        </PageHeader>

        <StatGrid className="xl:grid-cols-3">
          <StatTile icon={ShieldCheck} tone="bg-primary/10 text-primary" label="Admins" value={admins.length} />
          <StatTile icon={UserCheck} tone="bg-green-500/15 text-green-600 dark:text-green-400" label="Active" value={activeCount} />
          <StatTile
            icon={ShieldAlert}
            tone={lastAdmin ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-secondary text-muted-foreground'}
            label={lastAdmin ? 'Only one active admin' : 'Backup admins'}
            value={lastAdmin ? '!' : activeCount - 1}
            hint={lastAdmin ? 'Add a second admin as a backup' : undefined}
          />
        </StatGrid>

        {showAddForm && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground">Give someone admin access</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Admins can see ID documents, change roles and run the platform, so only add PartyUp team members. They need a PartyUp account
                  first. If they're in a guild they'll leave it, and a Guild Leader must be revoked first (admins don't play).
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Type it again to confirm"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      className={`w-full h-10 pl-4 pr-10 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-smooth ${
                        confirmEmail && !emailsMatch ? 'border-destructive/60' : 'border-border'
                      }`}
                    />
                    {confirmEmail && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailsMatch ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-destructive" />}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={!emailsMatch}
                    className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:shadow-lg transition-smooth disabled:opacity-50"
                  >
                    Grant access
                  </button>
                </div>
                {confirmEmail && !emailsMatch ? <p className="mt-1.5 text-xs text-destructive">The emails don&apos;t match yet.</p> : null}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shownAdmins.map((admin) => {
              const isMe = admin.id === user?.id;
              const cantRemove = isMe || (lastAdmin && admin.is_active);
              return (
                <div
                  key={admin.id}
                  className={`group flex flex-col rounded-2xl border bg-card shadow-elevation-1 transition-smooth hover:shadow-elevation-2 ${
                    isMe ? 'border-primary/40' : 'border-border'
                  } ${admin.is_active ? '' : 'opacity-70'}`}
                >
                  <div className="flex items-start gap-3 p-5">
                    <div className="relative">
                      <Avatar name={admin.display_name} size="lg" />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate font-semibold text-foreground">{admin.display_name}</p>
                        {isMe && <Pill tone="blue">You</Pill>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Pill tone={admin.is_active ? 'green' : 'gray'} dot>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </Pill>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <CalendarDays className="w-3 h-3" /> Since {formatDate(admin.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-end gap-1 border-t border-border bg-secondary/30 px-3 py-2 rounded-b-2xl">
                    <button
                      onClick={() => setResetting(admin)}
                      disabled={!admin.email}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Send password reset link"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset password
                    </button>
                    <button
                      onClick={() => setRemoving(admin)}
                      disabled={cantRemove}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isMe ? "You can't remove your own admin access" : cantRemove ? 'PartyUp needs at least one admin' : 'Remove admin access'}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        tone="destructive"
        title="Remove admin access?"
        description={
          <>
            <span className="font-medium text-foreground">{removing?.display_name}</span> becomes a regular traveler and loses
            access to this console. Their account is kept.
          </>
        }
        confirmLabel="Remove admin"
        onConfirm={() => {
          if (removing) handleRemove(removing);
        }}
      />

      <ConfirmActionDialog
        open={resetting !== null}
        onOpenChange={(open) => !open && setResetting(null)}
        title="Send password reset link?"
        description={
          <>
            This emails <span className="font-medium text-foreground">{resetting?.email}</span> a one-time link to choose a new
            password. You won&apos;t see or set their password. An email can&apos;t be unsent.
          </>
        }
        confirmLabel="Send link"
        onConfirm={() => (resetting ? handleSendReset(resetting) : undefined)}
      />
    </AdminLayout>
  );
}
