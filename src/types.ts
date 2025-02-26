export interface AudioRecording {
    id?: string;
    title: string;
    description: string;
    duration: number;
    audioBlob?: Blob;
    audioUrl?: string;
}

export enum RecorderMode {
    RECORD = 'record',
    EDIT = 'edit',
    SAVE = 'save',
    PLAY = 'play'
}