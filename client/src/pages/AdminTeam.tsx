import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { KeyRound, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { grantAdmin, listStaff, removeAdmin, type StaffRow } from '@/lib/adminStaff';
import { adminSendPasswordReset } from '@/lib/password';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { runUndoable, usePendingUndoKeys } from '@/lib/undoable';
import { formatDate } from '@/lib/datetime';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';

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

  // Click a column title: ascending, descending, then off (newest first).
  const adminSort = useSortable(
    admins,
    {
      admin: (a) => a.display_name,
      status: (a) => (a.is_active ? 'active' : 'inactive'),
      joined: (a) => a.created_at,
    },
    { key: 'joined', direction: 'desc' }
  );

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
                  disabled={!emailsMatch}
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
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 780 }}>
              <colgroup>
                <col />
                <col style={{ width: 180 }} />
                <col style={{ width: 220 }} />
                <col style={{ width: 180 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <SortableTh label="Admin" sortKey="admin" sort={adminSort.sort} onSort={adminSort.toggle} />
                  <SortableTh label="Status" sortKey="status" sort={adminSort.sort} onSort={adminSort.toggle} />
                  <SortableTh label="Joined" sortKey="joined" sort={adminSort.sort} onSort={adminSort.toggle} />
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
                  adminSort.sorted
                    .filter((admin) => !pendingKeys.has(`admin-remove:${admin.id}`))
                    .map((admin) => {
                    const isMe = admin.id === user?.id;
                    const cantRemove = isMe || (lastAdmin && admin.is_active);
                    return (
                      <tr key={admin.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {admin.display_name}
                                {isMe ? <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span> : null}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              admin.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
                            }`}
                          >
                            {admin.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(admin.created_at)}</td>
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
