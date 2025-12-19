import { Link, useLocation } from 'react-router-dom';
import { Home, Disc3, Music, Search, Library, Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Your Library', path: '/library' },
];

const libraryItems = [
  { icon: Music, label: 'All Songs', path: '/songs' },
  { icon: Disc3, label: 'Albums', path: '/albums' },
  { icon: Heart, label: 'Liked Songs', path: '/liked' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-16 md:bottom-24 w-64 bg-sidebar flex flex-col z-40 transform -translate-x-full md:translate-x-0 transition-transform duration-300">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={logo} 
            alt="ytnAfrica" 
            className="h-16 md:h-20 w-auto transition-transform duration-300 group-hover:scale-105" 
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-sidebar-accent group',
                    isActive 
                      ? 'bg-sidebar-accent text-foreground' 
                      : 'text-sidebar-foreground'
                  )}
                >
                  <item.icon 
                    className={cn(
                      'w-6 h-6 transition-colors',
                      isActive ? 'text-primary' : 'group-hover:text-foreground'
                    )} 
                  />
                  <span className={cn(
                    'font-medium transition-colors',
                    isActive ? 'text-foreground' : 'group-hover:text-foreground'
                  )}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 h-px bg-sidebar-border" />

      {/* Library Section */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <span className="text-sm font-semibold text-sidebar-foreground">
            Your Library
          </span>
          <button className="p-1 rounded-full hover:bg-sidebar-accent transition-colors">
            <Plus className="w-5 h-5 text-sidebar-foreground hover:text-foreground" />
          </button>
        </div>

        <ul className="space-y-1">
          {libraryItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-sidebar-accent group',
                    isActive 
                      ? 'bg-sidebar-accent text-foreground' 
                      : 'text-sidebar-foreground'
                  )}
                >
                  <item.icon 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-accent' : 'group-hover:text-foreground'
                    )} 
                  />
                  <span className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'group-hover:text-foreground'
                  )}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

    </aside>
  );
}
