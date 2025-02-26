// File: utils/api.ts
import { AudioRecording } from '../types';

const API_URL = 'http://localhost:8000/api';

/**
 * Fetch a recording's metadata by ID
 */
export const fetchRecordingMetadata = async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/recordings/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch recording metadata: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Fetch a recording's audio blob by ID
 */
export const fetchRecordingAudio = async (id: string): Promise<Blob> => {
    const response = await fetch(`${API_URL}/recordings/${id}/audio`);

    if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    return await response.blob();
};

/**
 * Fetch both metadata and audio for a recording
 */
export const fetchCompleteRecording = async (id: string): Promise<AudioRecording> => {
    const [metadata, audioBlob] = await Promise.all([
        fetchRecordingMetadata(id),
        fetchRecordingAudio(id)
    ]);

    // Create an audio URL from the blob
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
        id: metadata.id || id,
        title: metadata.name || 'Untitled Recording',
        description: metadata.description || '',
        duration: metadata.duration || 0,
        audioBlob,
        audioUrl
    };
};

/**
 * Update an existing recording
 */
export const updateRecording = async (id: string, data: Partial<AudioRecording>): Promise<any> => {
    const formData = new FormData();

    if (data.title) formData.append('name', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.audioBlob) {
        formData.append('audio', data.audioBlob, `${data.title || 'recording'}.webm`);
        if (data.duration) formData.append('duration', Math.ceil(data.duration).toString());
    }

    const response = await fetch(`${API_URL}/recordings/${id}`, {
        method: 'POST', // Using POST as specified in your requirement
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to update recording: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Save a new recording
 */
export const saveRecording = async (data: Partial<AudioRecording>): Promise<any> => {
    if (!data.audioBlob) {
        throw new Error('No audio blob to save');
    }

    const formData = new FormData();

    formData.append('audio', data.audioBlob, `${data.title || 'recording'}.webm`);
    formData.append('name', data.title || 'Untitled Recording');
    formData.append('description', data.description || '');
    formData.append('duration', Math.ceil(data.duration || 0).toString());

    const response = await fetch(`${API_URL}/recordings`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to save recording: ${response.statusText}`);
    }

    return await response.json();
};