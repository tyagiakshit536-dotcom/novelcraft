import { useEffect, useRef, useState, useCallback } from 'react';

// Background music player using HTML5 Audio with a royalty-free ambient track
const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3';

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC_URL);
      audio.loop = true;
      audio.volume = 0.3;
      audio.preload = 'auto';
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const toggle = useCallback(() => {
    const audio = getAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, getAudio]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Stop on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { isPlaying, toggle, stop };
}
