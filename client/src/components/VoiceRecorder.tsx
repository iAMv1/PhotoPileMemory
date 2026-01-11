import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    onClear: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onClear }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const MAX_DURATION = 30; // 30 seconds max

    // Timer effect
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= MAX_DURATION) {
                        stopRecording();
                        return MAX_DURATION;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            setRecordingTime(0);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);

                // Create URL for playback preview
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);

                setHasRecording(true);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);
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

            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
        }
    };

    const clearRecording = () => {
        setHasRecording(false);
        setRecordingTime(0);
        setIsPlaying(false);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        onClear();
    };

    const togglePlayback = () => {
        if (!audioUrl) return;

        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => setIsPlaying(false);
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    // Progress bar percentage
    const progress = (recordingTime / MAX_DURATION) * 100;

    if (hasRecording) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-green-900/30 border border-green-700/50 rounded-xl"
            >
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlayback}
                    className="p-2 rounded-full bg-green-600 text-white"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </motion.button>

                <div className="flex-1">
                    <div className="text-sm font-medium text-green-400">Voice Message</div>
                    <div className="text-xs text-green-600">{formatTime(recordingTime)}</div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearRecording}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-2">
            <AnimatePresence mode="wait">
                {!isRecording ? (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={startRecording}
                            className="w-full flex gap-2 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white border border-purple-500"
                        >
                            <Mic className="h-4 w-4" />
                            Record Voice Message
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="recording"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-3"
                    >
                        {/* Recording indicator */}
                        <div className="flex items-center justify-between p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-3 h-3 rounded-full bg-red-500"
                                />
                                <span className="text-red-400 font-medium">Recording...</span>
                            </div>
                            <span className="text-white font-mono text-lg">{formatTime(recordingTime)}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                style={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Stop button */}
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={stopRecording}
                            className="w-full flex gap-2"
                        >
                            <Square className="h-4 w-4" />
                            Stop Recording ({MAX_DURATION - recordingTime}s left)
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
