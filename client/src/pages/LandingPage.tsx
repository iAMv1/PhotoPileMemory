import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, Camera, MessageCircle, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Floating cloud animation component
function FloatingCloud({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{
                opacity: [0.3, 0.6, 0.3],
                x: [0, 30, 0],
                y: [0, -15, 0]
            }}
            transition={{
                duration: 8 + Math.random() * 4,
                delay,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{
                left,
                top,
                width: size,
                height: size * 0.6,
                background: `radial-gradient(ellipse, rgba(255,200,150,0.4) 0%, rgba(255,150,100,0.1) 70%, transparent 100%)`
            }}
        />
    );
}

// Sunbeam animation
function Sunbeam({ angle, delay }: { angle: number; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none origin-top-right"
            style={{
                background: `linear-gradient(${angle}deg, rgba(255,215,150,0.15) 0%, transparent 60%)`,
            }}
        />
    );
}

export default function LandingPage() {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [birthdayDate, setBirthdayDate] = useState("");
    const [eventName, setEventName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formStep, setFormStep] = useState(0);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !age || !eventName) return;

        setIsLoading(true);
        try {
            const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

            await apiRequest("/api/events", {
                method: "POST",
                body: {
                    slug,
                    birthdayPersonName: name,
                    birthdayPersonAge: parseInt(age),
                    birthdayDate: birthdayDate || null,
                    themeColor: "#f59e0b"
                }
            });

            toast({
                title: "✨ Memory Capsule Created!",
                description: "Redirecting to your dashboard...",
            });

            setLocation(`/dashboard/${slug}`);
        } catch (error) {
            toast({
                title: "Error creating event",
                description: "That event name might be taken or something went wrong.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Form field animation variants
    const fieldVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Golden Hour Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-rose-100 to-orange-200" />

            {/* Animated Clouds */}
            <FloatingCloud delay={0} size={400} left="10%" top="5%" />
            <FloatingCloud delay={2} size={300} left="60%" top="10%" />
            <FloatingCloud delay={4} size={350} left="30%" top="60%" />
            <FloatingCloud delay={1} size={250} left="80%" top="40%" />
            <FloatingCloud delay={3} size={200} left="5%" top="70%" />

            {/* Sunbeams */}
            <Sunbeam angle={-45} delay={0} />
            <Sunbeam angle={-30} delay={2} />
            <Sunbeam angle={-60} delay={4} />

            {/* Rainbow light refraction overlay */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, 
                        transparent 0%, 
                        rgba(255,100,100,0.1) 20%, 
                        rgba(255,200,100,0.15) 40%, 
                        rgba(100,255,200,0.1) 60%, 
                        rgba(100,150,255,0.1) 80%, 
                        transparent 100%)`
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block mb-4"
                    >
                        <span className="text-6xl">✨</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4"
                        style={{
                            background: "linear-gradient(135deg, #92400e 0%, #b45309 30%, #d97706 60%, #f59e0b 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 4px 30px rgba(180,83,9,0.3)"
                        }}
                    >
                        Timeless Memories
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-2xl text-amber-900/80 max-w-2xl mx-auto font-light"
                    >
                        Capture your story. Preserve the warmth.
                        Create a beautiful memory capsule that unlocks on their special day.
                    </motion.p>
                </motion.div>

                {/* Main Card - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-lg"
                >
                    <div
                        className="relative rounded-3xl p-8 backdrop-blur-xl border border-white/50 shadow-2xl"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,240,220,0.5) 100%)",
                            boxShadow: "0 25px 50px -12px rgba(180,83,9,0.25), inset 0 1px 1px rgba(255,255,255,0.8)"
                        }}
                    >
                        {/* Prism refraction effect on card */}
                        <div
                            className="absolute -top-2 -right-2 w-20 h-20 opacity-60 pointer-events-none"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,100,100,0.3), rgba(255,200,100,0.3), rgba(100,255,200,0.3), rgba(100,150,255,0.3))",
                                borderRadius: "50%",
                                filter: "blur(20px)"
                            }}
                        />

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-semibold text-amber-900 mb-1">Create Your Capsule</h2>
                            <p className="text-amber-700/70 text-sm">No account needed. Free forever.</p>
                        </div>

                        <form onSubmit={handleCreateEvent} className="space-y-5">
                            <motion.div
                                variants={fieldVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Who's the star?
                                </label>
                                <Input
                                    placeholder="Their name..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white/60 border-amber-200/80 text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:ring-amber-500/30 rounded-xl h-12"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                variants={fieldVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-amber-800">Age turning</label>
                                    <Input
                                        type="number"
                                        placeholder="25"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className="bg-white/60 border-amber-200/80 text-amber-900 placeholder:text-amber-400 focus:border-amber-500 rounded-xl h-12"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-amber-800 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Unlock date
                                    </label>
                                    <Input
                                        type="date"
                                        value={birthdayDate}
                                        onChange={(e) => setBirthdayDate(e.target.value)}
                                        className="bg-white/60 border-amber-200/80 text-amber-900 focus:border-amber-500 rounded-xl h-12"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                variants={fieldVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.5 }}
                                className="space-y-2"
                            >
                                <label className="text-sm font-medium text-amber-800">Your unique link</label>
                                <div className="flex items-center">
                                    <span className="bg-amber-100 text-amber-600 px-3 h-12 flex items-center rounded-l-xl border border-r-0 border-amber-200/80 text-sm">
                                        /e/
                                    </span>
                                    <Input
                                        placeholder="rahul-25th"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        className="bg-white/60 border-amber-200/80 text-amber-900 placeholder:text-amber-400 focus:border-amber-500 rounded-l-none rounded-r-xl h-12"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Create Memory Capsule
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 text-center"
                        >
                            <Link href="/demo/access">
                                <span className="text-amber-700 hover:text-amber-900 text-sm underline underline-offset-4 cursor-pointer transition-colors">
                                    See a live demo →
                                </span>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl w-full"
                >
                    <FeatureCard
                        icon={<Camera className="w-7 h-7" />}
                        title="Memory Maze"
                        desc="Friends upload photos with riddles. Unlock each memory by solving the clue."
                        delay={0}
                    />
                    <FeatureCard
                        icon={<MessageCircle className="w-7 h-7" />}
                        title="Voice Notes"
                        desc="Record heartfelt audio messages that play when they tap on a memory."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Clock className="w-7 h-7" />}
                        title="Time Capsules"
                        desc="Schedule messages to appear at specific hours throughout their special day."
                        delay={0.2}
                    />
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1 }}
                    className="mt-16 text-amber-800/50 text-sm"
                >
                    Made with love for celebrating those who matter most ❤️
                </motion.p>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + delay }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 rounded-2xl backdrop-blur-lg border border-white/40 transition-all cursor-default"
            style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,240,220,0.3) 100%)",
                boxShadow: "0 8px 32px rgba(180,83,9,0.1)"
            }}
        >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-500/20">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">{title}</h3>
            <p className="text-amber-700/70 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
}
