import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Disc3, Music, Search, Library, Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-xl border-b border-border z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-transparent hover:bg-secondary/50"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
        <Link to="/" className="flex items-center gap-2 ml-2 flex-1" onClick={() => setOpen(false)}>
          <img 
            src={logo} 
            alt="MLMusik" 
            className="h-12 md:h-16 w-auto" 
          />
        </Link>
      </div>

      {/* Navigation Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 max-w-[85vw] bg-sidebar p-0 text-sidebar-foreground overflow-y-auto [&>button]:hidden">
          <SheetHeader className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 group">
                <img 
                  src={logo} 
                  alt="MLMusik" 
                  className="h-16 md:h-20 w-auto transition-transform duration-300 group-hover:scale-105" 
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="text-sidebar-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Main Navigation */}
          <nav className="px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200',
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
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Divider */}
          <div className="mx-6 my-4 h-px bg-sidebar-border" />

          {/* Library Section */}
          <div className="flex-1 px-3 pb-6">
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
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200',
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
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

