// File: components/PlaybackControls.tsx
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaybackControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onSkipBackward: () => void;
    onSkipForward: () => void;
    disableSkip?: boolean;
}

const PlaybackControls = ({
                              isPlaying,
                              onPlayPause,
                              onSkipBackward,
                              onSkipForward,
                              disableSkip = false
                          }: PlaybackControlsProps) => {
    return (
        <div className="flex justify-center gap-4">
            {!disableSkip && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSkipBackward}
                >
                    <SkipBack className="h-6 w-6" />
                </Button>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={onPlayPause}
            >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            {!disableSkip && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSkipForward}
                >
                    <SkipForward className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
};

export default PlaybackControls;