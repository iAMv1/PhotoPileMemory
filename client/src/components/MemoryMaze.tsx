
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface MazePhoto {
    id: number;
    src: string;
    memoryClue: string | null;
    voiceNote: string | null;
    contributorName: string | null;
    isGlitched: boolean;
    riddleQuestion: string | null;
    riddleOptions: string | null;
    riddleAnswer: string | null;
    riddleType: string | null;
}

interface UnlockModalProps {
    photo: MazePhoto;
    onClose: () => void;
    onUnlock: () => void;
}

function UnlockModal({ photo, onClose, onUnlock }: UnlockModalProps) {
    const [answer, setAnswer] = useState("");
    const [shake, setShake] = useState(false);
    const hasRiddle = photo.riddleQuestion && photo.riddleAnswer;
    const isMCQ = photo.riddleType === "mcq" && photo.riddleOptions;

    let options: string[] = [];
    if (isMCQ && photo.riddleOptions) {
        try {
            options = JSON.parse(photo.riddleOptions);
        } catch { options = []; }
    }

    const [unlockSuccess, setUnlockSuccess] = useState(false);

    const handleSubmit = () => {
        if (!hasRiddle || answer.toLowerCase().trim() === photo.riddleAnswer?.toLowerCase().trim()) {
            if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
            // Show success state for 1.5 seconds before closing
            setUnlockSuccess(true);
            setTimeout(() => {
                onUnlock();
            }, 1500);
        } else {
            setShake(true);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={unlockSuccess ? undefined : onClose}
        >
            <motion.div
                initial={{ scale: 0.8, y: 50, rotateX: -10 }}
                animate={{
                    scale: unlockSuccess ? 1.05 : 1,
                    y: 0,
                    rotateX: 0,
                    x: shake ? [0, -10, 10, -10, 10, 0] : 0,
                    borderColor: unlockSuccess ? "rgb(34, 197, 94)" : "rgb(153, 27, 27)"
                }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl ${unlockSuccess
                    ? "bg-gradient-to-b from-green-900 to-green-950 border border-green-500/50 shadow-green-900/50"
                    : "bg-gradient-to-b from-neutral-900 to-neutral-950 border border-red-800/50 shadow-red-900/30"
                    }`}
                onClick={(e) => e.stopPropagation()}
                style={{ perspective: "1000px" }}
            >
                {/* Header - changes based on unlock success */}
                <div className="relative">
                    <h3 className={`text-2xl font-bold text-center tracking-wider ${unlockSuccess ? "text-green-400" : "text-red-500"}`}>
                        {unlockSuccess ? "✅ UNLOCKED!" : "🔐 LOCKED"}
                    </h3>
                    {!unlockSuccess && (
                        <div className="absolute inset-0 opacity-30 pointer-events-none animate-pulse">
                            <div className="h-0.5 bg-red-500 absolute top-1/2 w-full" style={{ clipPath: "inset(0 0 0 0)" }} />
                        </div>
                    )}
                </div>

                {/* Show unlocked photo preview on success */}
                {unlockSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl overflow-hidden shadow-lg"
                    >
                        <img src={photo.src} alt="Revealed memory" className="w-full h-48 object-cover" />
                    </motion.div>
                )}

                {/* Contributor - only show during riddle, not on success */}
                {!unlockSuccess && (
                    <p className="text-neutral-500 text-sm text-center">
                        From: <span className="text-white font-medium">{photo.contributorName || "A mysterious friend"}</span>
                    </p>
                )}

                {/* Show contributor and memory text on success */}
                {unlockSuccess && (
                    <div className="text-center space-y-2">
                        <p className="text-green-300 text-sm">Memory from:</p>
                        <p className="text-white font-bold text-lg">{photo.contributorName || "A mysterious friend"}</p>
                        {photo.memoryClue && (
                            <p className="text-green-200/80 text-sm italic">"{photo.memoryClue}"</p>
                        )}
                    </div>
                )}

                {/* Question - HIDE on success */}
                {!unlockSuccess && (
                    <div className="bg-black/50 p-4 rounded-xl border border-red-900/30 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }} />
                        <p className="text-white text-center font-medium relative z-10">
                            {hasRiddle ? photo.riddleQuestion : (photo.memoryClue || "Can you remember this moment?")}
                        </p>
                    </div>
                )}

                {/* Answer Input - HIDE on success */}
                {!unlockSuccess && (
                    isMCQ ? (
                        <div className="space-y-2">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setAnswer(opt); }}
                                    className={`w-full p-3 rounded-lg text-left transition-all ${answer === opt
                                        ? "bg-red-600 text-white border-red-500"
                                        : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                                        } border`}
                                >
                                    {String.fromCharCode(65 + idx)}. {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <input
                            type="text"
                            placeholder="Your answer..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            className="w-full p-4 rounded-xl bg-black border border-red-900/50 text-white focus:border-red-500 focus:outline-none text-center"
                            autoFocus
                        />
                    )
                )}

                {/* Buttons - HIDE on success */}
                {!unlockSuccess && (
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 p-3 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition font-medium"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 p-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold hover:from-red-700 hover:to-orange-700 transition"
                        >
                            {hasRiddle ? "Solve" : "Reveal"}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

function GlitchedPhoto({ photo, onClick, index }: { photo: MazePhoto; onClick: () => void; index: number }) {
    const randomRotation = Math.random() * 6 - 3;
    const randomDelay = index * 0.1 + Math.random() * 0.2;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, rotate: randomRotation }}
            animate={{ opacity: 1, y: 0, rotate: randomRotation }}
            transition={{ delay: randomDelay, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="relative w-64 h-48 md:w-72 md:h-56 rounded-xl overflow-hidden cursor-pointer group shadow-2xl"
            style={{
                filter: "drop-shadow(0 10px 20px rgba(255,0,0,0.15))",
                borderRadius: "15% 85% 85% 15% / 85% 15% 85% 15%", // Organic blob shape
            }}
        >
            {/* Blurred Photo */}
            <img
                src={photo.src}
                alt="Memory"
                className="w-full h-full object-cover filter blur-xl brightness-30 saturate-50 scale-110"
            />

            {/* Creepy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-black/60 to-red-950/50" />

            {/* Static Noise */}
            <div
                className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none animate-pulse"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Glitch Lines */}
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-full h-1 bg-red-500/60"
                    style={{
                        top: `${20 + i * 30}%`,
                        animation: `glitchLine ${1 + i * 0.3}s infinite`,
                        opacity: 0.4 + Math.random() * 0.3,
                    }}
                />
            ))}

            {/* Lock Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-black/80 p-5 rounded-full border-2 border-red-600/50 shadow-lg shadow-red-900/50"
                >
                    <span className="text-4xl">🔒</span>
                </motion.div>
            </div>

            {/* Riddle Indicator */}
            {photo.riddleQuestion && (
                <div className="absolute top-2 right-2 bg-orange-600/80 px-2 py-1 rounded-full text-xs font-bold">
                    RIDDLE
                </div>
            )}

            {/* Tap Hint */}
            <div className="absolute bottom-3 left-3 right-3 text-center text-xs text-red-300/70 bg-black/50 py-1 rounded-lg backdrop-blur-sm">
                👆 Tap to unlock
            </div>
        </motion.div>
    );
}

function ClearPhoto({ photo, index }: { photo: MazePhoto; index: number }) {
    const [playingAudio, setPlayingAudio] = useState(false);
    const randomRotation = Math.random() * 4 - 2;

    const playVoiceNote = () => {
        if (photo.voiceNote) {
            const audio = new Audio(photo.voiceNote);
            audio.play();
            setPlayingAudio(true);
            audio.onended = () => setPlayingAudio(false);
        }
    };

    return (
        <motion.div
            initial={{ filter: "blur(30px)", opacity: 0, scale: 0.8 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1, rotate: randomRotation }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative w-64 h-48 md:w-72 md:h-56 rounded-xl overflow-hidden shadow-2xl border-2 border-green-500/30"
            style={{
                filter: "drop-shadow(0 10px 30px rgba(0,255,100,0.2))",
                borderRadius: "5% 15% 10% 20% / 10% 5% 15% 10%", // Subtle organic
            }}
        >
            <img src={photo.src} alt="Memory" className="w-full h-full object-cover" />

            {/* Unlocked Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {photo.voiceNote && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={playVoiceNote}
                    className={`absolute bottom-3 right-3 p-3 rounded-full ${playingAudio ? 'bg-green-500 animate-pulse' : 'bg-white/90'} shadow-lg transition`}
                >
                    {playingAudio ? "🔊" : "▶️"}
                </motion.button>
            )}

            <div className="absolute bottom-3 left-3 text-xs text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                ✓ {photo.contributorName || "A friend"}
            </div>

            <div className="absolute top-2 right-2 bg-green-500/80 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                UNLOCKED
            </div>
        </motion.div>
    );
}

export function MemoryMaze({ onAllUnlocked, eventId }: { onAllUnlocked?: () => void; eventId?: string }) {
    const [selectedPhoto, setSelectedPhoto] = useState<MazePhoto | null>(null);
    const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());

    const { data, isLoading, error } = useQuery({
        queryKey: ["/api/user-photos", eventId, "maze"],
        queryFn: async () => {
            const url = eventId ? `/api/user-photos?eventId=${eventId}` : "/api/user-photos";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch photos");
            const json = await res.json();
            // Only show photos that are marked for the maze (isGlitched = true)
            return (json.photos as MazePhoto[]).filter(p => p.isGlitched === true);
        },
        enabled: !!eventId
    });

    // Check if all unlocked
    useEffect(() => {
        if (data && data.length > 0 && unlockedIds.size === data.length) {
            onAllUnlocked?.();
        }
    }, [unlockedIds, data, onAllUnlocked]);

    const handleUnlock = (id: number) => {
        setUnlockedIds((prev) => new Set(prev).add(id));
        setSelectedPhoto(null);
        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-red-500 text-2xl font-bold tracking-widest"
                >
                    ENTERING MAZE...
                </motion.div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-500 text-xl">⚠️ Error loading maze.</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-red-950/20 to-black flex items-center justify-center text-center p-4">
                <div className="space-y-4">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-7xl"
                    >
                        🕳️
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white">The Maze is Empty</h2>
                    <p className="text-neutral-400">No memories have been sacrificed yet.</p>
                </div>
            </div>
        );
    }

    const unlockedCount = unlockedIds.size;
    const totalCount = data.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black py-12 px-4">
            {/* CSS for glitch animation */}
            <style>{`
        @keyframes glitchLine {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 0.6; }
        }
      `}</style>

            {/* Header */}
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 mb-4"
                    style={{ textShadow: "0 0 40px rgba(255,50,50,0.3)" }}
                >
                    THE MEMORY MAZE
                </motion.h1>
                <p className="text-neutral-500 text-sm mb-4">
                    Unlock the buried memories. Answer the questions.
                </p>
                <div className="inline-flex items-center gap-2 bg-neutral-900/80 px-4 py-2 rounded-full border border-neutral-800">
                    <span className="text-green-400 font-bold">{unlockedCount}</span>
                    <span className="text-neutral-500">/</span>
                    <span className="text-neutral-400">{totalCount}</span>
                    <span className="text-neutral-500 text-sm">unlocked</span>
                </div>
            </div>

            {/* Maze Grid - Organic scatter layout */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
                {data.map((photo, index) => {
                    const isUnlocked = unlockedIds.has(photo.id);
                    return isUnlocked ? (
                        <ClearPhoto key={photo.id} photo={photo} index={index} />
                    ) : (
                        <GlitchedPhoto
                            key={photo.id}
                            photo={photo}
                            index={index}
                            onClick={() => setSelectedPhoto(photo)}
                        />
                    );
                })}
            </div>

            {/* Unlock Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <UnlockModal
                        photo={selectedPhoto}
                        onClose={() => setSelectedPhoto(null)}
                        onUnlock={() => handleUnlock(selectedPhoto.id)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
