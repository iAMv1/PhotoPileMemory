
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    onClear: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onClear }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);
                chunksRef.current = [];
                setHasRecording(true);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied. Cannot record.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const clearRecording = () => {
        setHasRecording(false);
        onClear();
    };

    if (hasRecording) {
        return (
            <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-green-500">✓ Recording Saved</div>
                <Button variant="ghost" size="icon" onClick={clearRecording} title="Delete Recording">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            {!isRecording ? (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={startRecording}
                    className="w-full flex gap-2"
                >
                    <Mic className="h-4 w-4" />
                    Record Voice Note (15s)
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="w-full flex gap-2 animate-pulse"
                >
                    <Square className="h-4 w-4" />
                    Stop Recording
                </Button>
            )}
        </div>
    );
}
