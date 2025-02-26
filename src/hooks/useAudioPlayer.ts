// File: hooks/useAudioPlayer.ts
import { useState, useRef, useEffect } from 'react';

const SEEK_TIME = 10; // 10 seconds for skip forward/backward

export const useAudioPlayer = (audioBlob: Blob | null, recordingDuration: number) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(recordingDuration);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize or update audio element when blob changes
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();

            // Setup event listeners
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                }
            });

            audioRef.current.addEventListener('loadedmetadata', () => {
                if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                }
            });

            audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
            });

            audioRef.current.addEventListener('play', () => {
                setIsPlaying(true);
            });

            audioRef.current.addEventListener('pause', () => {
                setIsPlaying(false);
            });
        }

        // Update source when blob changes
        if (audioBlob) {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();
            }
        }

        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioBlob]);

    // Update duration from prop when available
    useEffect(() => {
        if (recordingDuration > 0) {
            setDuration(recordingDuration);
        }
    }, [recordingDuration]);

    const play = () => {
        if (audioRef.current) {
            if (currentTime >= duration) {
                audioRef.current.currentTime = 0;
            }
            audioRef.current.play()
                .catch(err => console.error("Play error:", err));
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const seek = (seconds: number) => {
        if (audioRef.current) {
            const newTime = Math.max(0, Math.min(
                audioRef.current.currentTime + seconds,
                duration
            ));
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const seekTo = (seconds: number) => {
        if (audioRef.current) {
            const newTime = Math.max(0, Math.min(seconds, duration));
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Clean up
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, []);

    return {
        audioRef,
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        togglePlayPause,
        seek,
        seekTo
    };
};