import {formatTime} from "@/utils/format";

interface TimerDisplayProps {
    currentTime: number;
    totalTime: number;
}

const TimerDisplay = ({ currentTime, totalTime }: TimerDisplayProps) => {
    return (
        <div className="text-center text-4xl font-mono">
            {formatTime(Math.floor(currentTime))}/{formatTime(Math.floor(totalTime))}
    </div>
);
};

export default TimerDisplay;