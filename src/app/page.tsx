"use client"
import {RecorderMode} from "@/types";
import AudioRecorder from "@/components/audio/AudioRecorder";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter()
    const onComplete = () => {
        router.push('/home')
    }
    return (
        <div className="grid min-h-[90vh] place-items-center mx-auto py-8">
            <AudioRecorder mode={RecorderMode.RECORD} onComplete={onComplete}/>
        </div>
    );
}
