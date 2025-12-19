import { useState, useEffect } from 'react';
import { Disc3, Search, Filter } from 'lucide-react';
import { api, Album } from '@/lib/api';
import { AlbumCard } from '@/components/cards/AlbumCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await api.getAlbums();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Disc3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Albums</h1>
              <p className="text-muted-foreground">Browse all albums</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAlbums.map((album, index) => (
            <AlbumCard key={album.id} album={album} index={index} />
          ))}
        </div>

        {filteredAlbums.length === 0 && (
          <div className="text-center py-16">
            <Disc3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium">No albums found</p>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
