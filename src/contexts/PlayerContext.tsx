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
  const playSongRef = useRef<((song: Song, queue?: Song[]) => Promise<void>) | null>(null);
  const stateRef = useRef<PlayerState>({
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
  const [state, setState] = useState<PlayerState>(stateRef.current);

  // Sync stateRef with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    audioRef.current.preload = 'auto'; // Preload for faster playback
    audioRef.current.crossOrigin = 'anonymous'; // Enable CORS for streaming
    
    // Optimize for instant playback - set aggressive buffering
    if (audioRef.current) {
      // Don't wait for full file - start as soon as possible
      audioRef.current.load();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setState(prev => {
        const newState = { ...prev, currentTime: audio.currentTime };
        stateRef.current = newState;
        return newState;
      });
    };

    const handleLoadedMetadata = () => {
      setState(prev => {
        const newState = { ...prev, duration: audio.duration };
        stateRef.current = newState;
        return newState;
      });
    };

    const handleEnded = () => {
      const currentState = stateRef.current;
      if (currentState.repeatMode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      } else if (currentState.queue.length > 0) {
        let nextIndex: number;
        if (currentState.isShuffled) {
          nextIndex = Math.floor(Math.random() * currentState.queue.length);
        } else {
          nextIndex = (currentState.currentIndex + 1) % currentState.queue.length;
        }
        if (nextIndex === 0 && currentState.repeatMode === 'off' && !currentState.isShuffled) {
          setState(prev => {
            const newState = { ...prev, isPlaying: false };
            stateRef.current = newState;
            return newState;
          });
        } else if (currentState.queue[nextIndex] && playSongRef.current) {
          // playSong will update stateRef via setState
          playSongRef.current(currentState.queue[nextIndex], currentState.queue);
        }
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

    // If it's the same song, just toggle play/pause
    if (state.currentSong?.id === song.id) {
      if (state.isPlaying) {
        audio.pause();
        setState(prev => {
          const newState = { ...prev, isPlaying: false };
          stateRef.current = newState;
          return newState;
        });
      } else {
        // Play immediately without waiting
        const playPromise = audio.play();
        setState(prev => {
          const newState = { ...prev, isPlaying: true };
          stateRef.current = newState;
          return newState;
        });
        playPromise.catch(console.error);
      }
      return;
    }

    // Update state FIRST for instant UI feedback
    setState(prev => {
      const newState = {
        ...prev,
        currentSong: song,
        isPlaying: true,
        queue: queue || [song],
        currentIndex: queue ? queue.findIndex(s => s.id === song.id) : 0,
      };
      stateRef.current = newState;
      return newState;
    });

    // Stop current playback immediately
    audio.pause();
    audio.currentTime = 0;
    
    // Add error handler
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      console.error('Failed to load audio from:', song.filePath);
      setState(prev => {
        const newState = { ...prev, isPlaying: false };
        stateRef.current = newState;
        return newState;
      });
      audio.removeEventListener('error', handleError);
    };

    audio.addEventListener('error', handleError);
    
    // Set source FIRST - this starts loading immediately
    audio.src = song.filePath;
    
    // Track play in background (don't wait)
    api.playSong(song.id).catch(console.error);
    
    // Aggressive playback attempt - try multiple times as data loads
    let playSuccess = false;
    
    const attemptPlay = () => {
      if (!playSuccess) {
        audio.play()
          .then(() => {
            playSuccess = true;
            // Success - clean up listeners
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', attemptPlay);
            audio.removeEventListener('loadeddata', attemptPlay);
            audio.removeEventListener('progress', attemptPlay);
            audio.removeEventListener('loadstart', attemptPlay);
          })
          .catch(() => {
            // Will retry on next event
          });
      }
    };
    
    // Listen for ALL events that indicate data is available - play ASAP
    audio.addEventListener('loadstart', attemptPlay, { once: false });
    audio.addEventListener('progress', attemptPlay, { once: false });
    audio.addEventListener('loadeddata', attemptPlay, { once: false });
    audio.addEventListener('canplay', attemptPlay, { once: false });
    
    // Try to play IMMEDIATELY - don't wait for anything
    audio.play()
      .then(() => {
        playSuccess = true;
        // Success - remove all listeners
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', attemptPlay);
        audio.removeEventListener('loadeddata', attemptPlay);
        audio.removeEventListener('progress', attemptPlay);
        audio.removeEventListener('loadstart', attemptPlay);
      })
      .catch(() => {
        // Expected - event listeners will handle retry
        // Will play as soon as any data is available
      });
  }, [state.currentSong, state.isPlaying]);

  // Update playSong ref whenever it changes
  useEffect(() => {
    playSongRef.current = playSong;
  }, [playSong]);

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
