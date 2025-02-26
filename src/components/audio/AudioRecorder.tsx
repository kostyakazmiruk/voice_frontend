// File: components/AudioRecorder.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import TimerDisplay from './TimerDisplay';
import RecordingControls from './RecordingControls';
import AudioForm from './AudioForm';
import {AudioRecording, RecorderMode} from "@/types";
import {useAudioRecorder} from "@/hooks/useAudioRecorder";
import {useAudioPlayer} from "@/hooks/useAudioPlayer";
import {fetchRecording, formatTime, saveRecording, updateRecording} from "@/utils/format";
import PlaybackControls from "@/components/audio/PlayBackControls";
import CopyUrlButton from "@/components/audio/CopyUrlButton";

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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [currentMode, setCurrentMode] = useState<RecorderMode>(mode);
    const [isLoading, setIsLoading] = useState(mode !== RecorderMode.RECORD);

    // Use our custom hooks
    const {
        isRecording,
        recordingTime,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording
    } = useAudioRecorder();

    const {
        isPlaying,
        currentTime,
        duration,
        togglePlayPause,
        seek
    } = useAudioPlayer(audioBlob, recordingTime);

    // Fetch existing recording if in EDIT or PLAY mode
    useEffect(() => {
        const loadRecording = async () => {
            if ((mode === RecorderMode.EDIT || mode === RecorderMode.PLAY) && recordingId) {
                try {
                    setIsLoading(true);
                    const recording = await fetchRecording(recordingId);
                    setTitle(recording.title);
                    setDescription(recording.description);
                } catch (error) {
                    console.error("Error loading recording:", error);
                    router.push('/');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadRecording();
    }, [mode, recordingId, router]);

    // When recording is stopped, switch to SAVE mode
    useEffect(() => {
        if (audioBlob && currentMode === RecorderMode.RECORD) {
            setCurrentMode(RecorderMode.SAVE);
        }
    }, [audioBlob, currentMode]);

    const handleSave = async () => {
        if (!audioBlob) return;

        try {
            const recording: AudioRecording = {
                title: title.trim() || 'Recording 1',
                description: description.trim(),
                duration: recordingTime,
                audioBlob
            };

            await saveRecording(recording);

            if (onComplete) {
                onComplete();
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error saving recording:", error);
        }
    };

    const handleUpdate = async () => {
        if (!recordingId) return;

        try {
            const updates: Partial<AudioRecording> = {
                title: title.trim() || 'Recording 1',
                description: description.trim()
            };

            if (audioBlob) {
                updates.audioBlob = audioBlob;
                updates.duration = recordingTime || duration;
            }

            await updateRecording(recordingId, updates);

            if (onComplete) {
                onComplete();
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error updating recording:", error);
        }
    };

    const handleCancel = () => {
        resetRecording();

        if (currentMode === RecorderMode.SAVE) {
            setCurrentMode(RecorderMode.RECORD);
        } else if (onComplete) {
            onComplete();
        } else {
            router.push('/');
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading recording...</div>;
    }

    // RECORD mode (scenario 1)
    if (currentMode === RecorderMode.RECORD) {
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

    // SAVE mode (scenario 2)
    if (currentMode === RecorderMode.SAVE) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                    <TimerDisplay currentTime={currentTime} totalTime={recordingTime} />
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={togglePlayPause}
                        onSkipBackward={() => seek(-10)}
                        onSkipForward={() => seek(10)}
                    />
                </div>

                <AudioForm
                    title={title}
                    description={description}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    saveLabel="Save"
                />
            </div>
        );
    }

    // EDIT mode (scenario 3)
    if (currentMode === RecorderMode.EDIT) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                    <TimerDisplay currentTime={currentTime} totalTime={duration} />
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={togglePlayPause}
                        onSkipBackward={() => seek(-10)}
                        onSkipForward={() => seek(10)}
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

    // PLAY mode (scenario 4)
    if (currentMode === RecorderMode.PLAY) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                    <TimerDisplay currentTime={currentTime} totalTime={duration} />
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={togglePlayPause}
                        onSkipBackward={() => seek(-10)}
                        onSkipForward={() => seek(10)}
                    />
                </div>

                <div className="p-4 border rounded-md">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    <p className="mb-4">{description}</p>
                    <CopyUrlButton url={window.location.href} />
                </div>
            </div>
        );
    }

    return null;
};

export default AudioRecorder;