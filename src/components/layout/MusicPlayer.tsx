import { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Heart, Share2, Download,
  Maximize2
} from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatDuration, formatNumber, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function MusicPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    isShuffled,
    repeatMode,
    togglePlay, 
    playNext, 
    playPrevious, 
    seek, 
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-card/95 backdrop-blur-xl border-t border-border z-50">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a song to start playing</p>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = (clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleLike = async () => {
    try {
      await api.likeSong(currentSong.id);
      setIsLiked(!isLiked);
      toast({
        title: isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs',
      });
    } catch (error) {
      console.error('Error liking song:', error);
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.shareSong(currentSong.id);
      if (response.shareableUrl) {
        await navigator.clipboard.writeText(response.shareableUrl);
        toast({
          title: 'Link copied!',
          description: 'Share this song with your friends',
        });
      }
    } catch (error) {
      console.error('Error sharing song:', error);
    }
  };

  const handleDownload = () => {
    window.open(api.getDownloadUrl(currentSong.id), '_blank');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Progress Bar - Mobile (Top) */}
        <div 
          className="w-full h-1.5 bg-muted cursor-pointer touch-none active:h-2 transition-all"
          onClick={handleSeek}
          onTouchStart={handleSeek}
          onTouchMove={(e) => {
            e.preventDefault();
            handleSeek(e);
          }}
        >
          <div 
            className="h-full bg-foreground transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Mobile Content */}
        <div className="px-3 py-2">
          {/* Top Row: Song Info & Actions */}
          <div className="flex items-center justify-between gap-3 mb-2">
            {/* Song Info & Cover */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={currentSong.coverArtPath || '/placeholder.svg'}
                  alt={currentSong.title}
                  className={cn(
                    "w-14 h-14 rounded-md object-cover shadow-lg",
                    isPlaying && "animate-pulse"
                  )}
                />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1 bg-gradient-to-t from-black/50 to-transparent rounded-md">
                    <span className="w-0.5 h-2 bg-accent equalizer-bar" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-3 bg-accent equalizer-bar" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-1.5 bg-accent equalizer-bar" style={{ animationDelay: '300ms' }} />
                    <span className="w-0.5 h-3.5 bg-accent equalizer-bar" style={{ animationDelay: '450ms' }} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentSong.artist}
                  {currentSong.featuredArtists && ` ft. ${currentSong.featuredArtists}`}
                </p>
              </div>
            </div>

            {/* Share & Download Buttons - Mobile */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="icon"
                size="icon-lg"
                onClick={handleShare}
                className="touch-manipulation"
              >
                <Share2 className="w-6 h-6" />
              </Button>
              <Button
                variant="icon"
                size="icon-lg"
                onClick={handleDownload}
                className="touch-manipulation"
              >
                <Download className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Bottom Row: Play Controls - Mobile */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="icon"
              size="icon-sm"
              onClick={toggleShuffle}
              className={cn(isShuffled && "text-accent", "touch-manipulation")}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={playPrevious}
              className="touch-manipulation"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            <Button
              variant="player"
              size="icon-lg"
              onClick={togglePlay}
              className="touch-manipulation"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={playNext}
              className="touch-manipulation"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </Button>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={toggleRepeat}
              className={cn(repeatMode !== 'off' && "text-accent", "touch-manipulation")}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:block h-24">
      <div className="h-full grid grid-cols-3 items-center px-4 gap-4">
        {/* Left - Song Info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative group flex-shrink-0">
            <img
              src={currentSong.coverArtPath || '/placeholder.svg'}
              alt={currentSong.title}
              className={cn(
                "w-14 h-14 rounded-md object-cover shadow-lg transition-transform duration-300",
                isPlaying && "animate-pulse"
              )}
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1 bg-gradient-to-t from-black/50 to-transparent rounded-md">
                <span className="w-0.5 h-3 bg-accent equalizer-bar" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-4 bg-accent equalizer-bar" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2 bg-accent equalizer-bar" style={{ animationDelay: '300ms' }} />
                <span className="w-0.5 h-5 bg-accent equalizer-bar" style={{ animationDelay: '450ms' }} />
              </div>
            )}
          </div>
            <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate hover:underline cursor-pointer">
              {currentSong.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
              {currentSong.featuredArtists && ` ft. ${currentSong.featuredArtists}`}
            </p>
          </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Button
              variant="icon"
              size="icon-sm"
              onClick={handleLike}
              className={cn(isLiked && "text-accent")}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Center - Controls */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="icon"
              size="icon-sm"
              onClick={toggleShuffle}
              className={cn(isShuffled && "text-accent")}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={playPrevious}
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            <Button
              variant="player"
              size="icon"
              onClick={togglePlay}
              className="hover:scale-110 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </Button>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={playNext}
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </Button>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={toggleRepeat}
              className={cn(repeatMode !== 'off' && "text-accent")}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatDuration(currentTime)}
            </span>
            <div 
              className="flex-1 h-1 bg-muted rounded-full cursor-pointer group relative"
              onClick={handleSeek}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-foreground rounded-full group-hover:bg-accent transition-colors"
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right - Volume & Actions */}
          <div className="flex items-center justify-end gap-3 lg:gap-5">
            {/* Share & Download - Hidden on tablet, shown on desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="icon" size="icon-xl" onClick={handleShare}>
                <Share2 className="w-8 h-8" />
            </Button>
              <Button variant="icon" size="icon-xl" onClick={handleDownload}>
                <Download className="w-8 h-8" />
            </Button>
          </div>
          
            {/* Volume Control - Hidden on tablet, shown on desktop */}
            <div className="hidden lg:flex items-center gap-4 w-56">
              <Button variant="icon" size="icon-xl" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                  <VolumeX className="w-8 h-8" />
              ) : (
                  <Volume2 className="w-8 h-8" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
          </div>

            {/* Volume Button - Tablet only (mobile-friendly) */}
            <div className="lg:hidden">
              <Button variant="icon" size="icon-lg" onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
            </div>

            <Button variant="icon" size="icon-xl" className="hidden lg:block">
              <Maximize2 className="w-8 h-8" />
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
