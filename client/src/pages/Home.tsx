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

const Home = () => {
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState<boolean>(true);
  const [konamiDialogOpen, setKonamiDialogOpen] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [userAge, setUserAge] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fetch photos from API
  const { data: photosData } = useQuery({
    queryKey: ["user-photos"],
    queryFn: async () => {
      const res = await fetch("/api/user-photos");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Check if time capsule has messages
  const { data: capsuleData } = useQuery({
    queryKey: ["time-capsule-messages"],
    queryFn: async () => {
      const res = await fetch("/api/time-capsule-messages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const photos: Photo[] = photosData?.photos || [];
  const hasCapsuleMessages = (capsuleData?.messages || []).length > 0;

  // Get verified age and name from localStorage
  useEffect(() => {
    const verifiedAge = localStorage.getItem("verified_age");
    const birthdayName = localStorage.getItem("birthday_person_name");
    if (verifiedAge) {
      setUserAge(parseInt(verifiedAge) || 0);
      setShowConfetti(true);
    }
    if (birthdayName) {
      setUserName(birthdayName);
    }
  }, []);

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

      {/* Age Badge */}
      <div className="fixed top-4 left-4 z-40 bg-white p-2 rounded-full shadow-lg border-2 border-pink-200">
        <div className="handwritten text-sm text-red-500 animate-pulse">
          Age: {userAge} {userAge > 50 ? '👴' : userAge > 30 ? '👨‍🦳' : '🧑'}
        </div>
      </div>

      {/* Header with name */}
      <header className="text-center pt-16 pb-8 px-4">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl md:text-5xl font-bold handwritten text-pink-600 mb-2"
        >
          🎉 Happy Birthday{userName ? `, ${userName}` : ""}! 🎉
        </motion.h1>
        <p className="text-xl handwritten text-purple-600">Ek saal aur bada ho gaya! 🎂</p>
      </header>

      {/* Floating Balloons */}
      <div className="fixed pointer-events-none z-0">
        {['🎈', '🎈', '🎈', '🎈', '🎈'].map((balloon, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{ left: `${10 + i * 20}%`, top: '100vh' }}
            animate={{
              y: [0, -window.innerHeight - 100],
              x: [0, Math.sin(i) * 50, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "linear"
            }}
          >
            {balloon}
          </motion.div>
        ))}
      </div>

      {/* Scattered birthday text - MORE! */}
      <div className="absolute top-32 left-8 rotate-[-15deg] z-10 hidden md:block">
        <motion.div
          className="text-xl handwritten text-purple-600 font-bold"
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Budha ho gaya! 😜
        </motion.div>
      </div>

      <div className="absolute top-20 right-16 rotate-[8deg] z-10 hidden md:block">
        <motion.div
          className="text-xl handwritten text-orange-500 font-bold"
          animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          Party time! 🎊
        </motion.div>
      </div>

      <div className="absolute top-48 right-8 rotate-[-5deg] z-10 hidden lg:block">
        <motion.div
          className="text-lg handwritten text-green-600 font-bold"
          animate={{ rotate: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Janamdin mubarak! 🥳
        </motion.div>
      </div>

      <div className="absolute bottom-32 left-10 rotate-[10deg] z-10 hidden md:block">
        <motion.div
          className="text-xl handwritten text-red-500 font-bold"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Cake khao! 🍰
        </motion.div>
      </div>

      <div className="absolute bottom-48 right-20 rotate-[-8deg] z-10 hidden lg:block">
        <motion.div
          className="text-lg handwritten text-indigo-600 font-bold"
          animate={{ x: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Tum jiyo hazaro saal! ✨
        </motion.div>
      </div>

      <div className="absolute top-64 left-1/4 rotate-[5deg] z-10 hidden xl:block">
        <motion.div
          className="text-2xl handwritten text-pink-500 font-bold"
          animate={{ y: [-3, 3, -3], scale: [1, 1.05, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          🎁 Gift kahan hai? 🎁
        </motion.div>
      </div>

      {/* Floating confetti decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {['🎊', '⭐', '✨', '🌟', '💫', '🎉'].map((emoji, i) => (
          <motion.div
            key={`confetti-${i}`}
            className="absolute text-2xl opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
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
                {/* Main Photo */}
                <div className="relative aspect-[4/3] max-w-2xl mx-auto mb-4 overflow-hidden rounded-lg shadow-lg bg-gray-100">
                  <motion.img
                    key={currentPhotoIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={photos[currentPhotoIndex]?.src}
                    alt="Memory"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `rotate(${photos[currentPhotoIndex]?.rotation || 0}deg)`
                    }}
                  />

                  {/* Voice Note Button */}
                  {photos[currentPhotoIndex]?.voiceNote && (
                    <button
                      onClick={() => playVoiceNote(
                        photos[currentPhotoIndex].id,
                        photos[currentPhotoIndex].voiceNote!
                      )}
                      className="absolute bottom-4 right-4 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                    >
                      {playingVoice === photos[currentPhotoIndex].id ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </button>
                  )}

                  {/* Contributor name */}
                  {photos[currentPhotoIndex]?.contributorName && (
                    <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full shadow">
                      <span className="handwritten text-sm text-gray-700">
                        From: {photos[currentPhotoIndex].contributorName}
                      </span>
                    </div>
                  )}

                  {/* Navigation arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      >
                        ◀
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      >
                        ▶
                      </button>
                    </>
                  )}
                </div>

                {/* Photo counter */}
                <div className="text-center">
                  <span className="handwritten text-gray-600">
                    {currentPhotoIndex + 1} / {photos.length}
                  </span>
                </div>
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
              <WishesDisplay refreshTrigger={0} />
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
              <TimeCapsuleViewer />
            </div>
          </section>
        )}
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
