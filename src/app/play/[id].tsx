import { useRouter } from 'next/router';
import { RecorderMode } from '../../types';
import AudioRecorder from "@/components/audio/AudioRecorder";

const PlayPage = () => {
    const router = useRouter();
    const { id } = router.query;

    if (!id || typeof id !== 'string') {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-8 text-center">Play Recording</h1>
            <AudioRecorder
                mode={RecorderMode.PLAY}
                recordingId={id}
            />
        </div>
    );
};

export default PlayPage;