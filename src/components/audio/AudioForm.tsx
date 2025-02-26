// File: components/AudioForm.tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AudioFormProps {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    saveLabel?: string;
    disableInputs?: boolean;
}

const AudioForm = ({
                       title,
                       description,
                       onTitleChange,
                       onDescriptionChange,
                       onSave,
                       onCancel,
                       saveLabel = "Save",
                       disableInputs = false
                   }: AudioFormProps) => {
    return (
        <div className="space-y-4">
            <Input
                placeholder="Recording 1"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                disabled={disableInputs}
            />
            <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={4}
                disabled={disableInputs}
            />

            <div className="flex justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                {!disableInputs && (
                    <Button
                        onClick={onSave}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {saveLabel}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AudioForm;