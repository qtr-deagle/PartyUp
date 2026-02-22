import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  Heart,
  MessageCircle,
  Map,
  User,
  Settings,
  LogOut,
  Car,
  MapPin,
  Moon,
  Sun,
  Bell,
} from 'lucide-react';
import { Link } from 'wouter';
import { useCurrentPage } from '@/hooks/useCurrentPage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationSheet from './NotificationSheet';
import type { Notification } from './NotificationSheet';

let desktopSuppressHoverUntilMove = false;
let desktopLastClickPos: { x: number; y: number } | null = null;

interface DesktopSidebarProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export default function DesktopSidebar({
  notifications,
  unreadCount,  
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
}: DesktopSidebarProps) {
  const [hovered, setHovered] = useState(false);
  const [allowHoverExpand, setAllowHoverExpand] = useState(false);
  const [suppressHover, setSuppressHover] = useState(
    desktopSuppressHoverUntilMove
  );
  const lastMousePos = useRef<{ x: number; y: number } | null>(
    desktopLastClickPos
  );
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const currentPage = useCurrentPage();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNotificationSheetClick = (notification: Notification) => {
    setNotificationOpen(false);
    onNotificationClick(notification);
  };

  const handleNotificationSheetChange = (open: boolean) => {
    setNotificationOpen(open);
    if (!open) {
      // When closing notification sheet, suppress hover until mouse moves
      const currentPos = { x: 0, y: 0 };
      if (typeof window !== 'undefined') {
        // Get current mouse position if available
        currentPos.x = window.event ? (window.event as MouseEvent).clientX : 0;
        currentPos.y = window.event ? (window.event as MouseEvent).clientY : 0;
      }
      lastMousePos.current = currentPos;
      desktopLastClickPos = currentPos;
      desktopSuppressHoverUntilMove = true;
      setSuppressHover(true);
      setHovered(false);
    }
  };

  // Sidebar stays open if NOT home
  const isExpanded = hovered;
  

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'match', label: 'Find Buddy', icon: Heart, path: '/match' },
    { id: 'carpooling', label: 'Carpooling', icon: Car, path: '/carpooling' },
    { id: 'map', label: 'Map', icon: Map, path: '/map' },
    { id: 'chat', label: 'Messages', icon: MessageCircle, path: '/chat' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'trusted', label: 'Trusted Circle', icon: MapPin, path: '/trusted-circle' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSidebarItemClick = (event: React.MouseEvent) => {
    const clickPos = { x: event.clientX, y: event.clientY };
    lastMousePos.current = clickPos;
    desktopLastClickPos = clickPos;
    desktopSuppressHoverUntilMove = true;
    setSuppressHover(true);
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
      desktopSuppressHoverUntilMove = false;
      lastMousePos.current = { x: event.clientX, y: event.clientY };

      const sidebar = sidebarRef.current;
      if (!sidebar) {
        return;
      }

      const rect = sidebar.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isInside) {
        if (!allowHoverExpand) {
          setAllowHoverExpand(true);
        }
        setHovered(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [allowHoverExpand, suppressHover]);

  return (
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
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border shadow-elevation-2 flex-col transition-all duration-300 z-50 overflow-hidden ${
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
              <p className="text-xs text-muted-foreground whitespace-nowrap">Travel Buddy</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;

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

        {/* Notifications */}
        <button
          onClick={(event) => {
            handleSidebarItemClick(event);
            setHovered(false);
            setNotificationOpen(true);
          }}
          className="w-full flex items-center gap-3 px-5.5 py-3 rounded-lg transition-smooth border-0 text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent relative"
        >
          <Bell className="w-5 h-5 shrink-0" />
          {unreadCount > 0 && (
            <span className="absolute top-2 left-5 w-2 h-2 bg-destructive rounded-full" />
          )}
          {isExpanded && (
            <div className="flex items-center justify-between flex-1">
              <span className="text-sm whitespace-nowrap">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          )}
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2 overflow-hidden">
        <button
          onClick={(event) => {
            handleSidebarItemClick(event);
            toggleTheme?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          {isExpanded && <span className="text-sm whitespace-nowrap">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
        </button>

        <Link href="/profile" asChild>
          <button
            onClick={handleSidebarItemClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 bg-transparent text-left cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-sm whitespace-nowrap">Settings</span>}
          </button>
        </Link>

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

      {/* Notification Sheet */}
      <NotificationSheet
        open={notificationOpen}
        onOpenChange={handleNotificationSheetChange}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onClearAll={onClearAll}
        onNotificationClick={handleNotificationSheetClick}
      />
    </aside>
  );
}
