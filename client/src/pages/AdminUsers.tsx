import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  AlertCircle,
  Ban,
  BadgeCheck,
  CheckCircle,
  Clock,
  Crown,
  Eye,
  MapPin,
  MoreHorizontal,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  cancelUserDeletion,
  getUserDeletionBlockers,
  getUserDetail,
  getUserStats,
  listUsers,
  scheduleUserDeletion,
  setUserActive,
  setUserVerificationStatus,
  type DeletionBlocker,
  type UserDetail,
  type UserFilters,
  type UserSort,
  type UserSortColumn,
  type UserRole,
  type UserRow,
  type UserStats,
  type UserStatusFilter,
} from '@/lib/adminUsers';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { usePagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import { useAuth } from '@/contexts/AuthContext';
import { roleLabel } from '@/lib/guilds';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { REASON_PRESETS } from '@/lib/reasonPresets';
import { runUndoable } from '@/lib/undoable';
import { formatDate, formatDateTime, timeAgo } from '@/lib/datetime';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SortableTh from '@/components/SortableTh';
import { useSortState } from '@/hooks/useSortable';
import { PageHeader, Pill, SearchField, Segmented, StatTile, TableMessage, TD, TH, TR, Toolbar, type PillTone } from '@/components/admin/AdminUI';

const ROLE_TONE: Record<string, PillTone> = {
  traveler: 'gray',
  guild_leader: 'yellow',
  admin: 'blue',
};

const joinedFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'Asia/Manila' });

function UserAvatar({ user, size = 'md' }: { user: UserRow; size?: 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const dims = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10';
  if (user.avatar_url && !failed) {
    return (
      <img
        src={user.avatar_url}
        alt=""
        onError={() => setFailed(true)}
        className={`${dims} rounded-full object-cover bg-secondary shrink-0`}
      />
    );
  }
  return (
    <div className={`${dims} rounded-full bg-primary/20 flex items-center justify-center shrink-0`}>
      <span className="text-primary font-bold">{user.display_name?.charAt(0) ?? '?'}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Pill tone={ROLE_TONE[role] ?? 'gray'}>
      {role === 'guild_leader' && <Crown className="w-3 h-3" />}
      {role === 'admin' && <Shield className="w-3 h-3" />}
      {roleLabel(role)}
    </Pill>
  );
}

function VerificationBadge({ status }: { status: UserRow['verification_status'] }) {
  if (status === 'approved') {
    return (
      <Pill tone="green">
        <CheckCircle className="w-3 h-3" /> Verified
      </Pill>
    );
  }
  if (status === 'pending' || status === 'resubmitted') {
    return (
      <Pill tone="orange">
        <Clock className="w-3 h-3" /> Pending review
      </Pill>
    );
  }
  if (status === 'rejected') {
    return <Pill tone="red">Rejected</Pill>;
  }
  return <Pill tone="gray">Not submitted</Pill>;
}

function SuspendedPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
      <Ban className="w-3 h-3" /> Suspended
    </span>
  );
}

function DeletionPill({ scheduledFor }: { scheduledFor: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
      <Trash2 className="w-3 h-3" /> Deletion pending · {formatDate(scheduledFor)}
    </span>
  );
}

function StatusPills({ user }: { user: UserRow }) {
  if (user.deletion_scheduled_for) return <DeletionPill scheduledFor={user.deletion_scheduled_for} />;
  return !user.is_active ? <SuspendedPill /> : null;
}

type StatKey = 'total' | 'verified' | 'pending' | 'guildLeaders' | 'suspended';

const STAT_CARDS: { key: StatKey; label: string; icon: React.ElementType; tone: string; filters: UserFilters }[] = [
  { key: 'total', label: 'All users', icon: Users, tone: 'text-primary bg-primary/10', filters: {} },
  { key: 'verified', label: 'Verified', icon: BadgeCheck, tone: 'text-green-600 bg-green-500/15 dark:text-green-400', filters: { status: 'verified' } },
  { key: 'pending', label: 'Pending ID', icon: Clock, tone: 'text-orange-600 bg-orange-500/15 dark:text-orange-400', filters: { status: 'pending' } },
  { key: 'guildLeaders', label: 'Guild Leaders', icon: Crown, tone: 'text-yellow-600 bg-yellow-500/15 dark:text-yellow-400', filters: { role: 'guild_leader' } },
  { key: 'suspended', label: 'Suspended', icon: Ban, tone: 'text-red-600 bg-red-500/15 dark:text-red-400', filters: { status: 'suspended' } },
];

const sameFilters = (a: UserFilters, b: UserFilters) => a.role === b.role && a.status === b.status;

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmVerify, setConfirmVerify] = useState<UserRow | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  // null while the check is loading.
  const [deleteBlockers, setDeleteBlockers] = useState<DeletionBlocker[] | null>(null);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // `silent` refreshes (realtime / tab focus) skip the loading state and the
  // error toast.
  // Click a column title: ascending, descending, then off (newest first).
  // Sorted in the query, since the table loads one page at a time.
  const userSort = useSortState<UserSortColumn>();
  const sortArg: UserSort | undefined = userSort.sort
    ? { column: userSort.sort.key, ascending: userSort.sort.direction === 'asc' }
    : undefined;
  const pagination = usePagination(totalUsers, [searchTerm, filters, userSort.sort]);
  const range = { from: pagination.from, to: pagination.to };

  const loadUsers = useCallback(
    async (
      search: string,
      activeFilters: UserFilters,
      pageRange: { from: number; to: number },
      sort: UserSort | undefined,
      silent = false
    ) => {
      if (!silent) setIsLoading(true);
      const [{ data, count, error }, nextStats] = await Promise.all([
        listUsers(search, activeFilters, pageRange, sort),
        getUserStats(),
      ]);
      if (error) {
        setLoadError(error.message);
        if (!silent) toast.error('Failed to load users');
      } else {
        setLoadError(null);
        setUsers(data);
        setTotalUsers(count);
      }
      setStats(nextStats);
      setIsLoading(false);
    },
    []
  );

  // Debounce typing in the search box; page / filter clicks load right away.
  const lastSearch = useRef(searchTerm);
  useEffect(() => {
    const typed = lastSearch.current !== searchTerm;
    lastSearch.current = searchTerm;
    const timeout = setTimeout(() => void loadUsers(searchTerm, filters, range, sortArg), typed ? 300 : 0);
    return () => clearTimeout(timeout);
    // sortArg is rebuilt each render; its column/direction are the real deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, range.from, range.to, sortArg?.column, sortArg?.ascending, loadUsers]);

  const reload = () => loadUsers(searchTerm, filters, range, sortArg, true);
  useTableRealtime('profiles', () => void reload());

  // Keep the drawer's header in sync with the refreshed row (e.g. after suspend).
  useEffect(() => {
    if (!detailUser) return;
    const fresh = users.find((u) => u.id === detailUser.id);
    if (fresh && fresh !== detailUser) setDetailUser(fresh);
  }, [users, detailUser]);

  const openDetail = async (user: UserRow) => {
    setDetailUser(user);
    setDetail(null);
    setDetailLoading(true);
    const { data, error } = await getUserDetail(user.id);
    setDetailLoading(false);
    if (error) toast.error('Failed to load user details');
    else setDetail(data);
  };

  // Optimistic patches for actions still inside their Undo window.
  const [patches, setPatches] = useState<Record<string, Partial<UserRow>>>({});
  const patch = (id: string, value: Partial<UserRow> | null) =>
    setPatches((prev) => {
      const next = { ...prev };
      if (value) next[id] = { ...next[id], ...value };
      else delete next[id];
      return next;
    });
  const withPatch = (user: UserRow): UserRow => (patches[user.id] ? { ...user, ...patches[user.id] } : user);
  const shownUsers = users.map(withPatch);
  const shownDetailUser = detailUser ? withPatch(detailUser) : null;

  const handleVerifyUser = (user: UserRow) => {
    setConfirmVerify(null);
    runUndoable({
      key: `user-verify:${user.id}`,
      message: `Verifying ${user.display_name}…`,
      onHide: () => patch(user.id, { verification_status: 'approved' }),
      onRestore: () => patch(user.id, null),
      commit: () => setUserVerificationStatus(user.id, 'approved'),
      onCommitted: () => void reload().then(() => patch(user.id, null)),
      success: `${user.display_name} is now verified`,
      error: 'Failed to verify user',
    });
  };

  const handleSetActive = (user: UserRow, active: boolean) => {
    setConfirmSuspend(null);
    runUndoable({
      key: `user-active:${user.id}`,
      message: active ? `Reactivating ${user.display_name}…` : `Suspending ${user.display_name}…`,
      onHide: () => patch(user.id, { is_active: active }),
      onRestore: () => patch(user.id, null),
      commit: () => setUserActive(user.id, active),
      onCommitted: () => void reload().then(() => patch(user.id, null)),
      success: active ? `${user.display_name} reactivated` : `${user.display_name} suspended`,
      error: active ? 'Failed to reactivate user' : 'Failed to suspend user',
    });
  };

  // Check what blocks deletion as the dialog opens, so the admin sees it
  // before writing a reason.
  const openDeleteDialog = async (user: UserRow) => {
    setConfirmDelete(user);
    setDeleteBlockers(null);
    const { data, error } = await getUserDeletionBlockers(user.id);
    if (error) toast.error(`Couldn't check this account: ${error.message}`);
    setDeleteBlockers(error ? [] : data);
  };

  const handleScheduleDeletion = async (user: UserRow, reason: string) => {
    const { data, error } = await scheduleUserDeletion(user.id, reason);
    if (error) {
      // Something new blocks it since the dialog opened: show the fresh list.
      const { data: blockers } = await getUserDeletionBlockers(user.id);
      if (blockers.length) setDeleteBlockers(blockers);
      else toast.error(error.message);
      return false;
    }
    toast.success(`${user.display_name} will be deleted on ${data ? formatDate(data) : 'the scheduled date'}`);
    void reload();
    return true;
  };

  const handleCancelDeletion = async (user: UserRow) => {
    const { error } = await cancelUserDeletion(user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Restored ${user.display_name}'s account`);
    void reload();
  };

  // Admins are managed on the Team page; nobody can suspend themselves.
  const canSuspend = (user: UserRow) => user.role !== 'admin' && user.id !== me?.id;
  // A pending deletion owns is_active until it's cancelled or purged.
  const pendingDeletion = (user: UserRow) => user.deletion_scheduled_for !== null;

  const actionButtons = (user: UserRow) => ({
    verify: user.verification_status !== 'approved' && !pendingDeletion(user),
    suspend: canSuspend(user) && user.is_active && !pendingDeletion(user),
    reactivate: canSuspend(user) && !user.is_active && !pendingDeletion(user),
    scheduleDelete: canSuspend(user) && !pendingDeletion(user),
    cancelDelete: canSuspend(user) && pendingDeletion(user),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          subtitle={
            stats
              ? `${stats.total} users · ${stats.pending} awaiting ID review${stats.suspended > 0 ? ` · ${stats.suspended} suspended` : ''}`
              : 'Everyone with a PartyUp account'
          }
        />

        {/* Stat cards (click to filter) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {STAT_CARDS.map(({ key, label, icon, tone, filters: cardFilters }) => (
            <StatTile
              key={key}
              icon={icon as typeof Users}
              tone={tone}
              label={label}
              value={stats ? stats[key] : '–'}
              onClick={() => setFilters(cardFilters)}
              active={sameFilters(filters, cardFilters)}
            />
          ))}
        </div>

        {/* Search + filters */}
        <Toolbar>
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or email..." />
          <Segmented
            value={filters.role ?? 'all'}
            options={[
              { value: 'all', label: 'All roles' },
              { value: 'traveler', label: 'Travelers' },
              { value: 'guild_leader', label: <><Crown className="w-3.5 h-3.5" /> Leaders</> },
              { value: 'admin', label: <><Shield className="w-3.5 h-3.5" /> Admins</> },
            ]}
            onChange={(value) => setFilters((f) => ({ ...f, role: value === 'all' ? undefined : (value as UserRole) }))}
          />
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, status: value === 'all' ? undefined : (value as UserStatusFilter) }))
            }
          >
            <SelectTrigger className="w-44 !h-10 bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending review</SelectItem>
              <SelectItem value="unverified">Unverified / rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </Toolbar>

        {/* Users Table */}
        <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1010 }}>
              <colgroup>
                <col />
                <col />
                <col style={{ width: 160 }} />
                <col style={{ width: 190 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 110 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <SortableTh label="User" sortKey="display_name" className={TH} sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Email" sortKey="email" className={TH} sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Role" sortKey="role" className={TH} sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Status" sortKey="verification_status" className={TH} sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Joined" sortKey="created_at" className={TH} sort={userSort.sort} onSort={userSort.toggle} />
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-border transition-opacity ${isLoading && users.length > 0 ? 'opacity-60' : ''}`}>
                {isLoading && users.length === 0 ? (
                  <TableMessage colSpan={6} icon={Users} title="Loading" loading />
                ) : loadError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-destructive">
                      Failed to load users: {loadError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <TableMessage colSpan={6} icon={Search} title="No users match these filters" text="Try a different search, role or status." />
                ) : (
                  shownUsers.map((user) => {
                    const actions = actionButtons(user);
                    return (
                      <tr
                        key={user.id}
                        onClick={() => void openDetail(user)}
                        className={`${TR} cursor-pointer ${
                          user.is_active && !user.deletion_scheduled_for ? '' : 'opacity-60'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate">
                                <span className="truncate">{user.display_name}</span>
                                {user.id === me?.id ? <Pill tone="blue">You</Pill> : null}
                              </div>
                              {user.city && (
                                <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3 shrink-0" /> {user.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground truncate" title={user.email ?? undefined}>{user.email ?? '—'}</td>
                        <td className="px-5 py-3.5">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <VerificationBadge status={user.verification_status} />
                            <StatusPills user={user} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                          {joinedFormat.format(new Date(user.created_at))}
                        </td>
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                
                                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-smooth disabled:opacity-50"
                                title="Actions"
                                aria-label={`Actions for ${user.display_name}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => void openDetail(user)}>
                                <Eye className="w-4 h-4" /> View details
                              </DropdownMenuItem>
                              {actions.verify && (
                                <DropdownMenuItem onSelect={() => setConfirmVerify(user)}>
                                  <Shield className="w-4 h-4" /> Verify
                                </DropdownMenuItem>
                              )}
                              {(actions.suspend || actions.reactivate || actions.scheduleDelete || actions.cancelDelete) && (
                                <DropdownMenuSeparator />
                              )}
                              {actions.suspend && (
                                <DropdownMenuItem variant="destructive" onSelect={() => setConfirmSuspend(user)}>
                                  <Ban className="w-4 h-4" /> Suspend
                                </DropdownMenuItem>
                              )}
                              {actions.reactivate && (
                                <DropdownMenuItem onSelect={() => handleSetActive(user, true)}>
                                  <RotateCcw className="w-4 h-4" /> Reactivate
                                </DropdownMenuItem>
                              )}
                              {actions.cancelDelete && (
                                <DropdownMenuItem onSelect={() => void handleCancelDeletion(user)}>
                                  <RotateCcw className="w-4 h-4" /> Cancel deletion
                                </DropdownMenuItem>
                              )}
                              {actions.scheduleDelete && (
                                <DropdownMenuItem variant="destructive" onSelect={() => void openDeleteDialog(user)}>
                                  <Trash2 className="w-4 h-4" /> Delete account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loadError && <TablePagination pagination={pagination} itemLabel="users" />}
        </div>
      </div>

      {/* Suspend confirmation */}
      <ConfirmActionDialog
        open={confirmSuspend !== null}
        onOpenChange={(open) => !open && setConfirmSuspend(null)}
        tone="destructive"
        title={`Suspend ${confirmSuspend?.display_name ?? 'user'}?`}
        description="They'll be locked out of the PartyUp app and hidden from search, nearby travelers, and friend requests. You can reactivate them at any time."
        confirmLabel="Suspend"
        onConfirm={() => {
          if (confirmSuspend) handleSetActive(confirmSuspend, false);
        }}
      />

      {/* Delete account confirmation */}
      <ConfirmActionDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        tone="destructive"
        title={
          deleteBlockers?.length
            ? `${confirmDelete?.display_name ?? 'This user'} can't be deleted yet`
            : `Delete ${confirmDelete?.display_name ?? 'this user'}?`
        }
        description={
          deleteBlockers?.length
            ? 'Deleting them now would remove data other travelers depend on. These need to be resolved first:'
            : 'The account is deactivated now and permanently deleted in 30 days, along with their trips, chats, verification documents and guild progress. They get an email, and you can cancel it until then.'
        }
        confirmLabel="Schedule deletion"
        confirmDisabled={!deleteBlockers || deleteBlockers.length > 0}
        notes={deleteBlockers?.length === 0 ? { label: 'Reason', required: true, placeholder: 'e.g. User asked by email on Oct 8', presets: REASON_PRESETS.accountDeletion } : undefined}
        typeToConfirm={deleteBlockers?.length === 0 ? 'DELETE' : undefined}
        onConfirm={async (reason) => {
          if (!confirmDelete) return;
          if (!(await handleScheduleDeletion(confirmDelete, reason))) return false;
          setConfirmDelete(null);
        }}
      >
        {deleteBlockers === null ? (
          <p className="text-sm text-muted-foreground">Checking this account…</p>
        ) : deleteBlockers.length > 0 ? (
          <ul className="space-y-2">
            {deleteBlockers.map((blocker) => (
              <li
                key={`${blocker.kind}-${blocker.ref_id}`}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{blocker.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </ConfirmActionDialog>

      {/* Manual verify confirmation */}
      <ConfirmActionDialog
        open={confirmVerify !== null}
        onOpenChange={(open) => !open && setConfirmVerify(null)}
        title={`Mark ${confirmVerify?.display_name ?? 'user'} as verified?`}
        description="This skips the ID review queue. Only do this if you've checked their identity another way. They'll be able to join trips right away."
        confirmLabel="Mark verified"
        onConfirm={() => {
          if (confirmVerify) handleVerifyUser(confirmVerify);
        }}
      />

      {/* User detail drawer */}
      <Sheet open={detailUser !== null} onOpenChange={(open) => !open && setDetailUser(null)}>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
          {shownDetailUser && (
            <>
              <div className="h-24 -mb-14 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
              <SheetHeader className="items-center text-center pt-0">
                <div className="rounded-full ring-4 ring-background">
                  <UserAvatar user={shownDetailUser} size="lg" />
                </div>
                <SheetTitle className="text-xl mt-2">{shownDetailUser.display_name}</SheetTitle>
                <SheetDescription>{shownDetailUser.email ?? 'No email'}</SheetDescription>
                <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                  <RoleBadge role={shownDetailUser.role} />
                  <VerificationBadge status={shownDetailUser.verification_status} />
                  <StatusPills user={shownDetailUser} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {joinedFormat.format(new Date(shownDetailUser.created_at))}
                  {shownDetailUser.city ? ` · ${shownDetailUser.city}` : ''}
                </p>
              </SheetHeader>

              <div className="px-4 pb-4 space-y-5">
                {detailLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Loading details...</p>
                ) : detail ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Trips created', value: detail.tripsCreated },
                        { label: 'Trips joined', value: detail.tripsJoined },
                        { label: 'Reports', value: detail.reportsAgainst, warn: detail.reportsAgainst > 0 },
                      ].map((tile) => (
                        <div key={tile.label} className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
                          <div className={`text-xl font-bold ${tile.warn ? 'text-destructive' : 'text-foreground'}`}>
                            {tile.value}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{tile.label}</div>
                        </div>
                      ))}
                    </div>

                    <dl className="text-sm space-y-2">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Guild</dt>
                        <dd className="font-medium text-foreground text-right">{detail.guildName ?? '—'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="text-right">
                          <span className="font-medium text-foreground">{detail.phone ?? '—'}</span>
                          {detail.phoneChanges.some((change) => change.old_phone) && (
                            <span className="block text-xs text-orange-600 dark:text-orange-400">
                              Changed {timeAgo(detail.phoneChanges.find((change) => change.old_phone)!.changed_at)}
                            </span>
                          )}
                        </dd>
                      </div>
                      {detail.phoneChanges.length > 0 && (
                        <div>
                          <dt className="text-muted-foreground mb-1.5">Number history</dt>
                          <dd>
                            <ol className="space-y-1.5 border-l border-border pl-3">
                              {detail.phoneChanges.map((change) => (
                                <li key={change.id} className="text-xs">
                                  <p className="font-mono text-foreground">
                                    {change.old_phone ? (
                                      <>
                                        <span className="text-muted-foreground line-through">{change.old_phone}</span> → {change.new_phone ?? 'removed'}
                                      </>
                                    ) : (
                                      <>Added {change.new_phone}</>
                                    )}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {formatDateTime(change.changed_at)}
                                    {change.changed_by && change.changed_by !== detailUser?.id ? ' · by an admin' : ''}
                                  </p>
                                </li>
                              ))}
                            </ol>
                          </dd>
                        </div>
                      )}
                      {detail.bio && (
                        <div>
                          <dt className="text-muted-foreground mb-1">Bio</dt>
                          <dd className="text-foreground">{detail.bio}</dd>
                        </div>
                      )}
                    </dl>

                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-2">Reports against this user</h3>
                      {detail.recentReports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No reports — clean record.</p>
                      ) : (
                        <ul className="space-y-2">
                          {detail.recentReports.map((report) => (
                            <li key={report.id} className="rounded-lg border border-border p-3">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-medium capitalize text-foreground">{report.report_type}</span>
                                <span className="capitalize text-muted-foreground">
                                  {report.status} · {formatDate(report.created_at)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{report.details}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                ) : null}

                {(() => {
                  const actions = actionButtons(shownDetailUser);
                  if (!Object.values(actions).some(Boolean)) return null;
                  return (
                    <div className="flex gap-2 pt-2 border-t border-border">
                      {actions.verify && (
                        <button
                          onClick={() => setConfirmVerify(shownDetailUser)}
                          
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                        >
                          <Shield className="w-4 h-4" /> Verify
                        </button>
                      )}
                      {actions.suspend && (
                        <button
                          onClick={() => setConfirmSuspend(shownDetailUser)}
                          
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 text-sm font-medium disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" /> Suspend
                        </button>
                      )}
                      {actions.reactivate && (
                        <button
                          onClick={() => handleSetActive(shownDetailUser, true)}
                          
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium disabled:opacity-50"
                        >
                          <RotateCcw className="w-4 h-4" /> Reactivate
                        </button>
                      )}
                      {actions.cancelDelete && (
                        <button
                          onClick={() => void handleCancelDeletion(shownDetailUser)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium"
                        >
                          <RotateCcw className="w-4 h-4" /> Cancel deletion
                        </button>
                      )}
                      {actions.scheduleDelete && (
                        <button
                          onClick={() => void openDeleteDialog(shownDetailUser)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
