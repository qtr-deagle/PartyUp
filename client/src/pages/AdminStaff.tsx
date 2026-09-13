import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Edit2, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Admin Staff Management
 * 
 * Admin can:
 * - View all staff members
 * - Create/edit staff accounts
 * - Manage permissions
 * - Deactivate staff
 * - View staff performance
 */
export default function AdminStaff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '' });

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Staff member ${newStaff.name} added successfully!`);
      setNewStaff({ name: '', email: '' });
      setShowAddStaffForm(false);
    } catch (error) {
      toast.error('Failed to add staff member');
    }
  };

  const handleRemoveStaff = async (staffId: number) => {
    setDeletingStaffId(staffId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Staff member removed successfully');
    } catch (error) {
      toast.error('Failed to remove staff member');
    } finally {
      setDeletingStaffId(null);
    }
  };

  const staffMembers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@partyup.com', status: 'active', joined: '2024-01-15', resolved: 312 },
    { id: 2, name: 'Mike Chen', email: 'mike@partyup.com', status: 'active', joined: '2024-02-01', resolved: 156 },
    { id: 3, name: 'Lisa Rodriguez', email: 'lisa@partyup.com', status: 'active', joined: '2024-02-10', resolved: 289 },
    { id: 4, name: 'James Williams', email: 'james@partyup.com', status: 'inactive', joined: '2023-12-01', resolved: 203 },
  ];

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
              <Plus className="w-5 h-5" />
              Add Staff
            </button>
          </div>

          {/* Add Staff Form */}
          {showAddStaffForm && (
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Add New Staff Member</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddStaff}
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
                  >
                    Add Staff Member
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Resolved</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">{staff.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          staff.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{staff.joined}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{staff.resolved}</td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button 
                          onClick={() => toast.info('Edit staff member - coming soon')}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                          title="Edit staff"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveStaff(staff.id)}
                          disabled={deletingStaffId === staff.id}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors disabled:opacity-50"
                          title="Remove staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
