import { useRouter } from 'next/router';
import AudioRecorder from '../../components/AudioRecorder';
import { RecorderMode } from '../../types';

const EditPage = () => {
    const router = useRouter();
    const { id } = router.query;

    if (!id || typeof id !== 'string') {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-8 text-center">Edit Recording</h1>
            <AudioRecorder
                mode={RecorderMode.EDIT}
                recordingId={id}
                onComplete={() => router.push('/')}
            />
        </div>
    );
};