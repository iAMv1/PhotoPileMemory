
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MemoryMaze } from "@/components/MemoryMaze";
import { RansomwareReveal } from "@/components/RansomwareReveal";
import { EnvelopeReveal } from "@/components/EnvelopeReveal";
import { SystemNotification, useSystemOverride } from "@/components/SystemOverride";

type Stage = "intro" | "maze" | "ransomware" | "gift" | "envelope";

export default function RecipientAccess() {
    const [, setLocation] = useLocation();
    const [stage, setStage] = useState<Stage>("intro");
    const [age, setAge] = useState("");
    const [ageError, setAgeError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const { notifications, triggerRandom } = useSystemOverride();

    // Trigger notifications during maze
    useEffect(() => {
        if (stage === "maze") {
            const interval = setInterval(() => {
                if (Math.random() > 0.6) triggerRandom();
            }, 12000);
            return () => clearInterval(interval);
        }
    }, [stage, triggerRandom]);

    const handleEnter = async () => {
        if (!age.trim()) return;

        setIsVerifying(true);
        setAgeError("");

        try {
            const res = await fetch("/api/verify-age", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ age: age.trim() }),
            });
            const data = await res.json();

            if (data.verified) {
                if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
                triggerRandom();
                // Store verified age for Home page to skip its verification
                localStorage.setItem("maze_completed", "true");
                localStorage.setItem("verified_age", age.trim());
                // Also fetch and store the birthday person's name
                try {
                    const configRes = await fetch("/api/event-config");
                    const configData = await configRes.json();
                    const bName = configData.config?.find((c: any) => c.key === "birthday_person_name")?.value;
                    if (bName) localStorage.setItem("birthday_person_name", bName);
                } catch { /* ignore */ }
                setStage("maze");
            } else {
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setAgeError("Wrong age. Try again... if you dare.");
            }
        } catch (error) {
            setAgeError("Error verifying. Check your connection.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleMazeComplete = () => {
        setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
            setStage("ransomware");
        }, 500);
    };

    const handleRansomwareUnlock = () => {
        setStage("gift");
        // After showing the gift message briefly, show envelope
        setTimeout(() => {
            setStage("envelope");
        }, 2500);
    };

    const handleEnvelopeComplete = () => {
        // Redirect to celebration page
        setLocation("/");
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* System Notifications */}
            {notifications.map((n) => (
                <SystemNotification
                    key={n.id}
                    title={n.title}
                    body={n.body}
                    icon={n.icon}
                    variant="ios"
                />
            ))}

            <AnimatePresence mode="wait">
                {/* STAGE 1: INTRO - Age Verification */}
                {stage === "intro" && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
                    >
                        {/* Creepy background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-red-950/20" />
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            }}
                        />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="relative z-10 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-8xl mb-6"
                            >
                                💀
                            </motion.div>

                            <motion.h1
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                className="text-5xl md:text-7xl font-bold text-red-600 mb-4 tracking-widest"
                                style={{ textShadow: "0 0 30px rgba(255,0,0,0.6), 0 0 60px rgba(255,0,0,0.3)" }}
                            >
                                ⚠️ PROVE YOURSELF ⚠️
                            </motion.h1>

                            <p className="text-neutral-400 mb-8 max-w-md text-lg">
                                To enter the <span className="text-red-500 font-bold">Memory Maze</span>,
                                <br />
                                <span className="text-red-400">you must prove you know <span className="underline">exactly</span> how old you are.</span>
                            </p>

                            <div className="space-y-4 w-full max-w-xs mx-auto">
                                <input
                                    type="number"
                                    placeholder="Enter the correct age..."
                                    value={age}
                                    onChange={(e) => { setAge(e.target.value); setAgeError(""); }}
                                    onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                                    className={`w-full p-4 rounded-xl bg-neutral-900/80 border-2 ${ageError ? 'border-red-500 animate-shake' : 'border-red-600/50'} text-white text-center text-xl focus:outline-none focus:border-red-500 backdrop-blur`}
                                />

                                {ageError && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-sm font-medium"
                                    >
                                        ❌ {ageError}
                                    </motion.p>
                                )}

                                <Button
                                    onClick={handleEnter}
                                    disabled={!age.trim() || isVerifying}
                                    className="w-full py-6 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/50 disabled:opacity-50"
                                >
                                    {isVerifying ? "Verifying..." : "👁️ ENTER IF YOU DARE"}
                                </Button>
                            </div>

                            <p className="text-red-900 text-xs mt-8 font-mono">
                                * Only those who know the truth may enter.
                            </p>
                        </motion.div>
                    </motion.div>
                )}

                {/* STAGE 2: MEMORY MAZE */}
                {stage === "maze" && (
                    <motion.div
                        key="maze"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <MemoryMaze onAllUnlocked={handleMazeComplete} />

                        <div className="fixed bottom-4 left-4 right-4 flex justify-center pb-safe">
                            <Button
                                onClick={handleMazeComplete}
                                className="bg-gradient-to-r from-red-600 via-purple-600 to-red-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-red-900/50 border border-red-500/30"
                            >
                                Skip to Final Reveal →
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STAGE 3: RANSOMWARE REVEAL */}
                {stage === "ransomware" && (
                    <motion.div
                        key="ransomware"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                    >
                        <RansomwareReveal
                            onUnlock={handleRansomwareUnlock}
                            giftContent={
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="text-center p-8"
                                >
                                    <div className="text-6xl mb-6">🎉🎂🎁</div>
                                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-6">
                                        HAPPY BIRTHDAY!
                                    </h2>
                                    <p className="text-white text-xl mb-8">
                                        You've survived the maze.<br />
                                        <span className="text-neutral-400">Your friends still love you. (Despite your age.)</span>
                                    </p>
                                    <div className="bg-gradient-to-r from-yellow-600/20 to-purple-600/20 p-6 rounded-2xl border border-yellow-500/30 max-w-md mx-auto">
                                        <p className="text-yellow-300 text-lg font-medium mb-2">
                                            🎊 Opening the celebration...
                                        </p>
                                        <p className="text-neutral-400 text-sm">
                                            Taking you to the full party experience!
                                        </p>
                                    </div>
                                </motion.div>
                            }
                        />
                    </motion.div>
                )}

                {/* STAGE 4: ENVELOPE REVEAL */}
                {stage === "envelope" && (
                    <EnvelopeReveal
                        onComplete={handleEnvelopeComplete}
                        birthdayName={localStorage.getItem("birthday_person_name") || undefined}
                    />
                )}
            </AnimatePresence>

            {/* Custom shake animation */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
        </div>
    );
}
