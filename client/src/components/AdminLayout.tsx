import React, { useState } from 'react';
import { LayoutDashboard, Users, Plane, AlertCircle, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [hovered, setHovered] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'trips', label: 'Trips', icon: Plane, path: '/admin/trips' },
    { id: 'reports', label: 'Reports', icon: AlertCircle, path: '/admin/reports' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isExpanded = hovered;

  return (
    <div className="flex h-screen bg-background">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border shadow-elevation-2 flex flex-col transition-all duration-300 z-50 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
              P
            </div>

            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold text-primary">PartyUp</h1>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-hidden">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.path} asChild>
                <button className="w-full flex items-center gap-3 px-5.5 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-2 overflow-hidden">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {isExpanded && <span className="text-sm whitespace-nowrap">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <Link href="/profile" asChild>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50">
              <Settings className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="text-sm whitespace-nowrap">Settings</span>}
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden ml-20">
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
