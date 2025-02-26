// File: components/CopyUrlButton.tsx
import { useState } from 'react';
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyUrlButtonProps {
    url: string;
}

const CopyUrlButton = ({ url }: CopyUrlButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <Button
            onClick={handleCopy}
            className="flex gap-2 items-center"
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4" />
                    Copied!
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4" />
                    Copy URL
                </>
            )}
        </Button>
    );
};

export default CopyUrlButton;