// API Configuration and Services

const API_BASE_URL = 'https://api.owellserver.ggff.net/api';

// Types
export interface Admin {
  id: number;
  email: string;
  password?: string;
  createdAt: string;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  coverArtPath: string;
  totalViews: number;
  totalDownloads: number;
  createdAt: string;
  songs: Song[];
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  featuredArtists: string | null;
  producer: string;
  trackNumber: number | null;
  filePath: string;
  coverArtPath: string;
  views: number;
  likes: number;
  dislikes: number;
  downloads: number;
  shares: number;
  album: Album | null;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  admin?: Admin;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  song?: Song;
  shareableUrl?: string;
}

// Helper to convert file paths to full URLs
export function convertToUrl(filePath: string): string {
  if (!filePath) return '';
  const cleanPath = filePath.replace(/^\.\//, '');
  return `${API_BASE_URL}/${cleanPath}`;
}

// Format numbers (1.2K, 1.5M)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format duration (seconds to mm:ss)
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// API Service Class
class ApiService {
  private baseUrl = API_BASE_URL;

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Admin APIs
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdmins(): Promise<Admin[]> {
    return this.request<Admin[]>('/admin');
  }

  async createAdmin(email: string, password: string): Promise<Admin> {
    return this.request<Admin>('/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  }

  async updateAdmin(id: number, email: string, password: string): Promise<Admin> {
    return this.request<Admin>(`/admin/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  }

  async deleteAdmin(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/admin/${id}`, { method: 'DELETE' });
  }

  // Album APIs
  async getAlbums(): Promise<Album[]> {
    const albums = await this.request<Album[]>('/albums');
    return albums.map(album => ({
      ...album,
      coverArtPath: convertToUrl(album.coverArtPath),
      songs: album.songs?.map(song => ({
        ...song,
        coverArtPath: convertToUrl(song.coverArtPath),
        filePath: convertToUrl(song.filePath),
      })) || [],
    }));
  }

  async getAlbum(id: number): Promise<Album> {
    const album = await this.request<Album>(`/albums/${id}`);
    return {
      ...album,
      coverArtPath: convertToUrl(album.coverArtPath),
      songs: album.songs?.map(song => ({
        ...song,
        coverArtPath: convertToUrl(song.coverArtPath),
        filePath: convertToUrl(song.filePath),
      })) || [],
    };
  }

  async uploadAlbum(formData: FormData): Promise<{ success: boolean; album?: Album; message?: string }> {
    const response = await fetch(`${this.baseUrl}/albums/upload`, {
      method: 'POST',
      body: formData,
    });
    
    // Handle response - if status is 201, album was created successfully
    if (response.status === 201) {
      try {
        const data = await response.json();
        if (data.success && data.album) {
          // Convert URLs in the returned album
          data.album = {
            ...data.album,
            coverArtPath: convertToUrl(data.album.coverArtPath),
            songs: data.album.songs?.map((song: Song) => ({
              ...song,
              coverArtPath: convertToUrl(song.coverArtPath),
              filePath: convertToUrl(song.filePath),
            })) || [],
          };
        }
        return data;
      } catch (parseError) {
        // If JSON parsing fails but status is 201, album was created successfully
        // Return success so UI can refresh the list
        console.warn('Response parsing failed, but album was created (status 201)', parseError);
        return { success: true, message: 'Album uploaded successfully' };
      }
    }
    
    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  }

  async updateAlbum(id: number, title: string, artist: string): Promise<Album> {
    return this.request<Album>(`/albums/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, artist }),
    });
  }

  async deleteAlbum(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/albums/${id}`, { method: 'DELETE' });
  }

  // Song APIs
  async getSongs(): Promise<Song[]> {
    const songs = await this.request<Song[]>('/songs');
    return songs.map(song => ({
      ...song,
      coverArtPath: convertToUrl(song.coverArtPath),
      filePath: convertToUrl(song.filePath),
    }));
  }

  async getSong(id: number): Promise<Song> {
    const song = await this.request<Song>(`/songs/${id}`);
    return {
      ...song,
      coverArtPath: convertToUrl(song.coverArtPath),
      filePath: convertToUrl(song.filePath),
    };
  }

  async getSongsByAlbum(albumId: number): Promise<Song[]> {
    const songs = await this.request<Song[]>(`/songs/album/${albumId}`);
    return songs.map(song => ({
      ...song,
      coverArtPath: convertToUrl(song.coverArtPath),
      filePath: convertToUrl(song.filePath),
    }));
  }

  async uploadSong(formData: FormData): Promise<{ success: boolean; song?: Song; message?: string }> {
    const response = await fetch(`${this.baseUrl}/songs/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    // Convert URLs in the returned song
    if (data.song) {
      data.song = {
        ...data.song,
        coverArtPath: convertToUrl(data.song.coverArtPath),
        filePath: convertToUrl(data.song.filePath),
      };
    }
    return data;
  }

  async updateSong(id: number, data: Partial<Song>): Promise<Song> {
    return this.request<Song>(`/songs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async deleteSong(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/songs/${id}`, { method: 'DELETE' });
  }

  async playSong(id: number): Promise<ActionResponse> {
    return this.request<ActionResponse>(`/songs/${id}/play`, { method: 'POST' });
  }

  async likeSong(id: number): Promise<ActionResponse> {
    return this.request<ActionResponse>(`/songs/${id}/like`, { method: 'POST' });
  }

  async dislikeSong(id: number): Promise<ActionResponse> {
    return this.request<ActionResponse>(`/songs/${id}/dislike`, { method: 'POST' });
  }

  async shareSong(id: number): Promise<ActionResponse> {
    return this.request<ActionResponse>(`/songs/${id}/share`, { method: 'POST' });
  }

  getDownloadUrl(id: number): string {
    return `${this.baseUrl}/songs/${id}/download`;
  }
}

export const api = new ApiService();
