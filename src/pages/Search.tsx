import { useState, useEffect } from 'react';
import { Search as SearchIcon, Music, Disc3, Mic2 } from 'lucide-react';
import { api, Song, Album } from '@/lib/api';
import { SongCard } from '@/components/cards/SongCard';
import { AlbumCard } from '@/components/cards/AlbumCard';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Afrobeats', color: 'bg-gradient-to-br from-orange-500 to-pink-500', icon: Music },
  { name: 'Amapiano', color: 'bg-gradient-to-br from-purple-500 to-blue-500', icon: Disc3 },
  { name: 'Highlife', color: 'bg-gradient-to-br from-green-500 to-teal-500', icon: Mic2 },
  { name: 'Afro-Pop', color: 'bg-gradient-to-br from-red-500 to-orange-500', icon: Music },
  { name: 'Gospel', color: 'bg-gradient-to-br from-yellow-500 to-amber-500', icon: Mic2 },
  { name: 'Hip-Hop', color: 'bg-gradient-to-br from-gray-700 to-gray-900', icon: Mic2 },
  { name: 'Dancehall', color: 'bg-gradient-to-br from-lime-500 to-green-500', icon: Disc3 },
  { name: 'Reggae', color: 'bg-gradient-to-br from-yellow-400 to-green-500', icon: Music },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsData, albumsData] = await Promise.all([
          api.getSongs(),
          api.getAlbums(),
        ]);
        setAllSongs(songsData);
        setAllAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.length < 2) {
        setSongs([]);
        setAlbums([]);
        return;
      }

      setIsSearching(true);
      
      const filteredSongs = allSongs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredAlbums = allAlbums.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSongs(filteredSongs);
      setAlbums(filteredAlbums);
      setIsSearching(false);
    };

    const debounce = setTimeout(searchContent, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, allSongs, allAlbums]);

  const hasResults = songs.length > 0 || albums.length > 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="relative max-w-2xl mb-12">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-14 text-lg bg-card border-border rounded-full focus:ring-2 focus:ring-primary"
          />
        </div>

        {searchQuery.length < 2 ? (
          <>
            {/* Browse Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Browse All</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    className={cn(
                      "relative h-48 rounded-xl overflow-hidden transition-all duration-300",
                      "hover:scale-105 hover:shadow-xl",
                      category.color,
                      "opacity-0 animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 flex flex-col items-start justify-end p-4">
                      <category.icon className="absolute top-4 right-4 w-16 h-16 text-white/20 rotate-12" />
                      <span className="text-2xl font-bold text-white">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Search Results */}
            {isSearching ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : hasResults ? (
              <div className="space-y-12">
                {songs.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Songs</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {songs.slice(0, 6).map((song, index) => (
                        <SongCard key={song.id} song={song} queue={songs} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {albums.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Albums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {albums.slice(0, 4).map((album, index) => (
                        <AlbumCard key={album.id} album={album} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl font-medium">No results found for "{searchQuery}"</p>
                <p className="text-muted-foreground">Try different keywords</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
