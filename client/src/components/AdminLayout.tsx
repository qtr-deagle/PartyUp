import React, { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Users, Plane, AlertCircle, UserCog, LogOut, Moon, Sun, Shield, Lock, DollarSign, Link2, MessageSquare, Siren, Trophy, Car, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import SosGlobalAlert from '@/components/sos/SosGlobalAlert';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import { useActiveSosAlerts } from '@/hooks/useSosRealtime';
import { roleLabel } from '@/lib/guilds';

let adminSuppressHoverUntilMove = false;
let adminLastClickPos: { x: number; y: number } | null = null;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [hovered, setHovered] = useState(false);
  const [allowHoverExpand, setAllowHoverExpand] = useState(false);
  const [suppressHover, setSuppressHover] = useState(
    adminSuppressHoverUntilMove
  );
  const lastMousePos = useRef<{ x: number; y: number } | null>(
    adminLastClickPos
  );
  const sidebarRef = useRef<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { alerts: activeSosAlerts, isLoading: isSosLoading } = useActiveSosAlerts();
  const isActive = (path: string) => location === path || location.startsWith(`${path}/`);

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'sos', label: 'SOS Center', icon: Siren, path: '/admin/sos' },
    { id: 'verification', label: 'ID Verification', icon: Shield, path: '/admin/verification' },
    { id: 'vehicles', label: 'Vehicles', icon: Car, path: '/admin/vehicles' },
    { id: 'staff', label: 'Guild Leaders', icon: Users, path: '/admin/staff' },
    { id: 'guilds', label: 'Guilds & Rewards', icon: Trophy, path: '/admin/guilds' },
    { id: 'users', label: 'Users', icon: Lock, path: '/admin/users' },
    { id: 'trips', label: 'Trips', icon: Plane, path: '/admin/trips' },
    { id: 'payment', label: 'Payments', icon: DollarSign, path: '/admin/payments' },
    { id: 'pairing', label: 'Pairing History', icon: Link2, path: '/admin/pairing' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    { id: 'reports', label: 'Reports', icon: AlertCircle, path: '/admin/reports' },
    { id: 'audit', label: 'Audit Log', icon: Lock, path: '/admin/audit' },
    { id: 'team', label: 'Admins', icon: ShieldCheck, path: '/admin/team' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSidebarItemClick = (event: React.MouseEvent) => {
    const clickPos = { x: event.clientX, y: event.clientY };
    lastMousePos.current = clickPos;
    adminLastClickPos = clickPos;
    adminSuppressHoverUntilMove = true;
    setSuppressHover(true);
    setHovered(false);
  };

  useEffect(() => {
    if (!suppressHover) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const last = lastMousePos.current;
      const moved =
        !last || event.clientX !== last.x || event.clientY !== last.y;

      if (!moved) {
        return;
      }

      setSuppressHover(false);
      adminSuppressHoverUntilMove = false;
      lastMousePos.current = { x: event.clientX, y: event.clientY };
      setAllowHoverExpand(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [suppressHover]);

  const isExpanded = hovered;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside
        ref={sidebarRef}
        onMouseEnter={() => {
          if (!suppressHover) {
            if (allowHoverExpand) {
              setHovered(true);
            }
          }
        }}
        onMouseMove={() => {
          if (!allowHoverExpand) {
            setAllowHoverExpand(true);
          }
          if (!suppressHover) {
            setHovered(true);
          }
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border shadow-elevation-2 flex flex-col transition-all duration-300 z-50 overflow-hidden ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
              P
            </div>

            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold text-primary">PartyUp</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} href={item.path} asChild>
                <button
                  onClick={handleSidebarItemClick}
                  className={`w-full flex items-center gap-3 px-5.5 py-2.5 rounded-lg transition-smooth border-0 text-left cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <span className="relative shrink-0">
                    <Icon className={`w-5 h-5 ${item.id === 'sos' && activeSosAlerts.length > 0 && !active ? 'text-destructive' : ''}`} />
                    {item.id === 'sos' && activeSosAlerts.length > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-4 text-center animate-pulse">
                        {activeSosAlerts.length}
                      </span>
                    )}
                  </span>
                  {isExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1 overflow-hidden shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-3 py-1.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm leading-none shrink-0">
                {user.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              {isExpanded && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{roleLabel(user.role)}</p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => toggleTheme?.()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {isExpanded && <span className="text-sm whitespace-nowrap">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <Link href="/admin/account" asChild>
            <button
              onClick={handleSidebarItemClick}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth border-0 text-left cursor-pointer ${
                isActive('/admin/account') ? 'bg-primary text-primary-foreground font-semibold shadow-md' : 'bg-transparent text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <UserCog className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="text-sm whitespace-nowrap">Account</span>}
            </button>
          </Link>
          <button
            onClick={(event) => {
              handleSidebarItemClick(event);
              setConfirmLogoutOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-sm whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden ml-20 min-h-0">
        <SosGlobalAlert alerts={activeSosAlerts} isLoading={isSosLoading} basePath="/admin" />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-8">
          {children}
        </main>
      </div>

      <LogoutConfirmDialog
        open={confirmLogoutOpen}
        onOpenChange={setConfirmLogoutOpen}
        onConfirm={handleLogout}
      />
    </div>
  );
}
