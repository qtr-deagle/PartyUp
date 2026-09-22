import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Edit2, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { listStaff, promoteToStaff, updateStaffMember, type StaffRow, type StaffRole } from '@/lib/adminStaff';

/**
 * Admin Staff Management
 *
 * Admin can:
 * - View all staff/admin accounts (profiles with role='staff'|'admin')
 * - Promote an existing PartyUp account to staff/admin by email
 * - Edit a staff member's role and active status
 * - Revoke staff access (sets role back to 'traveler' -- does not delete the account)
 */
export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState<{ email: string; role: StaffRole }>({ email: '', role: 'staff' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);
  const [editRole, setEditRole] = useState<StaffRole>('staff');
  const [editActive, setEditActive] = useState(true);
  const [revokingStaff, setRevokingStaff] = useState<StaffRow | null>(null);

  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    const { data } = await listStaff();
    setStaff(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [staff, searchTerm]
  );

  const handleAddStaff = async () => {
    if (!newStaff.email.trim()) {
      toast.error('Enter an email address');
      return;
    }
    setIsSubmitting(true);
    const { error } = await promoteToStaff(newStaff.email, newStaff.role);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${newStaff.email} is now ${newStaff.role}`);
    setNewStaff({ email: '', role: 'staff' });
    setShowAddStaffForm(false);
    await loadStaff();
  };

  const openEdit = (member: StaffRow) => {
    setEditingStaff(member);
    setEditRole(member.role);
    setEditActive(member.is_active);
  };

  const handleSaveEdit = async () => {
    if (!editingStaff) return;
    setIsSubmitting(true);
    const { error } = await updateStaffMember(editingStaff.id, { role: editRole, isActive: editActive });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Updated ${editingStaff.display_name}`);
    setEditingStaff(null);
    await loadStaff();
  };

  const handleRevoke = async () => {
    if (!revokingStaff) return;
    setIsSubmitting(true);
    const { error } = await updateStaffMember(revokingStaff.id, { role: 'traveler' });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Revoked staff access for ${revokingStaff.display_name}`);
    setRevokingStaff(null);
    await loadStaff();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your moderation and verification team</p>
          </div>
          <button
            onClick={() => setShowAddStaffForm(!showAddStaffForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
          >
            <Plus className="w-5 h-5" />
            Add Staff
          </button>
        </div>

        {/* Add Staff Form */}
        {showAddStaffForm && (
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Promote an Existing Account</h3>
            <p className="text-xs text-muted-foreground mb-4">
              They must already have a PartyUp account. Enter their email to promote them to staff or admin.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as StaffRole })}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleAddStaff}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
                >
                  Promote Account
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Staff Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Resolved</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No staff or admin accounts found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{member.display_name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-primary/20 text-primary">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.is_active
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {member.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{member.resolved_count}</td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => openEdit(member)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                          title="Edit staff"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRevokingStaff(member)}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                          title="Revoke staff access"
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
        </div>
      </div>

      {/* Edit Staff Modal */}
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
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as StaffRole)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:shadow-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {revokingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Revoke Staff Access</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                This sets <span className="font-medium text-foreground">{revokingStaff.display_name}</span>'s role back to traveler.
                Their account and history are kept -- they just lose staff/admin access.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRevokingStaff(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={isSubmitting}
                  className="flex-1 bg-destructive text-white py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:bg-destructive/90"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
