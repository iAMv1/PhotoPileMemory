import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, Camera, MessageCircle, Lock, ArrowRight, Heart, Gift, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Scroll-triggered reveal animation component
function RevealOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    );
}

// Floating orb background element
function FloatingOrb({ color, size, left, top, delay }: { color: string; size: number; left: string; top: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, -30, 0]
            }}
            transition={{
                duration: 12 + Math.random() * 8,
                delay,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{
                left,
                top,
                width: size,
                height: size,
                background: color,
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
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 300]);

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

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-[#0a0a0f]">

            {/* Dynamic Gradient Background - Cluely Style */}
            <motion.div
                className="fixed inset-0 pointer-events-none"
                style={{ y: backgroundY }}
            >
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1033] via-[#0f0a1a] to-[#0a0a0f]" />

                {/* Animated color orbs */}
                <FloatingOrb color="rgba(139, 92, 246, 0.3)" size={600} left="-10%" top="-10%" delay={0} />
                <FloatingOrb color="rgba(236, 72, 153, 0.2)" size={500} left="60%" top="5%" delay={2} />
                <FloatingOrb color="rgba(251, 146, 60, 0.15)" size={400} left="80%" top="50%" delay={4} />
                <FloatingOrb color="rgba(59, 130, 246, 0.2)" size={350} left="10%" top="60%" delay={1} />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </motion.div>

            {/* Content */}
            <div className="relative z-10">

                {/* Navigation */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <span className="text-white font-semibold text-lg">Timeless Memories</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/demo/access">
                                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">Demo</span>
                            </Link>
                            <Button
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                                onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </motion.nav>

                {/* Hero Section */}
                <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
                        >
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-gray-300">The #1 Digital Birthday Experience</span>
                        </motion.div>

                        {/* Main Headline */}
                        <h1
                            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.9] tracking-tight"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Memories that
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                                last forever
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                        >
                            Create a beautiful digital time capsule filled with photos, voice notes, and wishes—revealed only on their special day.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-105"
                                onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Create Free Capsule
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Link href="/demo/access">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                                >
                                    See Demo
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="absolute bottom-10"
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
                        >
                            <motion.div
                                animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-white/60"
                            />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Bento Grid */}
                <section className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <RevealOnScroll>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Everything you need
                                </h2>
                                <p className="text-xl text-gray-400">
                                    Four magical ways to make their day unforgettable
                                </p>
                            </div>
                        </RevealOnScroll>

                        {/* Bento Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Large Feature Card */}
                            <RevealOnScroll delay={0.1}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="lg:col-span-2 lg:row-span-2 p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                                            <Camera className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Memory Maze</h3>
                                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                                            Friends upload photos with riddles. The birthday person solves clues to unlock each precious memory. A journey through shared moments.
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300">Photos</span>
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300">Riddles</span>
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300">Interactive</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </RevealOnScroll>

                            {/* Voice Notes Card */}
                            <RevealOnScroll delay={0.2}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                                            <MessageCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Voice Notes</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Record heartfelt audio messages that play when they tap on memories.
                                        </p>
                                    </div>
                                </motion.div>
                            </RevealOnScroll>

                            {/* Time Capsule Card */}
                            <RevealOnScroll delay={0.3}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-orange-900/40 to-amber-900/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Time Capsules</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Schedule messages that unlock at specific hours throughout their day.
                                        </p>
                                    </div>
                                </motion.div>
                            </RevealOnScroll>

                            {/* Lock Until Day Card */}
                            <RevealOnScroll delay={0.4}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-rose-900/40 to-pink-900/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
                                            <Lock className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Countdown Lock</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Keep it secret with a beautiful countdown until the big reveal day.
                                        </p>
                                    </div>
                                </motion.div>
                            </RevealOnScroll>

                            {/* Collaborate Card */}
                            <RevealOnScroll delay={0.5}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Invite Friends</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Share a link. Everyone contributes. One amazing surprise.
                                        </p>
                                    </div>
                                </motion.div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-32 px-6 relative">
                    <div className="max-w-4xl mx-auto">
                        <RevealOnScroll>
                            <div className="text-center mb-20">
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Three simple steps
                                </h2>
                                <p className="text-xl text-gray-400">
                                    Creating a memory capsule takes less than a minute
                                </p>
                            </div>
                        </RevealOnScroll>

                        <div className="space-y-16">
                            {[
                                { num: "01", title: "Create your capsule", desc: "Enter their name, set the unlock date, and get a shareable link in seconds." },
                                { num: "02", title: "Invite contributors", desc: "Share the link with friends and family. Everyone adds photos, voice notes, and wishes." },
                                { num: "03", title: "They open on the big day", desc: "On their birthday, they unlock each memory by solving personal riddles." }
                            ].map((step, i) => (
                                <RevealOnScroll key={i} delay={i * 0.1}>
                                    <div className="flex gap-8 items-start">
                                        <div className="flex-shrink-0">
                                            <span className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {step.num}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                                            <p className="text-gray-400 text-lg">{step.desc}</p>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Create Form Section */}
                <section id="create-form" className="py-32 px-6">
                    <div className="max-w-xl mx-auto">
                        <RevealOnScroll>
                            <motion.div
                                className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden"
                                whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                {/* Glow effect */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="text-center mb-8">
                                        <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                                        <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            Create Your Capsule
                                        </h2>
                                        <p className="text-gray-400">Free forever. No account needed.</p>
                                    </div>

                                    <form onSubmit={handleCreateEvent} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-purple-400" /> Who's the star?
                                            </label>
                                            <Input
                                                placeholder="Their name..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Age turning</label>
                                                <Input
                                                    type="number"
                                                    placeholder="25"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value)}
                                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Unlock date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={birthdayDate}
                                                    onChange={(e) => setBirthdayDate(e.target.value)}
                                                    className="h-12 bg-white/5 border-white/10 text-white focus:border-purple-500 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Your unique link</label>
                                            <div className="flex items-center">
                                                <span className="h-12 px-4 flex items-center bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-gray-500 text-sm">
                                                    /e/
                                                </span>
                                                <Input
                                                    placeholder="rahul-25th"
                                                    value={eventName}
                                                    onChange={(e) => setEventName(e.target.value)}
                                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-l-none rounded-r-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
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
                                    </form>
                                </div>
                            </motion.div>
                        </RevealOnScroll>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-16 px-6 border-t border-white/5">
                    <div className="max-w-6xl mx-auto text-center">
                        <p className="text-gray-500 text-sm">
                            Made with ❤️ for celebrating those who matter most
                        </p>
                        <p className="text-gray-600 text-xs mt-2">
                            © 2025 Timeless Memories. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
