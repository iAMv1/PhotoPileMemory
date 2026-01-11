import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import WishesDisplay from '@/components/WishesDisplay';
import { TimeCapsuleViewer } from '@/components/TimeCapsuleViewer';
import Footer from '@/components/Footer';
import Confetti from '@/components/Confetti';
import useKonamiCode from '@/hooks/useKonamiCode';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Photo {
    id: number;
    src: string;
    contributorName?: string;
    voiceNote?: string;
    memoryClue?: string;
    rotation?: number;
}

const Home = ({ eventId }: { eventId?: string }) => {
    const { toast } = useToast();
    const [showConfetti, setShowConfetti] = useState<boolean>(true);
    const [konamiDialogOpen, setKonamiDialogOpen] = useState(false);
    const [konamiActive, setKonamiActive] = useState(false);
    const [userAge, setUserAge] = useState<number>(0);
    const [userName, setUserName] = useState<string>("");
    const [playingVoice, setPlayingVoice] = useState<number | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Fetch photos from API - Only show gallery photos (not maze photos)
    const { data: photosData } = useQuery({
        queryKey: ["user-photos", eventId, "gallery"],
        queryFn: async () => {
            // If no eventId, return empty or handle demo?
            if (!eventId) return { photos: [] };
            const res = await fetch(`/api/user-photos?eventId=${eventId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            // Filter to only show gallery photos (isGlitched = false)
            return {
                photos: (data.photos || []).filter((p: any) => p.isGlitched === false)
            };
        },
        enabled: !!eventId
    });

    // Check if time capsule has messages
    const { data: capsuleData } = useQuery({
        queryKey: ["time-capsule-messages", eventId],
        queryFn: async () => {
            if (!eventId) return { messages: [] };
            const res = await fetch(`/api/time-capsule-messages?eventId=${eventId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!eventId
    });

    const photos: Photo[] = photosData?.photos || [];
    const hasCapsuleMessages = (capsuleData?.messages || []).length > 0;

    // Get verified age and name from localStorage
    useEffect(() => {
        const ageKey = eventId ? `verified_age_${eventId}` : "verified_age";
        const nameKey = eventId ? `birthday_person_name_${eventId}` : "birthday_person_name";

        const verifiedAge = localStorage.getItem(ageKey);
        const birthdayName = localStorage.getItem(nameKey);

        if (verifiedAge) {
            setUserAge(parseInt(verifiedAge) || 0);
            setShowConfetti(true);
        }
        if (birthdayName) {
            setUserName(birthdayName);
        }
    }, [eventId]);

    // Auto-hide confetti after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Play voice note
    const playVoiceNote = (photoId: number, voiceNote: string) => {
        if (playingVoice === photoId) {
            setPlayingVoice(null);
            return;
        }
        setPlayingVoice(photoId);
        const audio = new Audio(voiceNote);
        audio.onended = () => setPlayingVoice(null);
        audio.play();
    };

    // Photo navigation
    const nextPhoto = () => {
        if (photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
        }
    };

    const prevPhoto = () => {
        if (photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        }
    };

    // Konami code handler
    const handleKonamiCode = () => {
        setKonamiDialogOpen(true);
        setKonamiActive(true);
        setShowConfetti(true);
        toast({
            title: "KONAMI CODE ACTIVATED!",
            description: "YOU ARE GAMING ROYALTY!",
        });
    };

    useKonamiCode(handleKonamiCode);

    return (
        <div className={`min-h-screen bg-amber-50 ${konamiActive ? 'rainbow-bg' : ''}`}>
            <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

            {/* Age Badge - Enhanced with glow */}
            <motion.div
                className="fixed top-4 left-4 z-40 bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-full shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 }}
            >
                <div className="handwritten text-sm text-white font-bold">
                    {userAge} years {userAge > 50 ? '👴' : userAge > 30 ? '🧓' : '🧑‍🎂'}
                </div>
            </motion.div>

            {/* Enhanced Cinematic Hero Section with 3D Perspective */}
            <header className="text-center pt-20 pb-16 px-4 relative overflow-hidden" style={{ perspective: '1000px' }}>

                {/* Layered background rings for depth */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={`ring-${i}`}
                            className="absolute rounded-full border-2 border-pink-300/30"
                            style={{
                                width: `${200 + i * 100}px`,
                                height: `${200 + i * 100}px`,
                            }}
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.2, 0.4, 0.2],
                                rotateX: [0, 10, 0],
                            }}
                            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
                        />
                    ))}
                </div>

                {/* Particle burst on load */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(16)].map((_, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute text-3xl"
                            style={{
                                left: '50%',
                                top: '50%',
                            }}
                            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                            animate={{
                                x: Math.cos(i * 22.5 * Math.PI / 180) * (120 + Math.random() * 80),
                                y: Math.sin(i * 22.5 * Math.PI / 180) * (120 + Math.random() * 80),
                                opacity: 0,
                                scale: [0, 1.8, 0],
                                rotate: [0, 180]
                            }}
                            transition={{ duration: 2, delay: 0.1 + i * 0.05 }}
                        >
                            {['🎉', '⭐', '✨', '🎊', '💫', '🌟', '🎈', '🎁'][i % 8]}
                        </motion.div>
                    ))}
                </div>

                {/* 3D Layered Title Container */}
                <motion.div
                    className="relative z-10"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateX: [0, 5, 0],
                        rotateY: [0, 3, 0, -3, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Shadow layer for 3D effect */}
                    <motion.div
                        className="absolute inset-0 text-5xl md:text-7xl font-black blur-sm opacity-30"
                        style={{ transform: 'translateZ(-20px) translateY(5px)' }}
                    >
                        <span className="text-purple-900">🎉 Happy Birthday 🎉</span>
                    </motion.div>

                    {/* Main Title with gradient */}
                    <motion.h1
                        initial={{ scale: 0, rotateX: -90 }}
                        animate={{ scale: 1, rotateX: 0 }}
                        transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-4 relative"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 drop-shadow-lg">
                            🎉 Happy Birthday 🎉
                        </span>
                    </motion.h1>
                </motion.div>

                {/* Name with bounce entrance */}
                {userName && (
                    <motion.h2
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                        className="text-4xl md:text-6xl font-bold handwritten text-purple-700 mb-4 relative z-10"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {userName}! 🥳
                        </motion.span>
                    </motion.h2>
                )}

                {/* Playful roast based on age */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="text-xl md:text-2xl handwritten text-pink-600 relative z-10"
                >
                    {userAge > 40
                        ? "Arre wah, abhi toh party shuru hui hai! 🥳"
                        : userAge > 30
                            ? "30+ club mein welcome! 🎂"
                            : userAge > 25
                                ? "Quarter life crisis ke baad bhi mast! 😎"
                                : "Abhi toh baccha hai! 👶"}
                </motion.p>

                {/* Floating emojis around title - more of them */}
                {['🎂', '🎁', '🎈', '🧁', '🍰', '🥳'].map((emoji, i) => (
                    <motion.span
                        key={`float-${i}`}
                        className="absolute text-3xl md:text-4xl"
                        style={{
                            top: `${10 + (i % 3) * 25}%`,
                            left: i < 3 ? `${5 + i * 5}%` : 'auto',
                            right: i >= 3 ? `${5 + (i - 3) * 5}%` : 'auto',
                        }}
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                    >
                        {emoji}
                    </motion.span>
                ))}
            </header>

            {/* Floating Balloons - Evenly distributed left and right */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'].map((balloon, i) => (
                    <motion.div
                        key={`balloon-${i}`}
                        className="absolute text-4xl"
                        style={{
                            left: i % 2 === 0 ? `${5 + (i * 5)}%` : `${85 - (i * 5)}%`,
                            top: '100vh'
                        }}
                        animate={{
                            y: [0, -window.innerHeight - 200],
                            x: [0, Math.sin(i * 0.5) * 30, 0],
                            rotate: [0, 15, -15, 0]
                        }}
                        transition={{
                            duration: 10 + (i % 3) * 2,
                            repeat: Infinity,
                            delay: i * 2,
                            ease: "linear"
                        }}
                    >
                        {balloon}
                    </motion.div>
                ))}
            </div>


            {/* Hindi Birthday Slangs - Multiple positions for rich decoration */}
            {/* Top decorative banner */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 z-0 justify-between px-4 py-2 pointer-events-none">
                <motion.span
                    className="text-lg handwritten text-purple-500 font-bold"
                    animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                >
                    Budha ho gaya! 😜
                </motion.span>
                <motion.span
                    className="text-lg handwritten text-orange-500 font-bold"
                    animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                    Party hard! 🎊
                </motion.span>
                <motion.span
                    className="text-lg handwritten text-green-600 font-bold hidden lg:block"
                    animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
                >
                    Janamdin mubarak! 🥳
                </motion.span>
                <motion.span
                    className="text-lg handwritten text-cyan-500 font-bold hidden xl:block"
                    animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2.6, repeat: Infinity, delay: 1.5 }}
                >
                    Bade ho gaye! 🧓
                </motion.span>
            </div>

            {/* Bottom decorative banner */}
            <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-0 justify-between px-4 py-2 pointer-events-none">
                <motion.span
                    className="text-lg handwritten text-red-500 font-bold"
                    animate={{ y: [0, 3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                >
                    Cake khao! 🍰
                </motion.span>
                <motion.span
                    className="text-lg handwritten text-indigo-500 font-bold"
                    animate={{ y: [0, 3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: 0.5 }}
                >
                    Tum jiyo hazaro saal! ✨
                </motion.span>
                <motion.span
                    className="text-lg handwritten text-pink-500 font-bold hidden lg:block"
                    animate={{ y: [0, 3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
                >
                    🎁 Gift kahan hai? 🎁
                </motion.span>
                <motion.span
                    className="text-lg handwritten text-amber-600 font-bold hidden xl:block"
                    animate={{ y: [0, 3, 0], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                    Aur kitne saal? 😂
                </motion.span>
            </div>

            {/* Side scattered slangs - visible on large screens */}
            <div className="fixed left-4 top-1/3 z-0 pointer-events-none hidden lg:block">
                <motion.div
                    className="text-base handwritten text-rose-500 font-bold -rotate-12"
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    Shaadi kab? 💍
                </motion.div>
            </div>

            <div className="fixed right-4 top-2/3 z-0 pointer-events-none hidden lg:block">
                <motion.div
                    className="text-base handwritten text-teal-500 font-bold rotate-12"
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                >
                    Paise nahi milenge! 💸
                </motion.div>
            </div>

            <div className="fixed left-4 bottom-1/3 z-0 pointer-events-none hidden xl:block">
                <motion.div
                    className="text-base handwritten text-violet-500 font-bold rotate-6"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    Daru party! 🍻
                </motion.div>
            </div>

            <div className="fixed right-4 top-1/3 z-0 pointer-events-none hidden xl:block">
                <motion.div
                    className="text-base handwritten text-lime-600 font-bold -rotate-6"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3.8, repeat: Infinity, delay: 1 }}
                >
                    Kya umar hai! 🤣
                </motion.div>
            </div>

            {/* Floating confetti decorations - distributed evenly */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {['🎊', '⭐', '✨', '🌟', '💫', '🎉', '🎈', '🎂', '🥳', '🎁'].map((emoji, i) => (
                    <motion.div
                        key={`confetti-${i}`}
                        className="absolute text-2xl"
                        style={{
                            left: `${8 + (i * 9)}%`,
                            top: `${15 + (i * 8) % 70}%`,
                            opacity: 0.35
                        }}
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 360],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{
                            duration: 6 + (i % 4),
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </div>


            <main className="container mx-auto px-4 pb-12">
                {/* Photo Gallery - Paper style */}
                <section className="mb-10">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 relative notebook-paper">
                        {/* Paper lines */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-2xl">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="border-b border-blue-300 h-8" />
                            ))}
                        </div>

                        <h2 className="text-2xl handwritten text-blue-800 mb-4 relative z-10">
                            📸 Memories from Friends
                        </h2>

                        {photos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="handwritten text-lg">No photos yet... your friends are lazy! 😴</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Polaroid Frame Container */}
                                <motion.div
                                    className="relative max-w-md mx-auto mb-4"
                                    style={{ transform: `rotate(${(currentPhotoIndex % 2 === 0 ? 2 : -2)}deg)` }}
                                    whileHover={{ rotate: 0, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {/* Tape effect */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/70 opacity-80 z-10" />

                                    {/* Polaroid Frame */}
                                    <div className="bg-white p-3 pb-14 shadow-2xl border border-gray-200">
                                        {/* Photo */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                                            <motion.img
                                                key={currentPhotoIndex}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                src={photos[currentPhotoIndex]?.src}
                                                alt="Memory"
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Voice Note Button */}
                                            {photos[currentPhotoIndex]?.voiceNote && (
                                                <button
                                                    onClick={() => playVoiceNote(
                                                        photos[currentPhotoIndex].id,
                                                        photos[currentPhotoIndex].voiceNote!
                                                    )}
                                                    className="absolute bottom-3 right-3 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                                >
                                                    {playingVoice === photos[currentPhotoIndex].id ? (
                                                        <Pause className="h-5 w-5" />
                                                    ) : (
                                                        <Play className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Polaroid Caption */}
                                        <div className="absolute bottom-2 left-0 right-0 text-center px-4">
                                            <p className="handwritten text-gray-700 text-base">
                                                {photos[currentPhotoIndex]?.contributorName
                                                    ? `From: ${photos[currentPhotoIndex].contributorName} ❤️`
                                                    : "A special memory ❤️"}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Navigation */}
                                {photos.length > 1 && (
                                    <div className="flex justify-center gap-4 mt-4">
                                        <button
                                            onClick={prevPhoto}
                                            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full shadow font-bold"
                                        >
                                            ◀ Prev
                                        </button>
                                        <span className="handwritten text-gray-600 self-center">
                                            {currentPhotoIndex + 1} / {photos.length}
                                        </span>
                                        <button
                                            onClick={nextPhoto}
                                            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full shadow font-bold"
                                        >
                                            Next ▶
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Wishes Board - Scattered sticky notes */}
                <section className="mb-10">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200 relative min-h-[500px]">
                        {/* Cork board texture */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
                            style={{ background: 'repeating-linear-gradient(45deg, #d4a373 0, #d4a373 2px, transparent 2px, transparent 10px)' }}
                        />

                        <h2 className="text-2xl handwritten text-blue-800 mb-4 relative z-10">
                            💌 Birthday Notes from "Friends"
                        </h2>

                        <div className="relative min-h-[400px]">
                            <WishesDisplay refreshTrigger={0} eventId={eventId} />
                        </div>
                    </div>
                </section>

                {/* Time Capsule - Only show if has messages */}
                {hasCapsuleMessages && (
                    <section className="mb-10">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-200">
                            <h2 className="text-2xl handwritten text-amber-800 mb-4">
                                ⏰ Time Capsule Messages
                            </h2>
                            <TimeCapsuleViewer eventId={eventId} />
                        </div>
                    </section>
                )}

                {/* Share Section */}
                <section className="mb-10">
                    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-xl p-8 text-center text-white relative overflow-hidden">
                        {/* Sparkle decorations */}
                        <div className="absolute inset-0 pointer-events-none">
                            {['✨', '💫', '⭐', '🌟'].map((s, i) => (
                                <motion.span
                                    key={i}
                                    className="absolute text-2xl"
                                    style={{ top: `${20 + i * 20}%`, left: `${10 + i * 25}%` }}
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                >
                                    {s}
                                </motion.span>
                            ))}
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-2">🎉 What a Celebration! 🎉</h2>
                            <p className="text-lg opacity-90 mb-6">
                                {userName ? `${userName} is officially ${userAge}!` : `Another year older and wiser!`}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={() => {
                                        navigator.share?.({
                                            title: `${userName}'s Birthday Celebration!`,
                                            text: `Check out this amazing birthday celebration for ${userName}!`,
                                            url: window.location.href
                                        }).catch(() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast({ title: "Link copied!", description: "Share this celebration with friends" });
                                        });
                                    }}
                                    className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition"
                                >
                                    📤 Share Celebration
                                </button>
                                <button
                                    onClick={() => setShowConfetti(true)}
                                    className="bg-white/20 text-white px-6 py-3 rounded-full font-bold border-2 border-white/50 hover:bg-white/30 transition"
                                >
                                    🎊 More Confetti!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer themeClass="" />

            {/* Konami Dialog */}
            <Dialog open={konamiDialogOpen} onOpenChange={setKonamiDialogOpen}>
                <DialogContent className="bg-black/90 text-white border-purple-500">
                    <DialogHeader>
                        <DialogTitle className="text-4xl rainbow-text font-bold text-center">
                            KONAMI CODE!
                        </DialogTitle>
                        <DialogDescription className="text-2xl text-center text-white">
                            YOU ARE GAMING ROYALTY! 🎮
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-center">
                        <Button
                            onClick={() => {
                                setKonamiDialogOpen(false);
                                setTimeout(() => setKonamiActive(false), 500);
                            }}
                            className="bg-purple-500 hover:bg-purple-600"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Home;
