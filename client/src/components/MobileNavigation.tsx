import React from 'react';
import { Home, Heart, MessageCircle, Map, User, Car } from 'lucide-react';
import { Link } from 'wouter';
import { useCurrentPage } from '@/hooks/useCurrentPage';

export default function MobileNavigation() {
  const currentPage = useCurrentPage();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'match', label: 'Match', icon: Heart, path: '/match' },
    { id: 'carpooling', label: 'Carpool', icon: Car, path: '/carpooling' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat' },
    { id: 'map', label: 'Map', icon: Map, path: '/map' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevation-2 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Link key={item.id} href={item.path} asChild>
              <button
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-smooth border-0 bg-transparent text-center cursor-pointer ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
