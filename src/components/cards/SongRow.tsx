import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { Song, formatNumber, formatDuration } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SongRowProps {
  song: Song;
  queue?: Song[];
  index: number;
  showCover?: boolean;
}

export function SongRow({ song, queue, index, showCover = true }: SongRowProps) {
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
        "group grid items-center gap-4 px-4 py-2 rounded-md transition-all duration-200",
        "hover:bg-surface-hover cursor-pointer",
        isCurrentSong && "bg-surface/50"
      )}
      style={{ 
        gridTemplateColumns: showCover 
          ? '16px 48px 1fr 120px 80px 48px' 
          : '16px 1fr 120px 80px 48px' 
      }}
      onDoubleClick={handlePlay}
    >
      {/* Track Number / Play Button */}
      <div className="flex items-center justify-center">
        <span className={cn(
          "text-sm text-muted-foreground group-hover:hidden",
          isCurrentSong && "text-accent"
        )}>
          {song.trackNumber || index + 1}
        </span>
        <button 
          onClick={handlePlay}
          className="hidden group-hover:flex items-center justify-center"
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
        </button>
      </div>

      {/* Cover Art */}
      {showCover && (
        <div className="relative">
          <img
            src={song.coverArtPath || '/placeholder.svg'}
            alt={song.title}
            className="w-12 h-12 rounded object-cover"
          />
          {isCurrentSong && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <div className="flex items-end gap-0.5">
                <span className="w-0.5 h-2 bg-accent equalizer-bar" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3 bg-accent equalizer-bar" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2 bg-accent equalizer-bar" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Title & Artist */}
      <div className="min-w-0">
        <p className={cn(
          "font-medium truncate transition-colors",
          isCurrentSong ? "text-accent" : "text-foreground group-hover:text-accent"
        )}>
          {song.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
          {song.featuredArtists && <span> ft. {song.featuredArtists}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Play className="w-3 h-3" />
          {formatNumber(song.views)}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {formatNumber(song.likes)}
        </span>
      </div>

      {/* Duration (placeholder) */}
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>3:45</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="icon" size="icon-sm">
          <Heart className="w-4 h-4" />
        </Button>
        <Button variant="icon" size="icon-sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
