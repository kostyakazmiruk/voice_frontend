"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecorderMode, AudioRecording } from '../../types';
import { formatTime } from '../../utils/format';
import { fetchCompleteRecording, updateRecording, saveRecording } from '../../utils/api';
import RecordingControls from "@/components/audio/RecordingControls";
import TimerDisplay from "@/components/audio/TimerDisplay";
import PlaybackControls from "@/components/audio/PlayBackControls";
import AudioForm from "@/components/audio/AudioForm";
import CopyUrlButton from "@/components/audio/CopyUrlButton";

// Constants for recording and playback
const MAX_RECORDING_TIME = 600; // 10 minutes in seconds
const SEEK_TIME = 10; // 10 seconds for skip forward/backward

interface AudioRecorderProps {
    mode?: RecorderMode;
    recordingId?: string;
    onComplete?: () => void;
}

const AudioRecorder = ({
                           mode = RecorderMode.RECORD,
                           recordingId,
                           onComplete
                       }: AudioRecorderProps) => {
    const router = useRouter();

    // State for recording and playback
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // State for form and UI
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(mode !== RecorderMode.RECORD);
    const [error, setError] = useState<string | null>(null);

    // Refs for media elements and timers
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recordingTimerRef = useRef<number | null>(null);

    // Effect to initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();

        const audio = audioRef.current;

        // Setup audio event listeners
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        // Cleanup listeners on unmount
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }

            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    // Effect to fetch recording if in EDIT or PLAY mode
    useEffect(() => {
        const loadRecording = async () => {
            if ((mode === RecorderMode.EDIT || mode === RecorderMode.PLAY) && recordingId) {
                try {
                    setIsLoading(true);
                    setError(null);

                    const recording = await fetchCompleteRecording(recordingId);

                    // Set state with fetched data
                    setTitle(recording.title);
                    setDescription(recording.description);
                    setAudioBlob(recording.audioBlob);
                    setAudioUrl(recording.audioUrl);
                    setDuration(recording.duration);

                    // Set audio element source
                    if (audioRef.current && recording.audioUrl) {
                        audioRef.current.src = recording.audioUrl;
                        audioRef.current.load();
                    }
                } catch (error) {
                    console.error("Error loading recording:", error);
                    setError("Failed to load recording. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadRecording();
    }, [mode, recordingId]);

    // Update audio element when blob changes
    useEffect(() => {
        if (audioBlob && audioRef.current) {
            // Revoke old URL if it exists
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            // Create and set new URL
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            audioRef.current.src = url;
            audioRef.current.load();

            // If we have a recording time, use it for duration
            if (recordingTime > 0) {
                setDuration(recordingTime);
            }
        }
    }, [audioBlob]);

    // Record functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingTimerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= MAX_RECORDING_TIME) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (error) {
            console.error("Recording error:", error);
            setError("Failed to start recording. Please check your microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);

            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    const resetRecording = () => {
        // Clean up the previous audio URL if it exists
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }

        // Reset all state
        setAudioBlob(null);
        setRecordingTime(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setTitle('');
        setDescription('');

        // Reset audio element
        if (audioRef.current) {
            audioRef.current.src = '';
            audioRef.current.load();
        }
    };

    // Playback functions
    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Reset to start if at end
            if (currentTime >= duration) {
                audioRef.current.currentTime = 0;
            }
            audioRef.current.play()
                .catch(err => console.error("Play error:", err));
        }
    };

    const handleSeek = (seconds: number) => {
        if (audioRef.current) {
            const newTime = Math.max(0, Math.min(
                audioRef.current.currentTime + seconds,
                duration
            ));
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Save and update functions
    const handleSave = async () => {
        if (!audioBlob) return;

        try {
            setIsLoading(true);
            setError(null);

            const recordingData: Partial<AudioRecording> = {
                title: title.trim() || 'Untitled Recording',
                description: description.trim(),
                duration: recordingTime,
                audioBlob
            };

            await saveRecording(recordingData);

            // Navigate back or call completion handler
            if (onComplete) {
                onComplete();
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error saving recording:", error);
            setError("Failed to save recording. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!recordingId) return;

        try {
            setIsLoading(true);
            setError(null);

            const updates: Partial<AudioRecording> = {
                title: title.trim() || 'Untitled Recording',
                description: description.trim()
            };

            // Include audio blob if we recorded new audio
            if (audioBlob && recordingTime > 0) {
                updates.audioBlob = audioBlob;
                updates.duration = recordingTime;
            }

            await updateRecording(recordingId, updates);

            // Navigate back or call completion handler
            if (onComplete) {
                onComplete();
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error updating recording:", error);
            setError("Failed to update recording. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        resetRecording();

        if (onComplete) {
            onComplete();
        } else {
            router.push('/');
        }
    };

    // Share URL for PLAY mode
    const getShareUrl = () => {
        if (typeof window !== 'undefined' && recordingId) {
            return `${window.location.origin}/play/${recordingId}`;
        }
        return '';
    };

    // Loading state
    if (isLoading) {
        return <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>;
    }

    // Error state
    if (error) {
        return <div className="text-red-500 p-4 text-center">
            {error}
            <button
                className="block mx-auto mt-4 px-4 py-2 bg-gray-200 rounded"
                onClick={() => router.push('/')}
            >
                Return Home
            </button>
        </div>;
    }

    // RECORD MODE
    if (mode === RecorderMode.RECORD) {
        if (audioBlob) {
            // After recording is complete, show form for saving
            return (
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <TimerDisplay
                            currentTime={currentTime}
                            totalTime={recordingTime}
                        />
                        <PlaybackControls
                            isPlaying={isPlaying}
                            onPlayPause={togglePlayPause}
                            onSkipBackward={() => handleSeek(-SEEK_TIME)}
                            onSkipForward={() => handleSeek(SEEK_TIME)}
                        />
                    </div>

                    <AudioForm
                        title={title}
                        description={description}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            );
        }

        // Recording view
        return (
            <div className="flex flex-col items-center gap-8">
                <div className="text-center text-4xl font-mono">
                    {formatTime(recordingTime)}
                </div>
                <div className="flex gap-4">
                    <RecordingControls
                        isRecording={isRecording}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                        onResetRecording={resetRecording}
                    />
                </div>
            </div>
        );
    }

    // EDIT MODE
    if (mode === RecorderMode.EDIT) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                    <TimerDisplay
                        currentTime={currentTime}
                        totalTime={duration}
                    />
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={togglePlayPause}
                        onSkipBackward={() => handleSeek(-SEEK_TIME)}
                        onSkipForward={() => handleSeek(SEEK_TIME)}
                    />
                </div>

                <AudioForm
                    title={title}
                    description={description}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onSave={handleUpdate}
                    onCancel={handleCancel}
                    saveLabel="Update"
                />
            </div>
        );
    }

    // PLAY MODE
    if (mode === RecorderMode.PLAY) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                    <TimerDisplay
                        currentTime={currentTime}
                        totalTime={duration}
                    />
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={togglePlayPause}
                        onSkipBackward={() => handleSeek(-SEEK_TIME)}
                        onSkipForward={() => handleSeek(SEEK_TIME)}
                    />
                </div>

                <div className="p-4 border rounded-md">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    <p className="mb-4">{description}</p>
                    <CopyUrlButton url={getShareUrl()} />
                </div>
            </div>
        );
    }

    return null;
};

export default AudioRecorder;