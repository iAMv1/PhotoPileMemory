import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnvelopeRevealProps {
    onComplete: () => void;
    birthdayName?: string;
}

export function EnvelopeReveal({ onComplete, birthdayName }: EnvelopeRevealProps) {
    const [stage, setStage] = useState<"closed" | "opening" | "revealed">("closed");
    const [showConfetti, setShowConfetti] = useState(false);

    const handleOpen = () => {
        if (stage === "closed") {
            setStage("opening");
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100, 50, 200]);
            }
            // Wait for animation, then show confetti and complete
            setTimeout(() => {
                setShowConfetti(true);
                setStage("revealed");
            }, 1200);
            setTimeout(() => {
                onComplete();
            }, 2500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-neutral-950 to-neutral-900 flex items-center justify-center overflow-hidden">
            {/* Confetti particles */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {Array.from({ length: 50 }).map((_, i) => (
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
                                    scale: [0, 1, 1],
                                    rotate: Math.random() * 720 - 360
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.5 + Math.random(),
                                    ease: "easeOut"
                                }}
                                className="absolute pointer-events-none"
                                style={{
                                    width: 10 + Math.random() * 15,
                                    height: 10 + Math.random() * 15,
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
            <motion.div
                className="relative cursor-pointer"
                onClick={handleOpen}
                whileHover={stage === "closed" ? { scale: 1.02, rotateY: 5 } : {}}
                whileTap={stage === "closed" ? { scale: 0.98 } : {}}
            >
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
                            <div
                                className="w-80 h-56 md:w-96 md:h-64 rounded-lg shadow-2xl relative overflow-hidden"
                                style={{
                                    background: "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
                                }}
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

                                {/* Wax Seal */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                    <motion.div
                                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                                        style={{
                                            background: "radial-gradient(circle at 30% 30%, #DC143C, #8B0000)",
                                            boxShadow: "0 4px 15px rgba(139, 0, 0, 0.5), inset 0 2px 4px rgba(255,255,255,0.2)",
                                        }}
                                        animate={stage === "closed" ? {
                                            scale: [1, 1.05, 1],
                                            boxShadow: [
                                                "0 4px 15px rgba(139, 0, 0, 0.5)",
                                                "0 4px 25px rgba(220, 20, 60, 0.7)",
                                                "0 4px 15px rgba(139, 0, 0, 0.5)",
                                            ]
                                        } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <span className="text-3xl">💌</span>
                                    </motion.div>
                                </div>

                                {/* Flap (Top triangle) */}
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-24 md:h-28 origin-top"
                                    style={{
                                        background: "linear-gradient(180deg, #A0522D 0%, #8B4513 100%)",
                                        clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                                    }}
                                    animate={stage === "opening" ? {
                                        rotateX: 180,
                                        y: -10,
                                    } : {}}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                            </div>

                            {/* Instruction text */}
                            <motion.p
                                className="text-center text-neutral-400 mt-6 text-sm"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {stage === "closed" ? "✨ Tap to open your surprise ✨" : "Opening..."}
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                    {stage === "revealed" && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [-2, 2, -2]
                                }}
                                transition={{ duration: 0.5, repeat: 2 }}
                                className="text-6xl mb-4"
                            >
                                🎉🎂🎁
                            </motion.div>
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-2">
                                Surprise!
                            </h2>
                            <p className="text-neutral-300">
                                {birthdayName ? `Happy Birthday, ${birthdayName}!` : "Welcome to your celebration!"}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
