import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function AdminReports() {
  const [searchTerm, setSearchTerm] = useState('');

  const reports = [
    { id: 1, reporter: 'John Doe', reportedUser: 'Jane Smith', reason: 'Inappropriate behavior', date: '2026-02-14', status: 'pending', severity: 'high' },
    { id: 2, reporter: 'Mike Johnson', reportedUser: 'Tom Brown', reason: 'No-show on trip', date: '2026-02-13', status: 'resolved', severity: 'medium' },
    { id: 3, reporter: 'Sarah Williams', reportedUser: 'Alex Lee', reason: 'Fake profile', date: '2026-02-12', status: 'investigating', severity: 'high' },
    { id: 4, reporter: 'David Chen', reportedUser: 'Emma Wilson', reason: 'Rude comments', date: '2026-02-11', status: 'pending', severity: 'low' },
  ];

  const filteredReports = reports.filter(report =>
    report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'investigating': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-secondary text-foreground rounded-lg font-medium border border-border hover:bg-secondary/80 transition-smooth">
              Export
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports by reporter, user, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reporter</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Severity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{report.reporter}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.reportedUser}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.reason}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-secondary rounded-lg transition-smooth" title="Approve">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                        <button className="p-2 hover:bg-secondary rounded-lg transition-smooth" title="Investigate">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        </button>
                        <button className="p-2 hover:bg-secondary rounded-lg transition-smooth" title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
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
