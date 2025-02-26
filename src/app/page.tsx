"use client"
import AudioRecorder from "@/components/AudioRecorder";
import {RecorderMode} from "@/types";

export default function Home() {
    return (
        <div className="grid min-h-[90vh] place-items-center mx-auto py-8">
            <AudioRecorder mode={RecorderMode.RECORD}/>
        </div>
    );
}
