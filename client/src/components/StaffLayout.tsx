import React, { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, CheckSquare, Car, Plane, LogOut, Moon, Sun, DollarSign, Link2, MessageSquare, Shield } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

let staffSuppressHoverUntilMove = false;
let staffLastClickPos: { x: number; y: number } | null = null;

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [hovered, setHovered] = useState(false);
  const [allowHoverExpand, setAllowHoverExpand] = useState(false);
  const [suppressHover, setSuppressHover] = useState(staffSuppressHoverUntilMove);
  const lastMousePos = useRef<{ x: number; y: number } | null>(staffLastClickPos);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const isActive = (path: string) => location === path || location.startsWith(`${path}/`);

  const staffNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    { id: 'verification', label: 'ID Verification', icon: Shield, path: '/staff/verification' },
    { id: 'disputes', label: 'User Reports', icon: CheckSquare, path: '/staff/disputes' },
    { id: 'vehicles', label: 'Verify Vehicles', icon: Car, path: '/staff/vehicles' },
    { id: 'trips', label: 'Trip Monitor', icon: Plane, path: '/staff/trips' },
    { id: 'payment', label: 'Payments', icon: DollarSign, path: '/staff/payments' },
    { id: 'pairing', label: 'Pairing History', icon: Link2, path: '/staff/pairing' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/staff/feedback' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSidebarItemClick = (event: React.MouseEvent) => {
    const clickPos = { x: event.clientX, y: event.clientY };
    lastMousePos.current = clickPos;
    staffLastClickPos = clickPos;
    staffSuppressHoverUntilMove = true;
    setSuppressHover(true);
    setHovered(false);
  };

  useEffect(() => {
    if (!suppressHover) return;

    const handleMouseMove = (event: MouseEvent) => {
      const last = lastMousePos.current;
      const moved = !last || event.clientX !== last.x || event.clientY !== last.y;
      if (!moved) return;

      setSuppressHover(false);
      staffSuppressHoverUntilMove = false;
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
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border shadow-elevation-2 flex flex-col transition-all duration-300 z-50 overflow-hidden ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
              P
            </div>

            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold text-primary">PartyUp</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Staff</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {staffNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} href={item.path} asChild>
                <button
                  onClick={handleSidebarItemClick}
                  className={`w-full flex items-center gap-3 px-5.5 py-3 rounded-lg transition-smooth border-0 text-left cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-2 overflow-hidden">
          {user && (
            <div className="flex items-center gap-3 px-2.5 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm leading-none shrink-0">
                {user.name?.charAt(0).toUpperCase() ?? 'S'}
              </div>
              {isExpanded && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => toggleTheme?.()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {isExpanded && <span className="text-sm whitespace-nowrap">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <button
            onClick={(event) => {
              handleSidebarItemClick(event);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-sm whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden ml-20 min-h-0">
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
