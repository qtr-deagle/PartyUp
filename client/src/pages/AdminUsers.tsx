import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, MoreVertical, Shield, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suspendingUserId, setSuspendingUserId] = useState<number | null>(null);

  const handleSuspendUser = async (userId: number) => {
    setSuspendingUserId(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('User suspended successfully');
    } catch (error) {
      toast.error('Failed to suspend user');
    } finally {
      setSuspendingUserId(null);
    }
  };

  const handleUnsuspendUser = async (userId: number) => {
    setSuspendingUserId(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('User unsuspended successfully');
    } catch (error) {
      toast.error('Failed to unsuspend user');
    } finally {
      setSuspendingUserId(null);
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success('User verified successfully');
    } catch (error) {
      toast.error('Failed to verify user');
    }
  }

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', verified: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', verified: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'suspended', verified: false },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', status: 'active', verified: true },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', status: 'inactive', verified: false },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Verified</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.verified ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!user.verified && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-smooth"
                            title="Verify user"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            disabled={suspendingUserId === user.id}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-smooth disabled:opacity-50"
                            title="Suspend user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : user.status === 'suspended' ? (
                          <button
                            onClick={() => handleUnsuspendUser(user.id)}
                            disabled={suspendingUserId === user.id}
                            className="p-2 hover:bg-green-500/10 text-green-600 rounded-lg transition-smooth disabled:opacity-50"
                            title="Unsuspend user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
