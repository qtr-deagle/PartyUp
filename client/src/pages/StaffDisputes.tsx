import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Staff User Reports - Review Community-Reported Users
 * 
 * Staff can:
 * - Review user-submitted reports
 * - Investigate reported user profiles
 * - Issue warnings or suspensions
 * - Mark reports as resolved
 */
export default function StaffDisputes() {
  const [searchTerm, setSearchTerm] = useState('');

  const reports = [
    { id: 1, reporter: 'Jane Smith', reported: 'John Doe', reason: 'Inappropriate behavior', time: '1 hour ago' },
    { id: 2, reporter: 'Sarah Wilson', reported: 'Mike Johnson', reason: 'Safety violation', time: '3 hours ago' },
    { id: 3, reporter: 'Tom Brown', reported: 'Lisa Chen', reason: 'Policy breach', time: '5 hours ago' },
  ];

  const filteredReports = reports.filter(report =>
    report.reported.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Reports</h1>
          <p className="text-sm text-muted-foreground mt-2">Review community-reported users and take moderation action</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by reporter or reported user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* User Reports Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reporter</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{report.reporter}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.reported}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.reason}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{report.time}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20 transition-colors">
                        Review
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors">
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
