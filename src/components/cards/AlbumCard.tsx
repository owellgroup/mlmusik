import { Link } from 'react-router-dom';
import { Play, Disc3 } from 'lucide-react';
import { Album, formatNumber } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: Album;
  index?: number;
}

export function AlbumCard({ album, index = 0 }: AlbumCardProps) {
  const { playSong } = usePlayer();

  const handlePlayAlbum = (e: React.MouseEvent) => {
    e.preventDefault();
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  return (
    <Link 
      to={`/album/${album.id}`}
      className={cn(
        "group relative bg-card rounded-lg p-4 transition-all duration-300",
        "hover:bg-surface-hover hover-lift cursor-pointer",
        "opacity-0 animate-fade-in block"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Cover Art */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-lg">
        <img
          src={album.coverArtPath || '/placeholder.svg'}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Play Button Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-all duration-300"
        )}>
          <Button
            variant="gold"
            size="icon-lg"
            onClick={handlePlayAlbum}
            className="shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </Button>
        </div>

        {/* Album Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 rounded-full flex items-center gap-1">
          <Disc3 className="w-3 h-3 text-primary-foreground" />
          <span className="text-xs font-medium text-primary-foreground">
            {album.songs?.length || 0} tracks
          </span>
        </div>
      </div>

      {/* Album Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {album.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {album.artist}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Play className="w-3 h-3" />
          {formatNumber(album.totalViews)}
        </span>
      </div>
    </Link>
  );
}
