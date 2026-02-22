import React, { useState } from 'react';
import { Home, Compass, MessageCircle, Car, MoreVertical } from 'lucide-react';
import { Link } from 'wouter';
import { useCurrentPage } from '@/hooks/useCurrentPage';
import MoreMenu from '@/components/MoreMenu';

export default function MobileNavigation() {
  const currentPage = useCurrentPage();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'match', label: 'Discover', icon: Compass, path: '/match' },
    { id: 'carpooling', label: 'Carpool', icon: Car, path: '/carpooling' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around relative backdrop-blur-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link key={item.id} href={item.path} asChild>
                <button
                  className={`flex-1 flex flex-col items-center justify-center py-4 px-2 transition-all border-0 bg-transparent text-center cursor-pointer ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-2 transition-all border-0 bg-transparent text-center cursor-pointer ${
              showMoreMenu
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <MoreVertical className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Drawer */}
      <MoreMenu isOpen={showMoreMenu} onClose={() => setShowMoreMenu(false)} />
    </>
  );
}
