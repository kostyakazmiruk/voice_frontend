// File: utils/api.ts

import {AudioRecording} from "@/types";

const API_URL = 'http://localhost:8000/api';

/**
 * Fetch a recording's metadata by ID
 */
export const fetchRecordingMetadata = async (id: string): Promise<any> => {
    const response = await fetch(`http://localhost:8000/api/recordings/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch recording metadata: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Fetch a recording's audio blob by ID
 */
export const fetchRecordingAudio = async (id: string): Promise<Blob> => {
    const response = await fetch(`http://localhost:8000/api/recordings/${id}/audio`);

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
    console.log('metadata', metadata)

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
    const response = await fetch(`${API_URL}/recordings/${id}`, {
        method: 'POST', // Use PATCH or PUT instead of POST
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: data.title,
            description: data.description
        })
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