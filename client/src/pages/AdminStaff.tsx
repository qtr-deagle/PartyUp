import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import GuildDetailDialog from '@/components/GuildDetailDialog';
import { Search, Edit2, Trash2, Plus, X, KeyRound, Crown } from 'lucide-react';
import { toast } from 'sonner';
import {
  listLeaderGuildMembers,
  listStaff,
  promoteToStaff,
  revokeGuildLeader,
  updateStaffMember,
  type LeaderGuildMember,
  type StaffRow,
} from '@/lib/adminStaff';
import { adminSendPasswordReset } from '@/lib/password';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import { LeaderApplications, LeaderScorecards } from '@/components/LeaderProgram';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { runUndoable } from '@/lib/undoable';
import { formatDate } from '@/lib/datetime';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';

/**
 * Guild Leader Management
 *
 * Guild Leaders are promoted travelers who run guilds. Admins (the PartyUp
 * team) are managed separately on the Admins page.
 *
 * Admin can:
 * - Approve or decline leader applications from the mobile app (main path)
 * - Promote an existing account to Guild Leader directly (special cases)
 * - Deactivate / reactivate a leader, or email them a password reset link
 * - Revoke a leader: their guild is handed to one of its members or disbanded
 * - See each leader's guild health in the scorecards
 */
export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newLeaderEmail, setNewLeaderEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPromote, setConfirmPromote] = useState<string | null>(null);
  // Optimistic active/inactive while a change is inside its Undo window.
  const [activePatch, setActivePatch] = useState<Record<string, boolean>>({});
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);
  const [editActive, setEditActive] = useState(true);
  const [revokingStaff, setRevokingStaff] = useState<StaffRow | null>(null);
  const [successors, setSuccessors] = useState<LeaderGuildMember[]>([]);
  const [loadingSuccessors, setLoadingSuccessors] = useState(false);
  const [revokeChoice, setRevokeChoice] = useState<'handover' | 'disband'>('handover');
  const [successorId, setSuccessorId] = useState('');
  const [resettingStaff, setResettingStaff] = useState<StaffRow | null>(null);
  const [viewingGuildId, setViewingGuildId] = useState<string | null>(null);
  // Bumped after an application decision so the scorecards pick up the new leader.
  const [scorecardKey, setScorecardKey] = useState(0);

  // `silent` refreshes (realtime / tab focus) skip the loading state.
  const loadStaff = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const { data } = await listStaff(['guild_leader']);
    setStaff(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  // Roles live on profiles; guild names and sizes on guilds/guild_members.
  useTableRealtime(['profiles', 'guilds', 'guild_members'], () => void loadStaff(true));

  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.guild_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [staff, searchTerm]
  );
  // Click a column title: ascending, descending, then off (newest first).
  const staffSort = useSortable(
    filteredStaff,
    {
      leader: (m) => m.display_name,
      guild: (m) => m.guild_name,
      status: (m) => ((activePatch[m.id] ?? m.is_active) ? 'active' : 'inactive'),
      joined: (m) => m.created_at,
    },
    { key: 'joined', direction: 'desc' }
  );
  const staffPage = useClientPagination(staffSort.sorted, [searchTerm, staffSort.sort]);

  const handleAddLeader = () => {
    if (!newLeaderEmail.trim()) {
      toast.error('Enter an email address');
      return;
    }
    setConfirmPromote(newLeaderEmail.trim());
  };

  const promote = (email: string) => {
    runUndoable({
      key: `leader-promote:${email.toLowerCase()}`,
      message: `Making ${email} a Guild Leader…`,
      commit: async () => {
        const { error } = await promoteToStaff(email, 'guild_leader');
        return { error };
      },
      onCommitted: () => void loadStaff(true),
      success: `${email} is now a Guild Leader`,
      error: 'Could not promote',
    });
    setNewLeaderEmail('');
    setShowAddStaffForm(false);
  };

  const openEdit = (member: StaffRow) => {
    setEditingStaff(member);
    setEditActive(member.is_active);
  };

  const handleSaveEdit = () => {
    if (!editingStaff) return;
    const member = editingStaff;
    const active = editActive;
    setEditingStaff(null);
    if (active === member.is_active) return;
    runUndoable({
      key: `leader-active:${member.id}`,
      message: active ? `Reactivating ${member.display_name}…` : `Deactivating ${member.display_name}…`,
      onHide: () => setActivePatch((prev) => ({ ...prev, [member.id]: active })),
      onRestore: () => setActivePatch(({ [member.id]: _, ...rest }) => rest),
      commit: () => updateStaffMember(member.id, { isActive: active }),
      onCommitted: () =>
        void loadStaff(true).then(() => setActivePatch(({ [member.id]: _, ...rest }) => rest)),
      success: active ? `${member.display_name} reactivated` : `${member.display_name} deactivated`,
      error: `Could not update ${member.display_name}`,
    });
  };

  const openRevoke = async (member: StaffRow) => {
    setRevokingStaff(member);
    setRevokeChoice('handover');
    setSuccessorId('');
    setSuccessors([]);
    if (!member.guild_name) return;
    setLoadingSuccessors(true);
    const { data, error } = await listLeaderGuildMembers(member.id);
    setLoadingSuccessors(false);
    if (error) toast.error(error.message);
    setSuccessors(data);
    // Sorted by points; preselect the top member.
    if (data[0]) setSuccessorId(data[0].user_id);
    else setRevokeChoice('disband');
  };

  const handleRevoke = async () => {
    if (!revokingStaff) return;
    const hasGuild = !!revokingStaff.guild_name;
    if (hasGuild && revokeChoice === 'handover' && !successorId) {
      toast.error('Pick who takes over the guild');
      return;
    }
    setIsSubmitting(true);
    const { error } = await revokeGuildLeader(
      revokingStaff.id,
      hasGuild ? (revokeChoice === 'handover' ? { successorId } : { disband: true }) : {}
    );
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const successor = successors.find((member) => member.user_id === successorId);
    toast.success(
      !hasGuild
        ? `${revokingStaff.display_name} is a traveler again`
        : revokeChoice === 'handover'
          ? `${successor?.display_name ?? 'The new leader'} now leads ${revokingStaff.guild_name}`
          : `${revokingStaff.guild_name} was disbanded`
    );
    setRevokingStaff(null);
    await loadStaff();
    setScorecardKey((key) => key + 1);
  };

  // Emails can't be unsent, so this is confirm-only (no Undo).
  const handleSendReset = async (member: StaffRow) => {
    const { error } = await adminSendPasswordReset(member);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(`Password reset link sent to ${member.email}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guild Leader Management</h1>
            <p className="text-sm text-muted-foreground mt-2">Approve new leaders, track how their guilds are doing, and manage access</p>
          </div>
          <button
            onClick={() => setShowAddStaffForm(!showAddStaffForm)}
            className="flex shrink-0 items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-smooth"
          >
            <Plus className="w-5 h-5" />
            Promote directly
          </button>
        </div>

        {/* Promote directly (special cases; the normal path is an application) */}
        {showAddStaffForm && (
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Promote a Traveler to Guild Leader</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Normally travelers earn this by meeting the leader requirements and applying in the app. Use this only for special cases. They
              must already have a PartyUp account. To add a PartyUp team member, use the Admins page.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Traveler's email address"
                value={newLeaderEmail}
                onChange={(e) => setNewLeaderEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddLeader}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
                >
                  Make Guild Leader
                </button>
                <button
                  onClick={() => setShowAddStaffForm(false)}
                  className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leader applications from the mobile app */}
        <LeaderApplications
          onDecided={() => {
            void loadStaff(true);
            setScorecardKey((key) => key + 1);
          }}
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or guild..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Leaders table */}
        <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 890 }}>
              <colgroup>
                <col />
                <col />
                <col style={{ width: 140 }} />
                <col style={{ width: 170 }} />
                <col style={{ width: 180 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <SortableTh label="Leader" sortKey="leader" sort={staffSort.sort} onSort={staffSort.toggle} />
                  <SortableTh label="Guild" sortKey="guild" sort={staffSort.sort} onSort={staffSort.toggle} />
                  <SortableTh label="Status" sortKey="status" sort={staffSort.sort} onSort={staffSort.toggle} />
                  <SortableTh label="Joined" sortKey="joined" sort={staffSort.sort} onSort={staffSort.toggle} />
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No Guild Leaders found
                    </td>
                  </tr>
                ) : (
                  staffPage.pageItems.map((row) => ({ ...row, is_active: activePatch[row.id] ?? row.is_active })).map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="truncate font-medium text-foreground">{member.display_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {member.guild_id && member.guild_name ? (
                          <button
                            onClick={() => setViewingGuildId(member.guild_id)}
                            title={`View ${member.guild_name}`}
                            className="group flex max-w-full items-center gap-1.5 text-left text-foreground"
                          >
                            <Crown className="w-4 h-4 text-amber-600" />
                            <span className="truncate font-medium group-hover:text-primary group-hover:underline underline-offset-2">{member.guild_name}</span>
                            <span className="text-muted-foreground">· {member.member_count} {member.member_count === 1 ? 'member' : 'members'}</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground">No guild founded yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
                          }`}
                        >
                          {member.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(member.created_at)}</td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => openEdit(member)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                          title="Activate or deactivate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResettingStaff(member)}
                          disabled={!member.email}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Send password reset link"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void openRevoke(member)}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                          title="Revoke Guild Leader role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination pagination={staffPage} itemLabel="Guild Leaders" />
        </div>

        {/* How each leader's guild is doing */}
        <LeaderScorecards refreshKey={scorecardKey} />
      </div>

      {/* Edit Leader Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Edit {editingStaff.display_name}</h3>
              <button onClick={() => setEditingStaff(null)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">Active</span>
              </label>
              <p className="text-xs text-muted-foreground">
                An inactive account can&apos;t sign in. To remove the Guild Leader role, use Revoke instead.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:shadow-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password reset: confirm only (an email can't be unsent) */}
      <ConfirmActionDialog
        open={resettingStaff !== null}
        onOpenChange={(open) => !open && setResettingStaff(null)}
        title="Send password reset link?"
        description={
          <>
            This emails <span className="font-medium text-foreground">{resettingStaff?.email}</span> a one-time link to choose
            a new password. You won&apos;t see or set their password, and their current password keeps working until they use
            the link.
          </>
        }
        confirmLabel="Send link"
        onConfirm={() => (resettingStaff ? handleSendReset(resettingStaff) : undefined)}
      />

      {/* Promote directly */}
      <ConfirmActionDialog
        open={confirmPromote !== null}
        onOpenChange={(open) => !open && setConfirmPromote(null)}
        title="Make this traveler a Guild Leader?"
        description={
          <>
            <span className="font-medium text-foreground">{confirmPromote}</span> skips the application and can found and run a
            guild right away.
          </>
        }
        confirmLabel="Make Guild Leader"
        onConfirm={() => {
          if (confirmPromote) promote(confirmPromote);
        }}
      />

      {/* Revoke Modal: the guild must go somewhere */}
      {revokingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Revoke Guild Leader Role</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{revokingStaff.display_name}</span> becomes a traveler again.
                Their account, points and rank are kept.
              </p>
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
                This takes effect immediately and can&apos;t be undone from here. Members are notified.
              </p>

              {revokingStaff.guild_name ? (
                loadingSuccessors ? (
                  <p className="text-sm text-muted-foreground">Loading {revokingStaff.guild_name}&apos;s members...</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">What happens to {revokingStaff.guild_name}?</p>
                    <label
                      className={`flex gap-3 rounded-lg border p-3 ${successors.length ? 'cursor-pointer' : 'opacity-50'} ${
                        revokeChoice === 'handover' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="revoke-choice"
                        checked={revokeChoice === 'handover'}
                        disabled={successors.length === 0}
                        onChange={() => setRevokeChoice('handover')}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-foreground">Hand it to a member</p>
                        {successors.length === 0 ? (
                          <p className="text-xs text-muted-foreground">The guild has no other members.</p>
                        ) : (
                          <select
                            value={successorId}
                            onChange={(e) => {
                              setSuccessorId(e.target.value);
                              setRevokeChoice('handover');
                            }}
                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {successors.map((member) => (
                              <option key={member.user_id} value={member.user_id}>
                                {member.display_name} · {member.lifetime_points} pts
                              </option>
                            ))}
                          </select>
                        )}
                        <p className="text-xs text-muted-foreground">They become the new Guild Leader and keep the guild going.</p>
                      </div>
                    </label>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                        revokeChoice === 'disband' ? 'border-destructive bg-destructive/5' : 'border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="revoke-choice"
                        checked={revokeChoice === 'disband'}
                        onChange={() => setRevokeChoice('disband')}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Disband the guild</p>
                        <p className="text-xs text-muted-foreground">
                          Members are notified and can join another guild. Everyone keeps their points.
                        </p>
                      </div>
                    </label>
                  </div>
                )
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRevokingStaff(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={isSubmitting || loadingSuccessors}
                  className="flex-1 bg-destructive text-white py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:bg-destructive/90"
                >
                  {revokingStaff.guild_name && revokeChoice === 'disband' ? 'Revoke & disband' : 'Revoke role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guild inspector: members, level, perks and activity */}
      {viewingGuildId && <GuildDetailDialog guildId={viewingGuildId} onClose={() => setViewingGuildId(null)} />}
    </AdminLayout>
  );
}
