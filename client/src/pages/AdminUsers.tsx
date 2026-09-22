import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { listUsers, setUserVerificationStatus, type UserRow } from '@/lib/adminUsers';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async (search: string) => {
    setIsLoading(true);
    const { data, error } = await listUsers(search);
    if (error) {
      setLoadError(error.message);
      toast.error('Failed to load users');
    } else {
      setLoadError(null);
      setUsers(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => void loadUsers(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, loadUsers]);

  const handleVerifyUser = async (userId: string) => {
    setVerifyingUserId(userId);
    const { error } = await setUserVerificationStatus(userId, 'approved');
    setVerifyingUserId(null);
    if (error) {
      toast.error('Failed to verify user');
    } else {
      toast.success('User verified successfully');
      await loadUsers(searchTerm);
    }
  };

  // Suspend/unsuspend has no backing column on `profiles` yet -- there is no
  // account-status/ban schema anywhere in this codebase to wire this to, so
  // this action is intentionally left unimplemented rather than faking it.
  const handleSuspendUser = () => {
    toast.info('Suspending users is not available yet');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Verified</th>
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
                ) : loadError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-destructive">
                      Failed to load users: {loadError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold">{user.display_name?.charAt(0) ?? '?'}</span>
                          </div>
                          <span className="font-medium text-foreground">{user.display_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-secondary text-foreground">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.verification_status === 'approved' ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground capitalize">{user.verification_status ?? 'Not submitted'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.verification_status !== 'approved' && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              disabled={verifyingUserId === user.id}
                              className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-smooth disabled:opacity-50"
                              title="Verify user"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={handleSuspendUser}
                            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-smooth"
                            title="Suspend user (not available yet)"
                          >
                            <span className="sr-only">Suspend user</span>
                            &mdash;
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
