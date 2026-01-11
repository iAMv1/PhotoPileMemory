import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lock, Unlock, X } from "lucide-react";

interface TimeCapsuleMessage {
    id: number;
    hour: number;
    message: string;
    authorName?: string;
}

interface TimeCapsuleViewerProps {
    eventId?: string;
}

export function TimeCapsuleViewer({ eventId }: TimeCapsuleViewerProps) {
    const currentHour = new Date().getHours();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["time-capsule-messages", eventId],
        queryFn: async () => {
            if (!eventId) return { messages: [] };
            const res = await fetch(`/api/time-capsule-messages?eventId=${eventId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!eventId,
        refetchInterval: 60000,
    });

    const messages: TimeCapsuleMessage[] = data?.messages || [];

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4">
                <Clock className="h-4 w-4 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-700">Loading time capsules...</span>
            </div>
        );
    }

    if (messages.length === 0) return null;

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    };

    const getTimeUntil = (hour: number) => {
        if (currentHour >= hour) return null;
        const hoursUntil = hour - currentHour;
        return hoursUntil === 1 ? "1 hr" : `${hoursUntil} hrs`;
    };

    // Sort: unlocked first, then by hour
    const sortedMessages = [...messages].sort((a, b) => {
        const aUnlocked = currentHour >= a.hour;
        const bUnlocked = currentHour >= b.hour;
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return a.hour - b.hour;
    });

    return (
        <div className="space-y-4">
            {/* Header - Dark text on light background */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                    <Clock className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                    <h3 className="text-purple-900 font-bold text-lg">Time Capsule</h3>
                    <p className="text-gray-600 text-sm">Messages unlock throughout the day</p>
                </div>
            </div>

            {/* Message Cards */}
            <div className="space-y-3">
                {sortedMessages.map((msg) => {
                    const isUnlocked = currentHour >= msg.hour;
                    const isExpanded = expandedId === msg.id;
                    const timeUntil = getTimeUntil(msg.hour);

                    return (
                        <motion.div
                            key={msg.id}
                            layout="position"
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {/* Locked State - Dark card with light text */}
                            {!isUnlocked && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800 border border-gray-700">
                                    <div className="p-2 rounded-lg bg-gray-700">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-200 font-medium text-sm">
                                            Opens at {formatHour(msg.hour)}
                                        </p>
                                        {timeUntil && (
                                            <p className="text-gray-500 text-xs">
                                                {timeUntil} remaining
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-2xl">🔐</div>
                                </div>
                            )}

                            {/* Unlocked State - Collapsed (Green theme, dark text) */}
                            {isUnlocked && !isExpanded && (
                                <motion.button
                                    onClick={() => setExpandedId(msg.id)}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl 
                                               bg-gradient-to-r from-emerald-500 to-teal-500 
                                               border border-emerald-400 
                                               hover:from-emerald-600 hover:to-teal-600 
                                               transition-all text-left shadow-lg"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <div className="p-2 rounded-lg bg-white/20">
                                        <Unlock className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-sm">
                                            {formatHour(msg.hour)} Message
                                        </p>
                                        <p className="text-emerald-100 text-xs">
                                            Tap to reveal...
                                        </p>
                                    </div>
                                    <div className="text-2xl">✨</div>
                                </motion.button>
                            )}

                            {/* Unlocked State - Expanded */}
                            <AnimatePresence>
                                {isUnlocked && isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 rounded-xl bg-white border-2 border-emerald-400 shadow-xl space-y-4">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Unlock className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-emerald-700 text-sm font-bold">
                                                        {formatHour(msg.hour)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedId(null)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                                                >
                                                    <X className="h-4 w-4 text-gray-600" />
                                                </button>
                                            </div>

                                            {/* Message - Dark text on white background */}
                                            <p className="text-gray-800 text-base leading-relaxed">
                                                {msg.message}
                                            </p>

                                            {/* Author */}
                                            {msg.authorName && (
                                                <p className="text-gray-500 text-sm text-right italic">
                                                    — {msg.authorName}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
