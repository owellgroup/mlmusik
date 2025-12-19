import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Clock, Download, Share2, Heart, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { api, Album, Song, formatNumber, formatDuration } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { toast } = useToast();

  const isCurrentAlbum = album?.songs.some(song => song.id === currentSong?.id) ?? false;
  const isPlayingAlbum = isCurrentAlbum && isPlaying;

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;
      try {
        const data = await api.getAlbum(parseInt(id));
        setAlbum(data);
      } catch (error) {
        console.error('Error fetching album:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (!album) return;
    if (isPlayingAlbum) {
      togglePlay();
    } else if (album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const handlePlaySong = (song: Song) => {
    if (!album) return;
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, album.songs);
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Album link copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Album not found</h2>
          <Link to="/albums" className="text-primary hover:underline">
            Back to Albums
          </Link>
        </div>
      </div>
    );
  }

  const totalDuration = album.songs.length * 210; // Approximate duration

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 h-[400px]"
          style={{
            background: `linear-gradient(180deg, hsl(285 45% 20%) 0%, hsl(var(--background)) 100%)`
          }}
        />

        <div className="relative px-8 pt-8 pb-6">
          {/* Back Button */}
          <Link 
            to="/albums" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Albums</span>
          </Link>

          {/* Album Info */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Album Cover */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <img
                src={album.coverArtPath || '/placeholder.svg'}
                alt={album.title}
                className="relative w-64 h-64 rounded-xl object-cover shadow-2xl"
              />
            </div>

            {/* Album Details */}
            <div className="flex-1 space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">Album</p>
              <h1 className="text-5xl md:text-7xl font-bold">{album.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-semibold text-foreground">{album.artist}</span>
                <span>•</span>
                <span>{new Date(album.createdAt).getFullYear()}</span>
                <span>•</span>
                <span>{album.songs.length} songs</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4 text-accent" />
                  {formatNumber(album.totalViews)} plays
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4 text-accent" />
                  {formatNumber(album.totalDownloads)} downloads
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button variant="gold" size="xl" onClick={handlePlayAlbum} className="gap-3" disabled={album.songs.length === 0}>
                  {isPlayingAlbum ? (
                    <>
                      <Pause className="w-6 h-6 fill-current" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-current" />
                      Play
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon-lg" onClick={handleShare}>
                  <Share2 className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="icon-lg">
                  <Heart className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="icon-lg">
                  <MoreHorizontal className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-8 py-6">
        <div className="max-w-5xl">
          {/* Header */}
          <div 
            className="grid items-center gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border mb-2"
            style={{ gridTemplateColumns: '16px 1fr 120px 80px' }}
          >
            <span>#</span>
            <span>Title</span>
            <span>Plays</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
            </span>
          </div>

          {/* Song Rows */}
          <div className="space-y-1">
            {album.songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isPlayingSong = isCurrentSong && isPlaying;

              return (
                <div
                  key={song.id}
                  className={cn(
                    "group grid items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
                    "hover:bg-surface-hover",
                    isCurrentSong && "bg-surface/50"
                  )}
                  style={{ gridTemplateColumns: '16px 1fr 120px 80px' }}
                  onDoubleClick={() => handlePlaySong(song)}
                >
                  {/* Track Number / Play */}
                  <div className="flex items-center justify-center">
                    <span className={cn(
                      "text-sm group-hover:hidden",
                      isCurrentSong ? "text-accent" : "text-muted-foreground"
                    )}>
                      {isPlayingSong ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-0.5 h-2 bg-accent equalizer-bar" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-3 bg-accent equalizer-bar" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-2 bg-accent equalizer-bar" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        song.trackNumber || index + 1
                      )}
                    </span>
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="hidden group-hover:flex items-center justify-center"
                    >
                      {isPlayingSong ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                  </div>

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

                  {/* Plays */}
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(song.views)}
                  </div>

                  {/* Duration & Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">3:30</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Button variant="icon" size="icon-sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {album.songs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No songs in this album</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
