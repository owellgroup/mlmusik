import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Clock, Disc3, ChevronRight, Music2 } from 'lucide-react';
import { api, Song, Album, formatNumber } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { SongCard } from '@/components/cards/SongCard';
import { AlbumCard } from '@/components/cards/AlbumCard';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsData, albumsData] = await Promise.all([
          api.getSongs(),
          api.getAlbums(),
        ]);
        setSongs(songsData);
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredSong = songs[0];
  const trendingSongs = [...songs].sort((a, b) => b.views - a.views).slice(0, 6);
  const recentSongs = [...songs].slice(0, 6);

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
      <section className="relative min-h-[400px] md:h-[500px] overflow-hidden gradient-hero pt-20 md:pt-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative h-full flex items-center px-4 md:px-8 py-8 md:py-0">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/20 text-primary border border-primary/30 fade-in stagger-1">
                <Music2 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">Discover African Music</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient inline-block slide-up stagger-2" style={{ opacity: 1 }}>Welcome</span>
                <br />
                <span className="text-foreground inline-block slide-up stagger-3" style={{ opacity: 1 }}>to the Vibe</span>
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-lg slide-up stagger-4">
                Stream the music, feel the rhythm, and enjoy every beat.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <Button 
                  variant="gold" 
                  size="lg"
                  className="md:size-xl gap-2 md:gap-3 w-full sm:w-auto"
                  onClick={() => featuredSong && playSong(featuredSong, songs)}
                  disabled={!featuredSong}
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  Play Featured
                </Button>
                <Link to="/songs" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="md:size-xl w-full sm:w-auto">
                    Browse All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Featured Album Art */}
            {featuredSong && (
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
                  <img
                    src={featuredSong.coverArtPath || '/placeholder.svg'}
                    alt={featuredSong.title}
                    className="relative w-80 h-80 rounded-2xl object-cover shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-card rounded-xl shadow-xl flex items-center justify-center animate-bounce-subtle">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{formatNumber(featuredSong.views)}</p>
                      <p className="text-xs text-muted-foreground">Plays</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-3 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingSongs.length > 0 && (
        <section className="px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Trending Now</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Most played this week</p>
                </div>
              </div>
              <Link to="/songs" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {trendingSongs.map((song, index) => (
                <SongCard key={song.id} song={song} queue={songs} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Albums Section */}
      {albums.length > 0 && (
        <section className="px-4 md:px-8 py-8 md:py-12 bg-gradient-to-b from-transparent to-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Disc3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Featured Albums</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Curated collections for you</p>
                </div>
              </div>
              <Link to="/albums" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {albums.map((album, index) => (
                <AlbumCard key={album.id} album={album} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      {recentSongs.length > 0 && (
        <section className="px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Recently Added</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Fresh tracks just for you</p>
                </div>
              </div>
              <Link to="/songs" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {recentSongs.map((song, index) => (
                <SongCard key={song.id} song={song} queue={songs} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {songs.length === 0 && albums.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <Music2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No music available</h2>
          <p className="text-muted-foreground">Check back later for new content</p>
        </div>
      )}
    </div>
  );
}
