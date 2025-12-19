import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Upload, Music, Search } from 'lucide-react';
import { api, Song, formatNumber } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // File refs
  const coverArtRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    featuredArtists: '',
    producer: '',
  });
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

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

  const handleUpload = async () => {
    if (!formData.title || !formData.artist || !formData.producer || !audioFile || !coverArtFile) {
      toast({ title: "Please fill all required fields (title, artist, producer, cover art, and MP3 file)", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('artist', formData.artist);
      uploadData.append('featuredArtists', formData.featuredArtists || '');
      uploadData.append('producer', formData.producer);
      uploadData.append('mp3File', audioFile);
      uploadData.append('coverArt', coverArtFile);

      const result = await api.uploadSong(uploadData);
      if (result.success) {
        toast({ title: "Song uploaded successfully" });
        setIsUploadOpen(false);
        resetForm();
        fetchSongs();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error uploading song";
      toast({ title: errorMessage, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSong(id);
      setSongs(songs.filter(s => s.id !== id));
      toast({ title: "Song deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting song", variant: "destructive" });
    }
  };

  const handleEdit = (song: Song) => {
    setSelectedSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      featuredArtists: song.featuredArtists || '',
      producer: song.producer,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedSong) return;
    try {
      await api.updateSong(selectedSong.id, formData);
      setSongs(songs.map(s => s.id === selectedSong.id ? { ...s, ...formData } : s));
      setIsEditOpen(false);
      toast({ title: "Song updated successfully" });
    } catch (error) {
      toast({ title: "Error updating song", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', artist: '', featuredArtists: '', producer: '' });
    setCoverArtFile(null);
    setAudioFile(null);
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Songs</h1>
          <p className="text-muted-foreground">{songs.length} total tracks</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2">
              <Plus className="w-5 h-5" />
              Upload Song
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload New Song</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input 
                  placeholder="Song title" 
                  className="bg-card"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Artist *</label>
                  <Input 
                    placeholder="Main artist" 
                    className="bg-card"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Featured Artists</label>
                  <Input 
                    placeholder="Optional" 
                    className="bg-card"
                    value={formData.featuredArtists}
                    onChange={(e) => setFormData({ ...formData, featuredArtists: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Producer *</label>
                <Input 
                  placeholder="Producer name" 
                  className="bg-card"
                  value={formData.producer}
                  onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cover Art *</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={coverArtRef}
                    className="hidden"
                    onChange={(e) => setCoverArtFile(e.target.files?.[0] || null)}
                  />
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => coverArtRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {coverArtFile ? coverArtFile.name : 'Click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground">3000x3000 JPG/PNG</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">MP3 File *</label>
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    ref={audioFileRef}
                    className="hidden"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => audioFileRef.current?.click()}
                  >
                    <Music className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {audioFile ? audioFile.name : 'Click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground">MP3 format</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="gold" 
                className="w-full" 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Song'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Songs Table */}
      <Card className="glass border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 font-medium text-muted-foreground">Song</th>
                  <th className="p-4 font-medium text-muted-foreground">Artist</th>
                  <th className="p-4 font-medium text-muted-foreground">Views</th>
                  <th className="p-4 font-medium text-muted-foreground">Likes</th>
                  <th className="p-4 font-medium text-muted-foreground">Downloads</th>
                  <th className="p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((song, index) => (
                  <tr 
                    key={song.id} 
                    className={cn(
                      "border-b border-border/50 hover:bg-surface-hover transition-colors",
                      "opacity-0 animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={song.coverArtPath || '/placeholder.svg'}
                          alt={song.title}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {song.featuredArtists && `ft. ${song.featuredArtists}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{song.artist}</td>
                    <td className="p-4">{formatNumber(song.views)}</td>
                    <td className="p-4">{formatNumber(song.likes)}</td>
                    <td className="p-4">{formatNumber(song.downloads)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(song)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Song</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{song.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(song.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSongs.length === 0 && (
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No songs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Artist</label>
              <Input
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Artists</label>
              <Input
                value={formData.featuredArtists}
                onChange={(e) => setFormData({ ...formData, featuredArtists: e.target.value })}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Producer</label>
              <Input
                value={formData.producer}
                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                className="bg-card"
              />
            </div>
            <Button variant="gold" className="w-full" onClick={handleUpdate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
