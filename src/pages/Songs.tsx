import { useState, useEffect } from 'react';
import { Music, Search, Filter, LayoutGrid, List, Play } from 'lucide-react';
import { api, Song } from '@/lib/api';
import { SongCard } from '@/components/cards/SongCard';
import { SongRow } from '@/components/cards/SongRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

type SortOption = 'recent' | 'views' | 'likes';
type ViewMode = 'grid' | 'list';

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayer();

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

  const filteredSongs = songs
    .filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0], filteredSongs);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10">
              <Music className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">All Songs</h1>
              <p className="text-muted-foreground">{songs.length} tracks available</p>
            </div>
          </div>
          <Button variant="gold" onClick={handlePlayAll} className="gap-2" disabled={songs.length === 0}>
            <Play className="w-5 h-5 fill-current" />
            Play All
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 bg-card rounded-lg p-1">
            {(['recent', 'views', 'likes'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  sortBy === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-card rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Songs Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredSongs.map((song, index) => (
              <SongCard key={song.id} song={song} queue={filteredSongs} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-1 bg-card/50 rounded-lg p-2">
            {filteredSongs.map((song, index) => (
              <SongRow key={song.id} song={song} queue={filteredSongs} index={index} />
            ))}
          </div>
        )}

        {filteredSongs.length === 0 && (
          <div className="text-center py-16">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium">No songs found</p>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
