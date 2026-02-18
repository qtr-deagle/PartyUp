import React, { useState } from 'react';
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
} from 'lucide-react';
import { Link } from 'wouter';
import { useCurrentPage } from '@/hooks/useCurrentPage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function DesktopSidebar() {
  const [hovered, setHovered] = useState(false);

  const currentPage = useCurrentPage();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Sidebar stays open if NOT home
  const isExpanded = hovered;
  

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'match', label: 'Find Buddy', icon: Heart, path: '/match' },
    { id: 'carpooling', label: 'Carpooling', icon: Car, path: '/carpooling' },
    { id: 'chat', label: 'Messages', icon: MessageCircle, path: '/chat' },
    { id: 'map', label: 'Map', icon: Map, path: '/map' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'trusted', label: 'Trusted Circle', icon: MapPin, path: '/trusted-circle' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border shadow-elevation-2 flex-col transition-all duration-300 z-50 overflow-hidden ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
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
                className={`w-full flex items-center gap-3 px-5.5 py-3 rounded-lg transition-smooth border-0 text-left cursor-pointer ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
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
  );
}
