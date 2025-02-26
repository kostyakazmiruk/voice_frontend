"use client"
import {useParams, useRouter} from 'next/navigation';
import AudioRecorder from "@/components/audio/AudioRecorder";
import {RecorderMode} from "@/types";

export default function PlayPage() {
    const params = useParams();
    const { id } = params;

    if (!id) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <AudioRecorder mode={RecorderMode.PLAY}
                           recordingId={id}/>
        </div>
    );
}