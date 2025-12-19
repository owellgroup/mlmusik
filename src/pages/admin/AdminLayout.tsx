import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Music, Disc3, Users, BarChart3, LogOut, 
  Home, Menu, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import logo from '@/assets/logo.png';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Music, label: 'Songs', path: '/admin/songs' },
  { icon: Disc3, label: 'Albums', path: '/admin/albums' },
  { icon: Users, label: 'Admins', path: '/admin/admins' },
  { icon: BarChart3, label: 'Statistics', path: '/admin/statistics' },
];

export default function AdminLayout() {
  const { isAuthenticated, isLoading, logout, admin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <Link to="/admin/dashboard" className="flex items-center gap-3">
                <img src={logo} alt="ytnAfrica" className="h-8 w-auto" />
                {sidebarOpen && <span className="font-bold text-lg">Admin</span>}
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-sidebar-foreground"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent group",
                    isActive ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  )} />
                  {sidebarOpen && (
                    <span className={cn(
                      "font-medium transition-colors",
                      isActive ? "text-foreground" : "group-hover:text-foreground"
                    )}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-all"
            >
              <Home className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Back to Site</span>}
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{admin?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {admin?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
