import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Music, Disc3, Play, Heart, Download, TrendingUp, Users, 
  BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { api, Song, Album, formatNumber } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  color: string;
  delay: number;
}

function StatCard({ title, value, icon: Icon, change, color, delay }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "glass hover-lift cursor-pointer opacity-0 animate-fade-in",
        "border-border/50"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-xl", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsData, albumsData] = await Promise.all([
          api.getSongs(),
          api.getAlbums(),
        ]);
        setSongs(songsData);
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalViews = songs.reduce((acc, song) => acc + song.views, 0);
  const totalLikes = songs.reduce((acc, song) => acc + song.likes, 0);
  const totalDownloads = songs.reduce((acc, song) => acc + song.downloads, 0);
  const totalSongs = songs.length;
  const totalAlbums = albums.length;

  const topSongs = [...songs].sort((a, b) => b.views - a.views).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Songs"
          value={totalSongs}
          icon={Music}
          change={12}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={0}
        />
        <StatCard
          title="Total Albums"
          value={totalAlbums}
          icon={Disc3}
          change={8}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={100}
        />
        <StatCard
          title="Total Plays"
          value={totalViews}
          icon={Play}
          change={24}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay={200}
        />
        <StatCard
          title="Total Likes"
          value={totalLikes}
          icon={Heart}
          change={18}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
          delay={300}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Downloads"
          value={totalDownloads}
          icon={Download}
          change={15}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          delay={400}
        />
        <StatCard
          title="Active Users"
          value="--"
          icon={Users}
          color="bg-gradient-to-br from-teal-500 to-teal-600"
          delay={500}
        />
        <StatCard
          title="Growth Rate"
          value="--"
          icon={TrendingUp}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          delay={600}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Songs */}
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Songs
            </CardTitle>
            <Link to="/admin/songs" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {topSongs.length > 0 ? (
              <div className="space-y-4">
                {topSongs.map((song, index) => (
                  <div key={song.id} className="flex items-center gap-4">
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-yellow-500 text-yellow-950" :
                      index === 1 ? "bg-gray-300 text-gray-800" :
                      index === 2 ? "bg-orange-400 text-orange-950" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(song.views)}</p>
                      <p className="text-xs text-muted-foreground">plays</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No songs available</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/songs"
                className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-center group"
              >
                <Music className="w-8 h-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium">Manage Songs</p>
                <p className="text-sm text-muted-foreground">{totalSongs} tracks</p>
              </Link>
              <Link
                to="/admin/albums"
                className="p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-center group"
              >
                <Disc3 className="w-8 h-8 mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium">Manage Albums</p>
                <p className="text-sm text-muted-foreground">{totalAlbums} albums</p>
              </Link>
              <Link
                to="/admin/admins"
                className="p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors text-center group"
              >
                <Users className="w-8 h-8 mx-auto text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium">Manage Admins</p>
                <p className="text-sm text-muted-foreground">User access</p>
              </Link>
              <Link
                to="/admin/statistics"
                className="p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-center group"
              >
                <BarChart3 className="w-8 h-8 mx-auto text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium">Statistics</p>
                <p className="text-sm text-muted-foreground">View analytics</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
