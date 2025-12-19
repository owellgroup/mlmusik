import { useState, useEffect } from 'react';
import { BarChart3, Download, Eye, Heart, Share2, ThumbsDown, Music } from 'lucide-react';
import { api, Song, formatNumber } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AdminStatistics() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await api.getSongs();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const totalViews = songs.reduce((acc, song) => acc + song.views, 0);
  const totalLikes = songs.reduce((acc, song) => acc + song.likes, 0);
  const totalDislikes = songs.reduce((acc, song) => acc + song.dislikes, 0);
  const totalDownloads = songs.reduce((acc, song) => acc + song.downloads, 0);
  const totalShares = songs.reduce((acc, song) => acc + song.shares, 0);

  const sortedByViews = [...songs].sort((a, b) => b.views - a.views);
  const sortedByLikes = [...songs].sort((a, b) => b.likes - a.likes);
  const sortedByDownloads = [...songs].sort((a, b) => b.downloads - a.downloads);

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
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Detailed analytics and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-500' },
          { label: 'Total Likes', value: totalLikes, icon: Heart, color: 'text-pink-500' },
          { label: 'Total Dislikes', value: totalDislikes, icon: ThumbsDown, color: 'text-red-500' },
          { label: 'Downloads', value: totalDownloads, icon: Download, color: 'text-green-500' },
          { label: 'Shares', value: totalShares, icon: Share2, color: 'text-purple-500' },
        ].map((stat, index) => (
          <Card 
            key={stat.label}
            className={cn("glass border-border/50 opacity-0 animate-fade-in")}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
              <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16">
          <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-medium">No statistics available</p>
          <p className="text-muted-foreground">Upload songs to see analytics</p>
        </div>
      ) : (
        <>
          {/* Detailed Stats Table */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Song Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="p-4 font-medium text-muted-foreground">Song</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Views</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Likes</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Dislikes</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Downloads</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Shares</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Like Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song, index) => {
                      const likeRatio = song.likes + song.dislikes > 0
                        ? ((song.likes / (song.likes + song.dislikes)) * 100).toFixed(1)
                        : '100';
                      
                      return (
                        <tr 
                          key={song.id}
                          className={cn(
                            "border-b border-border/50 hover:bg-surface-hover transition-colors",
                            "opacity-0 animate-fade-in"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={song.coverArtPath || '/placeholder.svg'}
                                alt={song.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium">{song.title}</p>
                                <p className="text-sm text-muted-foreground">{song.artist}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium">{formatNumber(song.views)}</td>
                          <td className="p-4 text-right">
                            <span className="text-green-500">{formatNumber(song.likes)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-red-500">{formatNumber(song.dislikes)}</span>
                          </td>
                          <td className="p-4 text-right">{formatNumber(song.downloads)}</td>
                          <td className="p-4 text-right">{formatNumber(song.shares)}</td>
                          <td className="p-4 text-right">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              parseFloat(likeRatio) >= 90 ? "bg-green-500/20 text-green-500" :
                              parseFloat(likeRatio) >= 70 ? "bg-yellow-500/20 text-yellow-500" :
                              "bg-red-500/20 text-red-500"
                            )}>
                              {likeRatio}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top by Views */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Most Viewed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedByViews.slice(0, 5).map((song, index) => (
                    <div key={song.id} className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-yellow-500 text-yellow-950" :
                        index === 1 ? "bg-gray-300 text-gray-800" :
                        index === 2 ? "bg-orange-400 text-orange-950" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.artist}</p>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(song.views)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top by Likes */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Most Liked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedByLikes.slice(0, 5).map((song, index) => (
                    <div key={song.id} className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-yellow-500 text-yellow-950" :
                        index === 1 ? "bg-gray-300 text-gray-800" :
                        index === 2 ? "bg-orange-400 text-orange-950" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.artist}</p>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(song.likes)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top by Downloads */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="w-5 h-5 text-green-500" />
                  Most Downloaded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedByDownloads.slice(0, 5).map((song, index) => (
                    <div key={song.id} className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-yellow-500 text-yellow-950" :
                        index === 1 ? "bg-gray-300 text-gray-800" :
                        index === 2 ? "bg-orange-400 text-orange-950" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.artist}</p>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(song.downloads)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
