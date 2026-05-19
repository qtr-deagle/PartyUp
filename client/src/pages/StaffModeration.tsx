import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Staff Moderation - Reports Queue
 * 
 * Staff can:
 * - Review pending user reports
 * - Take action on violations
 * - Add notes and justifications
 */
export default function StaffModeration() {
  const [searchTerm, setSearchTerm] = useState('');

  const reports = [
    { id: 1, user: 'Jane Smith', reason: 'Inappropriate behavior', status: 'pending', time: '2 hours ago' },
    { id: 2, user: 'Mike Johnson', reason: 'Safety concern - violated trust', status: 'pending', time: '4 hours ago' },
    { id: 3, user: 'Sarah Williams', reason: 'Payment fraud attempt', status: 'pending', time: '6 hours ago' },
  ];

  const filteredReports = reports.filter(report =>
    report.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Queue</h1>
          <p className="text-sm text-muted-foreground mt-2">Review and take action on user reports</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">{report.user}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.reason}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.time}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Approve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors" title="Reject">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
