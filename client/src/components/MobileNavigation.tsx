import React from 'react';
import { Home, Compass, MessageCircle, Map, Briefcase, X } from 'lucide-react';
import { Link } from 'wouter';

export default function MobileNavigation() {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'match', label: 'Discover', icon: Compass, path: '/discovery' },
    { id: 'travel', label: 'Travel', icon: Briefcase, path: '/my-trips' },
    { id: 'map', label: 'Map', icon: Map, path: '/map' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat' },
    { id: 'profile', label: 'Profile', icon: null, path: '/profile' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around relative backdrop-blur-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isProfile = item.id === 'profile';

            return (
              <Link key={item.id} href={item.path} asChild>
                <button
                  className={`flex-1 flex flex-col items-center justify-center py-4 px-2 transition-all border-0 bg-transparent text-center cursor-pointer text-muted-foreground hover:text-primary`}
                >
                  {isProfile ? (
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mb-1 border-current">
                    </div>
                  ) : (
                    Icon && <Icon className="w-5 h-5 mb-1" />
                  )}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
