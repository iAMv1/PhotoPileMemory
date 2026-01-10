import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lock, Unlock } from "lucide-react";

interface TimeCapsuleMessage {
    id: number;
    hour: number;
    message: string;
    authorName?: string;
}

export function TimeCapsuleViewer() {
    const currentHour = new Date().getHours();

    const { data, isLoading } = useQuery({
        queryKey: ["time-capsule-messages"],
        queryFn: async () => {
            const res = await fetch("/api/time-capsule-messages");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        refetchInterval: 60000, // Refresh every minute
    });

    const messages: TimeCapsuleMessage[] = data?.messages || [];

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-amber-400 animate-spin" />
                    <h3 className="text-lg font-bold text-amber-300">Time Capsule</h3>
                </div>
                <p className="text-amber-200/60 text-sm">Loading messages...</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-amber-300">Time Capsule</h3>
                </div>
                <p className="text-amber-200/60 text-sm text-center py-8">
                    No time-locked messages yet.
                </p>
            </div>
        );
    }

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    };

    return (
        <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-amber-300">Time Capsule Messages</h3>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence>
                    {messages.map((msg, idx) => {
                        const isUnlocked = currentHour >= msg.hour;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`rounded-xl p-4 border ${isUnlocked
                                        ? "bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30"
                                        : "bg-gradient-to-r from-neutral-800/60 to-neutral-900/60 border-neutral-600/30"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {isUnlocked ? (
                                        <Unlock className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <Lock className="h-4 w-4 text-neutral-400" />
                                    )}
                                    <span className={`text-xs font-medium ${isUnlocked ? "text-green-400" : "text-neutral-400"
                                        }`}>
                                        {isUnlocked ? "Unlocked" : `Opens at ${formatHour(msg.hour)}`}
                                    </span>
                                </div>

                                {isUnlocked ? (
                                    <>
                                        <p className="text-white text-sm">{msg.message}</p>
                                        {msg.authorName && (
                                            <p className="text-green-300/60 text-xs mt-2">— {msg.authorName}</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="text-neutral-500 text-sm italic flex items-center gap-2">
                                            <span className="text-2xl">🔐</span>
                                            <span>Message locked until {formatHour(msg.hour)}</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
