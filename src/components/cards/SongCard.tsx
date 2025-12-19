import { Play, Pause, Heart } from 'lucide-react';
import { Song, formatNumber } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  queue?: Song[];
  index?: number;
}

export function SongCard({ song, queue, index = 0 }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <div 
      className={cn(
        "group relative bg-card rounded-lg p-4 transition-all duration-300",
        "hover:bg-surface-hover hover-lift cursor-pointer",
        "opacity-0 animate-fade-in",
        isCurrentSong && "ring-1 ring-primary/50"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Cover Art */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-lg">
        <img
          src={song.coverArtPath || '/placeholder.svg'}
          alt={song.title}
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
            onClick={handlePlay}
            className="shadow-xl"
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>
        </div>

        {/* Playing Indicator */}
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5 p-1 bg-black/60 rounded">
            <span className="w-1 h-3 bg-accent equalizer-bar" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-accent equalizer-bar" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-accent equalizer-bar" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
          {song.featuredArtists && <span className="text-xs"> ft. {song.featuredArtists}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Play className="w-3 h-3" />
          {formatNumber(song.views)}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {formatNumber(song.likes)}
        </span>
      </div>
    </div>
  );
}
