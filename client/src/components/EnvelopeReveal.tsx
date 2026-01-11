import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface EnvelopeRevealProps {
    onComplete: () => void;
    birthdayName?: string;
}

export function EnvelopeReveal({ onComplete, birthdayName }: EnvelopeRevealProps) {
    const [stage, setStage] = useState<"closed" | "opening" | "revealed">("closed");
    const [showConfetti, setShowConfetti] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);
    const constraintsRef = useRef(null);

    // Handle drag gesture for opening
    const handleDrag = (event: any, info: PanInfo) => {
        // Calculate progress based on upward drag (negative y)
        const progress = Math.min(Math.max(-info.offset.y / 150, 0), 1);
        setDragProgress(progress);
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (dragProgress > 0.6 || info.velocity.y < -300) {
            // Threshold reached - open the envelope
            triggerOpen();
        } else {
            // Reset
            setDragProgress(0);
        }
    };

    const triggerOpen = () => {
        if (stage === "closed") {
            setStage("opening");
            setDragProgress(1);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100, 50, 200]);
            }

            // Wait for animation, then show confetti and complete
            setTimeout(() => {
                setShowConfetti(true);
                setStage("revealed");
            }, 1000);

            setTimeout(() => {
                onComplete();
            }, 2500);
        }
    };

    // Calculate flap rotation based on drag progress
    const flapRotation = dragProgress * 180;

    return (
        <div
            ref={constraintsRef}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{
                background: "linear-gradient(to bottom, rgba(10,10,15,0.95), rgba(30,10,20,0.9), rgba(10,10,15,0.95))",
                backdropFilter: "blur(10px)",
            }}
        >
            {/* Confetti particles */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {Array.from({ length: 60 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: "50vw",
                                    y: "50vh",
                                    scale: 0,
                                    rotate: 0
                                }}
                                animate={{
                                    x: `${Math.random() * 100}vw`,
                                    y: `${Math.random() * 100}vh`,
                                    scale: [0, 1.5, 1],
                                    rotate: Math.random() * 720 - 360
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.5 + Math.random() * 0.5,
                                    ease: "easeOut"
                                }}
                                className="absolute pointer-events-none"
                                style={{
                                    width: 8 + Math.random() * 16,
                                    height: 8 + Math.random() * 16,
                                    backgroundColor: [
                                        "#FFD700", "#FF69B4", "#00CED1", "#FF6347",
                                        "#7B68EE", "#32CD32", "#FF4500", "#9932CC"
                                    ][Math.floor(Math.random() * 8)],
                                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Envelope */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {stage !== "revealed" && (
                        <motion.div
                            key="envelope"
                            initial={{ scale: 0.8, opacity: 0, rotateX: -10 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{
                                scale: 1.2,
                                opacity: 0,
                                rotateX: -30,
                                y: -100
                            }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="relative"
                            style={{ perspective: "1000px" }}
                        >
                            {/* Envelope Body */}
                            <motion.div
                                className="w-80 h-56 md:w-96 md:h-64 rounded-lg shadow-2xl relative overflow-visible cursor-grab active:cursor-grabbing touch-none"
                                style={{
                                    background: "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)",
                                    boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.1)`,
                                }}
                                drag={stage === "closed" ? "y" : false}
                                dragConstraints={{ top: -150, bottom: 0 }}
                                dragElastic={0.3}
                                onDrag={handleDrag}
                                onDragEnd={handleDragEnd}
                                whileDrag={{ scale: 1.02 }}
                            >
                                {/* Envelope texture lines */}
                                <div className="absolute inset-0 opacity-20">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-px bg-yellow-900/50 w-full"
                                            style={{ marginTop: `${(i + 1) * 10}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Letter peeking out */}
                                <motion.div
                                    className="absolute left-4 right-4 top-8 h-32 bg-white rounded-t-lg shadow-inner"
                                    style={{
                                        y: -dragProgress * 60,
                                        opacity: 0.3 + dragProgress * 0.7,
                                    }}
                                >
                                    <div className="p-4 text-neutral-400 text-xs">
                                        <div className="h-2 w-3/4 bg-neutral-200 rounded mb-2" />
                                        <div className="h-2 w-1/2 bg-neutral-200 rounded mb-2" />
                                        <div className="h-2 w-2/3 bg-neutral-200 rounded" />
                                    </div>
                                </motion.div>

                                {/* Wax Seal */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                    <motion.div
                                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                                        style={{
                                            background: "radial-gradient(circle at 30% 30%, #DC143C, #8B0000)",
                                            boxShadow: "0 4px 15px rgba(139, 0, 0, 0.5), inset 0 2px 4px rgba(255,255,255,0.2)",
                                            opacity: 1 - dragProgress,
                                            scale: 1 - dragProgress * 0.3,
                                        }}
                                        animate={stage === "closed" && dragProgress === 0 ? {
                                            scale: [1, 1.05, 1],
                                        } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <span className="text-3xl">💌</span>
                                    </motion.div>
                                </div>

                                {/* Flap (Top triangle) */}
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-24 md:h-28 origin-top z-10"
                                    style={{
                                        background: "linear-gradient(180deg, #A0522D 0%, #8B4513 100%)",
                                        clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                                        rotateX: stage === "opening" ? 180 : flapRotation,
                                        transformStyle: "preserve-3d",
                                    }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                            </motion.div>

                            {/* Instruction text */}
                            <motion.div
                                className="text-center mt-6"
                                animate={{ opacity: stage === "closed" ? [0.5, 1, 0.5] : 1 }}
                                transition={{ duration: 2, repeat: stage === "closed" ? Infinity : 0 }}
                            >
                                {stage === "closed" ? (
                                    <div className="space-y-1">
                                        <p className="text-neutral-300 font-medium">
                                            👆 Swipe up to open
                                        </p>
                                        <p className="text-neutral-500 text-xs">
                                            or tap the seal
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-neutral-400">Opening...</p>
                                )}
                            </motion.div>

                            {/* Progress indicator */}
                            {dragProgress > 0 && stage === "closed" && (
                                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                                    <div className="w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-pink-500"
                                            style={{ width: `${dragProgress * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                    {stage === "revealed" && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [-2, 2, -2]
                                }}
                                transition={{ duration: 0.5, repeat: 2 }}
                                className="text-7xl mb-6"
                            >
                                🎉🎂🎁
                            </motion.div>
                            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-4">
                                Surprise!
                            </h2>
                            <p className="text-neutral-300 text-xl">
                                {birthdayName ? `Happy Birthday, ${birthdayName}!` : "Welcome to your celebration!"}
                            </p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-neutral-500 text-sm mt-4"
                            >
                                Loading the party...
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
