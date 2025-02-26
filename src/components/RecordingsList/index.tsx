import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {router} from "next/client";

interface Recording {
    id: string;
    name: string;
    description: string;
    duration: string;
}
const host = "http://localhost:8000"
const fetchRecordings = async (): Promise<Recording[]> => {
    const response = await fetch(`http://localhost:8000/api/recordings`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
};

const deleteRecording = async (id: string): Promise<void> => {
    console.log('id', id)
    const response = await fetch(`http://localhost:8000/api/recordings/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
};

const Index = () => {
    const { data: recordings, isLoading } = useQuery({
        queryKey: ['recordings'],
        queryFn: fetchRecordings
    });

    const handleNew = () => {
        const newId = uuidv4();
        router.push(`/${newId}`);
    };

    const handleDelete = async (id: string) => {
        console.log('iddel', id)
        try {
            await deleteRecording(id);
            alert("Recording deleted. Please refresh to see changes.");
        } catch (error) {
            alert("Failed to delete recording");
        }
    };

    const handleCopyLink = (id: string) => {
        const url = `${window.location.origin}/${id}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My recordings</h1>
                    <Button
                        onClick={handleNew}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        + New
                    </Button>
                </div>
                <div className="text-center py-12">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My recordings</h1>
                <Button
                    onClick={handleNew}
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    + New
                </Button>
            </div>

            {(!recordings || recordings.length === 0) ? (
                <div className="text-center py-12 text-gray-500">
                    No recordings yet. Press "New" to create one.
                </div>
            ) : (
                <div className="space-y-4">
                    {recordings.map((recording) => (
                        <div
                            key={recording.id}
                            className="p-4 flex justify-between items-center"
                        >
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold">{recording.name}</h2>
                                <p className="text-gray-600 truncate">{recording.description}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2 ml-4">
                <span className="text-gray-600 whitespace-nowrap">
                  {recording.duration}
                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/${recording.id}`)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleCopyLink(recording.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Copy URL
                                    </button>
                                    <button
                                        onClick={() => handleDelete(recording.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Index;