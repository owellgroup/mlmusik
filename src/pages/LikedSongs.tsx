import { Heart, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api, Song } from '@/lib/api';
import { SongCard } from '@/components/cards/SongCard';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

export default function LikedSongs() {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // For now, fetch all songs and filter by likes (in a real app, this would be user-specific)
        const data = await api.getSongs();
        // Show top liked songs as "liked songs" placeholder
        const sortedByLikes = [...data].sort((a, b) => b.likes - a.likes).slice(0, 10);
        setLikedSongs(sortedByLikes);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-80 px-8 flex items-end pb-8"
        style={{
          background: 'linear-gradient(180deg, hsl(285 45% 30%) 0%, hsl(var(--background)) 100%)'
        }}
      >
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-2xl flex items-center justify-center">
            <Heart className="w-24 h-24 text-white fill-current" />
          </div>
          <div className="space-y-4 pb-2">
            <p className="text-sm font-medium uppercase">Playlist</p>
            <h1 className="text-6xl font-bold">Liked Songs</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{likedSongs.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {likedSongs.length > 0 ? (
          <>
            <div className="mb-6">
              <Button variant="gold" onClick={handlePlayAll} className="gap-2">
                <Music className="w-5 h-5" />
                Play All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {likedSongs.map((song, index) => (
                <SongCard key={song.id} song={song} queue={likedSongs} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Songs you like will appear here</h2>
            <p className="text-muted-foreground">Save songs by tapping the heart icon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
