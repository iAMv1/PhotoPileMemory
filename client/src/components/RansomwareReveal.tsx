
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RansomwareRevealProps {
    onUnlock: () => void;
    giftContent?: React.ReactNode;
}

const TIMER_LIMITS = [60, 120, 240, 480]; // Doubling timer limits
const RICK_ROLL_URL = "https://youtu.be/xvFZjo5PgG0?si=dsrh3n6TAC1_8xIr";

export function RansomwareReveal({ onUnlock, giftContent }: RansomwareRevealProps) {
    const [userInput, setUserInput] = useState("");
    const [isUnlocking, setIsUnlocking] = useState(false);
    // Start with first limit (60 seconds)
    const [timerIndex, setTimerIndex] = useState(0);
    const [countdown, setCountdown] = useState(TIMER_LIMITS[0]);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [timeoutCount, setTimeoutCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const requiredPhrase = "i am old";

    // Countdown timer - redirects to Rick Roll on timeout
    useEffect(() => {
        if (isUnlocked) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Timeout! Redirect to Rick Roll 😈
                    if (navigator.vibrate) {
                        navigator.vibrate([500, 200, 500]);
                    }

                    // Open Rick Roll in new tab
                    window.open(RICK_ROLL_URL, "_blank");

                    // Increment timeout count and double timer
                    setTimeoutCount(tc => tc + 1);
                    const nextIndex = Math.min(timerIndex + 1, TIMER_LIMITS.length - 1);
                    setTimerIndex(nextIndex);

                    // Reset with doubled timer
                    return TIMER_LIMITS[nextIndex];
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isUnlocked, timerIndex]);

    // Haptic pulse during locked state
    useEffect(() => {
        if (isUnlocked) return;
        const haptic = setInterval(() => {
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 2000);
        return () => clearInterval(haptic);
    }, [isUnlocked]);

    const handleSubmit = () => {
        if (userInput.toLowerCase().trim() === requiredPhrase) {
            setIsUnlocking(true);

            // Heavy haptic feedback on unlock
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 200]);
            }

            setTimeout(() => {
                setIsUnlocked(true);
                onUnlock();
            }, 2000);
        } else {
            // Wrong answer - shake
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
            inputRef.current?.classList.add("animate-shake");
            setTimeout(() => {
                inputRef.current?.classList.remove("animate-shake");
            }, 500);
        }
    };

    if (isUnlocked) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-black flex items-center justify-center p-4"
            >
                {giftContent || (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-green-500 mb-4">🎉 DECRYPTION SUCCESSFUL 🎉</h1>
                        <p className="text-white text-lg">Your gift is unlocked!</p>
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Scanlines effect */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `repeating-linear-gradient(
            0deg, 
            transparent, 
            transparent 2px, 
            rgba(0,0,0,0.3) 2px, 
            rgba(0,0,0,0.3) 4px
          )`,
                }}
            />

            {/* Glitch overlay */}
            <AnimatePresence>
                {isUnlocking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1, 0] }}
                        transition={{ duration: 2, times: [0, 0.2, 0.4, 0.7, 1] }}
                        className="absolute inset-0 bg-green-500/20 z-10"
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                animate={isUnlocking ? { scale: [1, 1.1, 0.9, 1.05, 1], opacity: [1, 0.8, 1, 0.5, 0] } : {}}
                transition={{ duration: 2 }}
                className="text-center z-20 max-w-md w-full"
            >
                {/* Skull Icon */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-8xl mb-4"
                >
                    💀
                </motion.div>

                {/* Warning Header */}
                <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2 tracking-wider font-mono">
                    ⚠️ SYSTEM LOCKED ⚠️
                </h1>
                <p className="text-white text-sm md:text-base mb-6 font-mono">
                    YOUR GIFT HAS BEEN ENCRYPTED
                </p>

                {/* Countdown */}
                <div className="bg-black/50 border-2 border-red-500 rounded-lg p-4 mb-6">
                    <p className="text-red-400 text-xs mb-2 font-mono">TIME REMAINING TO COMPLY:</p>
                    <p className="text-red-500 text-5xl font-bold font-mono">
                        {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                    </p>
                    {timeoutCount > 0 && (
                        <p className="text-orange-400 text-xs mt-2 font-mono animate-pulse">
                            ⚠️ ATTEMPT {timeoutCount}/4 - Timer doubled!
                        </p>
                    )}
                </div>

                {/* Ransom Note */}
                <div className="bg-black/70 border border-red-800 rounded-lg p-4 mb-6 text-left">
                    <p className="text-gray-300 text-sm font-mono leading-relaxed">
                        To decrypt your gift, you must acknowledge reality.
                        <br /><br />
                        <span className="text-red-400">TYPE THE FOLLOWING TO UNLOCK:</span>
                        <br />
                        <span className="text-white font-bold text-lg">"{requiredPhrase.toUpperCase()}"</span>
                    </p>
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="Type here..."
                        className="flex-1 p-4 rounded-lg bg-black border-2 border-red-500 text-white font-mono text-center focus:outline-none focus:border-red-400"
                        disabled={isUnlocking}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isUnlocking}
                        className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                    >
                        {isUnlocking ? "..." : "DECRYPT"}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-red-700 text-xs mt-6 font-mono">
                    RANSOMWARE_V0.1 | PAYMENT: YOUR DIGNITY
                </p>
            </motion.div>
        </motion.div>
    );
}
