import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mic, Square, RotateCcw, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MAX_RECORDING_TIME = 600; // 10 minutes in seconds
const SEEK_TIME = 10; // 10 seconds for skip forward/backward

interface AudioRecorderProps {
    onSave: (data: {
        id: string;
        title: string;
        description: string;
        audio: Blob;
        duration: string;
    }) => void;
}

const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recordingTimerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                setShowForm(true);
            };

            mediaRecorderRef.current.start();
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
            alert("Failed to start recording. Please check your microphone permissions.");
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
        setAudioBlob(null);
        setShowForm(false);
        setTitle('');
        setDescription('');
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.src = '';
        }
    };

    const handleSave = () => {
        if (!audioBlob) return;

        const id = uuidv4();
        onSave({
            id,
            title: title.trim() || 'Recording 1',
            description: description.trim(),
            audio: audioBlob,
            duration: formatTime(Math.ceil(duration))
        });

        resetRecording();
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
        }
    };

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.addEventListener('loadedmetadata', () => {
                    setDuration(audioRef.current?.duration || 0);
                });
                audioRef.current.addEventListener('timeupdate', () => {
                    setCurrentTime(audioRef.current?.currentTime || 0);
                });
                audioRef.current.addEventListener('ended', () => {
                    setIsPlaying(false);
                });
            }
            return () => URL.revokeObjectURL(url);
        }
    }, [audioBlob]);

    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    if (showForm && audioBlob) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                    <div className="text-center text-4xl font-mono">
                        {formatTime(Math.floor(currentTime))}/{formatTime(Math.ceil(duration))}
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSeek(-SEEK_TIME)}
                        >
                            <SkipBack className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePlayPause}
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSeek(SEEK_TIME)}
                        >
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        placeholder="Recording 1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="flex justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={resetRecording}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="text-4xl font-mono">
                {formatTime(recordingTime)}
            </div>
            <div className="flex gap-4">
                {!isRecording ? (
                    <Button
                        size="icon"
                        className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                        onClick={startRecording}
                    >
                        <Mic className="h-8 w-8 text-white" />
                    </Button>
                ) : (
                    <>
                        <Button
                            size="icon"
                            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                            onClick={stopRecording}
                        >
                            <Square className="h-8 w-8 text-white" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-16 w-16 rounded-full"
                            onClick={resetRecording}
                        >
                            <RotateCcw className="h-8 w-8" />
                        </Button>
                    </>
                )}
            </div>
            <audio ref={audioRef} style={{ display: 'none' }} />
        </div>
    );
};

export default AudioRecorder;