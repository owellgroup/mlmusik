import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";
import AdminLayout from "@/pages/admin/AdminLayout";

// Main Pages
import Index from "./pages/Index";
import Songs from "./pages/Songs";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Search from "./pages/Search";
import Library from "./pages/Library";
import LikedSongs from "./pages/LikedSongs";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSongs from "./pages/admin/AdminSongs";
import AdminAlbums from "./pages/admin/AdminAlbums";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminStatistics from "./pages/admin/AdminStatistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main Site Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/songs" element={<Songs />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/liked" element={<LikedSongs />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="songs" element={<AdminSongs />} />
                <Route path="albums" element={<AdminAlbums />} />
                <Route path="admins" element={<AdminAdmins />} />
                <Route path="statistics" element={<AdminStatistics />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
