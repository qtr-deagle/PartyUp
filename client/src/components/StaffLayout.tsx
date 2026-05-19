import React, { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, CheckSquare, Car, Plane, LogOut, Moon, Sun } from 'lucide-react';
import { Link } from 'wouter';
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
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const staffNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    { id: 'disputes', label: 'User Reports', icon: CheckSquare, path: '/staff/disputes' },
    { id: 'vehicles', label: 'Verify Vehicles', icon: Car, path: '/staff/vehicles' },
    { id: 'trips', label: 'Trip Monitor', icon: Plane, path: '/staff/trips' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSidebarItemClick = (event: React.MouseEvent) => {
    const clickPos = { x: event.clientX, y: event.clientY };
    lastMousePos.current = clickPos;
    staffLastClickPos = clickPos;
    staffSuppressHoverUntilMove = true;
    setSuppressHover(true);
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

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const rect = sidebar.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isInside && !allowHoverExpand) {
        setAllowHoverExpand(true);
      }
      setHovered(isInside);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [allowHoverExpand, suppressHover]);

  const isExpanded = hovered;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside
        ref={sidebarRef}
        onMouseEnter={() => {
          if (!suppressHover && allowHoverExpand) {
            setHovered(true);
          }
        }}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-20'
        } shadow-elevation-2 z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-border">
          <Link href="/staff/dashboard">
            <a className="text-2xl font-bold text-primary hover:opacity-80">
              {isExpanded ? 'Staff' : 'S'}
            </a>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 p-4">
          {staffNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.path}>
                <a
                  onClick={handleSidebarItemClick}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {isExpanded && <span className="text-sm font-medium">Theme</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'} overflow-y-auto`}>
        {children}
      </main>
    </div>
  );
}
