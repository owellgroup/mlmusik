import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, api } from '@/lib/api';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    queue: [],
    currentIndex: 0,
    isShuffled: false,
    repeatMode: 'off',
  });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playSong = useCallback(async (song: Song, queue?: Song[]) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Ensure we have a valid file path
    if (!song.filePath) {
      console.error('Song file path is missing:', song);
      return;
    }

    // Load the audio source
    audio.src = song.filePath;
    
    // Add error handler
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      console.error('Failed to load audio from:', song.filePath);
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('error', handleError);
    
    try {
      // Load the audio first
      await audio.load();
      // Then play
      await audio.play();
      
      setState(prev => ({
        ...prev,
        currentSong: song,
        isPlaying: true,
        queue: queue || [song],
        currentIndex: queue ? queue.findIndex(s => s.id === song.id) : 0,
      }));

      // Track play
      api.playSong(song.id).catch(console.error);
      
      // Remove error handler after successful load
      audio.removeEventListener('error', handleError);
    } catch (error) {
      console.error('Error playing song:', error);
      console.error('Song file path:', song.filePath);
      audio.removeEventListener('error', handleError);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentSong) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying, state.currentSong]);

  const playNext = useCallback(() => {
    if (state.queue.length === 0) return;

    let nextIndex: number;
    if (state.isShuffled) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      nextIndex = (state.currentIndex + 1) % state.queue.length;
    }

    if (nextIndex === 0 && state.repeatMode === 'off' && !state.isShuffled) {
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    const nextSong = state.queue[nextIndex];
    if (nextSong) {
      playSong(nextSong, state.queue);
    }
  }, [state.queue, state.currentIndex, state.isShuffled, state.repeatMode, playSong]);

  const playPrevious = useCallback(() => {
    if (state.queue.length === 0) return;

    // If more than 3 seconds into the song, restart it
    if (state.currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const prevIndex = state.currentIndex === 0 
      ? state.queue.length - 1 
      : state.currentIndex - 1;

    const prevSong = state.queue[prevIndex];
    if (prevSong) {
      playSong(prevSong, state.queue);
    }
  }, [state.queue, state.currentIndex, state.currentTime, playSong]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    setState(prev => ({ ...prev, volume }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState(prev => ({
      ...prev,
      repeatMode: prev.repeatMode === 'off' ? 'all' : prev.repeatMode === 'all' ? 'one' : 'off',
    }));
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, song] }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({ ...prev, queue: [], currentIndex: 0 }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
