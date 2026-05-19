import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Filter, Clock, User, AlertCircle } from 'lucide-react';

/**
 * Admin Audit Log - Compliance & Monitoring
 * 
 * Admin can view:
 * - Staff action logs
 * - Dispute resolution history
 * - Flagged content/users over time
 * - Moderation metrics
 */
export default function AdminAudit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const auditLogs = [
    { id: 1, staff: 'Sarah Johnson', action: 'Suspended user #456', target: 'User Account', severity: 'high', timestamp: '2024-03-22 14:32:15' },
    { id: 2, staff: 'Mike Chen', action: 'Rejected vehicle listing', target: 'Vehicle #789', severity: 'medium', timestamp: '2024-03-22 13:45:22' },
    { id: 3, staff: 'Lisa Rodriguez', action: 'Approved vehicle', target: 'Vehicle #1023', severity: 'low', timestamp: '2024-03-22 13:12:08' },
    { id: 4, staff: 'Sarah Johnson', action: 'Resolved dispute', target: 'Trip #456', severity: 'medium', timestamp: '2024-03-22 12:28:45' },
    { id: 5, staff: 'Mike Chen', action: 'Marked report as reviewed', target: 'Report #234', severity: 'low', timestamp: '2024-03-22 11:15:33' },
    { id: 6, staff: 'Lisa Rodriguez', action: 'Flagged user for review', target: 'User #892', severity: 'high', timestamp: '2024-03-22 10:42:19' },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.severity === filterType;
    return matchesSearch && matchesFilter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-orange-500/10 text-orange-600';
      case 'low':
        return 'bg-green-500/10 text-green-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
            <p className="text-sm text-muted-foreground mt-2">Track all staff actions and system changes</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by staff or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-foreground"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Staff Member</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Target</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Severity</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">{log.staff}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{log.target}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Actions (Today)</p>
              <p className="text-3xl font-bold text-foreground">342</p>
              <p className="text-xs text-green-600 mt-2">↑ 12% from yesterday</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <p className="text-sm text-muted-foreground mb-2">High Severity Actions</p>
              <p className="text-3xl font-bold text-destructive">8</p>
              <p className="text-xs text-muted-foreground mt-2">Requiring attention</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Most Active Staff</p>
              <p className="text-lg font-bold text-foreground">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground mt-2">89 actions this week</p>
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}
