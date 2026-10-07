import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
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
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getUserDetail,
  getUserStats,
  listUsers,
  setUserActive,
  setUserVerificationStatus,
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
import { runUndoable } from '@/lib/undoable';
import { formatDate } from '@/lib/datetime';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SortableTh from '@/components/SortableTh';
import { useSortState } from '@/hooks/useSortable';

const ROLE_BADGE: Record<string, string> = {
  traveler: 'bg-secondary text-foreground',
  guild_leader: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
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
    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ROLE_BADGE[role] ?? ROLE_BADGE.traveler}`}>
      {roleLabel(role)}
    </span>
  );
}

function VerificationBadge({ status }: { status: UserRow['verification_status'] }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
        <CheckCircle className="w-4 h-4" /> Verified
      </span>
    );
  }
  if (status === 'pending' || status === 'resubmitted') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
        <Clock className="w-4 h-4" /> Pending review
      </span>
    );
  }
  if (status === 'rejected') {
    return <span className="text-xs font-medium text-destructive">Rejected</span>;
  }
  return <span className="text-xs text-muted-foreground">Not submitted</span>;
}

function SuspendedPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
      <Ban className="w-3 h-3" /> Suspended
    </span>
  );
}

type StatKey = 'total' | 'verified' | 'pending' | 'guildLeaders' | 'suspended';

const STAT_CARDS: { key: StatKey; label: string; icon: React.ElementType; tone: string; filters: UserFilters }[] = [
  { key: 'total', label: 'Total users', icon: Users, tone: 'text-primary bg-primary/10', filters: {} },
  { key: 'verified', label: 'Verified', icon: BadgeCheck, tone: 'text-green-600 bg-green-500/10', filters: { status: 'verified' } },
  { key: 'pending', label: 'Pending ID', icon: Clock, tone: 'text-amber-600 bg-amber-500/10', filters: { status: 'pending' } },
  { key: 'guildLeaders', label: 'Guild Leaders', icon: Crown, tone: 'text-amber-700 bg-amber-500/10', filters: { role: 'guild_leader' } },
  { key: 'suspended', label: 'Suspended', icon: Ban, tone: 'text-destructive bg-destructive/10', filters: { status: 'suspended' } },
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

  // Admins are managed on the Team page; nobody can suspend themselves.
  const canSuspend = (user: UserRow) => user.role !== 'admin' && user.id !== me?.id;

  const actionButtons = (user: UserRow) => ({
    verify: user.verification_status !== 'approved',
    suspend: canSuspend(user) && user.is_active,
    reactivate: canSuspend(user) && !user.is_active,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          {stats && (
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.total} users · {stats.pending} awaiting ID review
              {stats.suspended > 0 ? ` · ${stats.suspended} suspended` : ''}
            </p>
          )}
        </div>

        {/* Stat cards (click to filter) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, tone, filters: cardFilters }, i) => {
            const active = sameFilters(filters, cardFilters);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilters(cardFilters)}
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                className={`animate-in fade-in slide-in-from-bottom-2 duration-300 text-left bg-card rounded-2xl border p-4 shadow-elevation-1 transition-smooth hover:border-primary/50 ${
                  active ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 text-2xl font-bold text-foreground">{stats ? stats[key] : '–'}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </button>
            );
          })}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            />
          </div>
          <Select
            value={filters.role ?? 'all'}
            onValueChange={(value) => setFilters((f) => ({ ...f, role: value === 'all' ? undefined : (value as UserRole) }))}
          >
            <SelectTrigger className="md:w-44 !h-auto py-3 bg-card">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="traveler">Traveler</SelectItem>
              <SelectItem value="guild_leader">Guild Leader</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, status: value === 'all' ? undefined : (value as UserStatusFilter) }))
            }
          >
            <SelectTrigger className="md:w-44 !h-auto py-3 bg-card">
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
        </div>

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
                <tr className="border-b border-border bg-secondary">
                  <SortableTh label="User" sortKey="display_name" sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Email" sortKey="email" sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Role" sortKey="role" sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Status" sortKey="verification_status" sort={userSort.sort} onSort={userSort.toggle} />
                  <SortableTh label="Joined" sortKey="created_at" sort={userSort.sort} onSort={userSort.toggle} />
                  <th className="px-6 py-4 text-right text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className={isLoading && users.length > 0 ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-destructive">
                      Failed to load users: {loadError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No users match these filters
                    </td>
                  </tr>
                ) : (
                  shownUsers.map((user) => {
                    const actions = actionButtons(user);
                    return (
                      <tr
                        key={user.id}
                        onClick={() => void openDetail(user)}
                        className={`border-b border-border hover:bg-secondary/50 transition-smooth cursor-pointer ${
                          user.is_active ? '' : 'opacity-60'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {user.display_name}
                                {user.id === me?.id ? (
                                  <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                                ) : null}
                              </div>
                              {user.city && (
                                <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3 shrink-0" /> {user.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground truncate" title={user.email ?? undefined}>{user.email ?? '—'}</td>
                        <td className="px-6 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <VerificationBadge status={user.verification_status} />
                            {!user.is_active && <SuspendedPill />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {joinedFormat.format(new Date(user.created_at))}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                              {(actions.suspend || actions.reactivate) && <DropdownMenuSeparator />}
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
              <SheetHeader className="items-center text-center pt-8">
                <UserAvatar user={shownDetailUser} size="lg" />
                <SheetTitle className="text-xl mt-2">{shownDetailUser.display_name}</SheetTitle>
                <SheetDescription>{shownDetailUser.email ?? 'No email'}</SheetDescription>
                <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                  <RoleBadge role={shownDetailUser.role} />
                  <VerificationBadge status={shownDetailUser.verification_status} />
                  {!shownDetailUser.is_active && <SuspendedPill />}
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
                        <dd className="font-medium text-foreground text-right">{detail.phone ?? '—'}</dd>
                      </div>
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
                  if (!actions.verify && !actions.suspend && !actions.reactivate) return null;
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
