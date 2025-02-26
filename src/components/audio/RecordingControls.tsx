// File: components/RecordingControls.tsx
import { Mic, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingControlsProps {
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onResetRecording: () => void;
}

const RecordingControls = ({
                               isRecording,
                               onStartRecording,
                               onStopRecording,
                               onResetRecording
                           }: RecordingControlsProps) => {
    if (!isRecording) {
        return (
            <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                onClick={onStartRecording}
            >
                <Mic className="h-8 w-8 text-white" />
            </Button>
        );
    }

    return (
        <>
            <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                onClick={onStopRecording}
            >
                <Square className="h-8 w-8 text-white" />
            </Button>
            <Button
                size="icon"
                variant="outline"
                className="h-16 w-16 rounded-full"
                onClick={onResetRecording}
            >
                <RotateCcw className="h-8 w-8" />
            </Button>
        </>
    );
};

export default RecordingControls;