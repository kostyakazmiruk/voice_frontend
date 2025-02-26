// File: utils/format.ts
export const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// File: utils/api.ts
import { v4 as uuidv4 } from 'uuid';
import { AudioRecording } from '../types';

const API_URL = 'http://localhost:8000/api';

export const saveRecording = async (recording: AudioRecording): Promise<AudioRecording> => {
    if (!recording.audioBlob) {
        throw new Error('No audio blob to save');
    }

    const id = recording.id || uuidv4();
    const formData = new FormData();

    formData.append('audio', recording.audioBlob, `${recording.title}.webm`);
    formData.append('name', recording.title);
    formData.append('description', recording.description);
    formData.append('duration', Math.ceil(recording.duration).toString());
    formData.append('publicId', id);

    const response = await fetch(`${API_URL}/recordings`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to save audio');
    }

    return await response.json();
};

export const updateRecording = async (id: string, recording: Partial<AudioRecording>): Promise<AudioRecording> => {
    const formData = new FormData();

    if (recording.title) formData.append('name', recording.title);
    if (recording.description) formData.append('description', recording.description);
    if (recording.audioBlob) {
        formData.append('audio', recording.audioBlob, `${recording.title || 'updated'}.webm`);
        formData.append('duration', Math.ceil(recording.duration || 0).toString());
    }

    const response = await fetch(`${API_URL}/recordings/${id}`, {
        method: 'PUT',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to update audio');
    }

    return await response.json();
};

export const fetchRecording = async (id: string): Promise<AudioRecording> => {
    const response = await fetch(`${API_URL}/recordings/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch recording');
    }

    const data = await response.json();

    // Fetch the actual audio blob
    const audioResponse = await fetch(`${API_URL}/recordings/${id}/audio`);
    if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file');
    }

    const audioBlob = await audioResponse.blob();

    return {
        id: data.id,
        title: data.name,
        description: data.description,
        duration: data.duration,
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob)
    };
};