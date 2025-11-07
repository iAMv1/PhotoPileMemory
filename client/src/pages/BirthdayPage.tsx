import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useAuth, User } from '@/lib/auth';
import Header from '@/components/Header';
import PhotoCarousel from '@/components/PhotoCarousel';
import WishForm from '@/components/WishForm';
import WishesDisplay from '@/components/WishesDisplay';
import TimeCapsule from '@/components/TimeCapsule';
import Footer from '@/components/Footer';
import Confetti from '@/components/Confetti';
import AgeVerification from '@/components/AgeVerification';
import useKonamiCode from '@/hooks/useKonamiCode';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Settings, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function BirthdayPage() {
  const [, params] = useRoute('/birthday/:username');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated } = useAuth();
  const username = params?.username;

  const [themeClass, setThemeClass] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(true);
  const [isDeepFried, setIsDeepFried] = useState<boolean>(false);
  const [isGlitched, setIsGlitched] = useState<boolean>(false);
  const [photoEffects, setPhotoEffects] = useState<{ shake: boolean; spin: boolean }>({
    shake: false,
    spin: false,
  });
  const [konamiDialogOpen, setKonamiDialogOpen] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [wishRefreshTrigger, setWishRefreshTrigger] = useState(0);
  const [showAgeVerification, setShowAgeVerification] = useState<boolean>(true);
  const [userAge, setUserAge] = useState<number>(0);

  // Fetch user profile
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: [`/api/users/${username}`],
    queryFn: async () => {
      return await apiRequest<{ user: User }>(`/api/users/${username}`);
    },
    enabled: !!username,
  });

  const birthdayUser = profileData?.user;
  const isOwner = isAuthenticated && currentUser?.id === birthdayUser?.id;

  // Apply custom theme color
  useEffect(() => {
    if (birthdayUser?.themeColor) {
      document.documentElement.style.setProperty('--primary', birthdayUser.themeColor);
    }
  }, [birthdayUser?.themeColor]);

  // Initial confetti when page loads after age verification
  useEffect(() => {
    if (!showAgeVerification) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAgeVerification]);

  // Handle age verification completion
  const handleAgeVerificationComplete = (age: number) => {
    setUserAge(age);
    setShowAgeVerification(false);
    setShowConfetti(true);

    toast({
      title: `Congrats on turning ${age}!`,
      description: age > 30 ? "You're practically a fossil now!" : "Still young, but aging rapidly!",
      variant: "default",
    });
  };

  // Handle wish added
  const handleWishAdded = () => {
    setWishRefreshTrigger((prev) => prev + 1);
  };

  // Handle photo effect changes
  const handlePhotoEffectChange = (effectId: string) => {
    if (effectId === 'shake') {
      setPhotoEffects((prev) => ({ ...prev, shake: !prev.shake }));
    } else if (effectId === 'spin') {
      setPhotoEffects((prev) => ({ ...prev, spin: !prev.spin }));
    } else if (effectId === 'deep-fry') {
      setIsDeepFried((prev) => !prev);
    } else if (effectId === 'glitch') {
      setIsGlitched((prev) => !prev);
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
      variant: "default",
    });
  };

  useKonamiCode(handleKonamiCode);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="text-white text-2xl">Loading birthday page...</div>
      </div>
    );
  }

  // Error state
  if (error || !birthdayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find a birthday page for "{username}"
          </p>
          <Link href="/register">
            <Button>Create Your Own Birthday Page</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Age verification screen
  if (showAgeVerification) {
    return <AgeVerification onComplete={handleAgeVerificationComplete} />;
  }

  return (
    <div className={`min-h-screen bg-dark text-light ${themeClass} ${konamiActive ? 'rainbow-bg' : ''}`}>
      {showConfetti && <Confetti isActive={showConfetti} />}

      <Header themeClass={themeClass} />

      <main className="container mx-auto px-4 py-8">
        {/* User Info Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🎉 Happy Birthday {birthdayUser.displayName || birthdayUser.username}! 🎉
          </motion.h1>

          {birthdayUser.customMessage && (
            <motion.p
              className="text-xl text-gray-300 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {birthdayUser.customMessage}
            </motion.p>
          )}

          {isOwner && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Page
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{birthdayUser.viewCount || 0} views</span>
              </div>
            </div>
          )}
        </div>

        {/* Photo Carousel */}
        <section className="mb-12">
          <PhotoCarousel
            isDeepFried={isDeepFried}
            isGlitched={isGlitched}
            userId={birthdayUser.id}
          />
        </section>

        {/* Time Capsule */}
        <section className="mb-12">
          <TimeCapsule userId={birthdayUser.id} />
        </section>

        {/* Birthday Wishes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Birthday Wishes 💌</h2>
          <WishForm onWishAdded={handleWishAdded} userId={birthdayUser.id} />
          <WishesDisplay refreshTrigger={wishRefreshTrigger} userId={birthdayUser.id} />
        </section>
      </main>

      <Footer themeClass={themeClass} />

      {/* Konami Code Dialog */}
      <Dialog open={konamiDialogOpen} onOpenChange={setKonamiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎮 KONAMI CODE UNLOCKED! 🎮</DialogTitle>
            <DialogDescription>
              You've discovered the secret! The rainbow background is now activated. You're a true gamer!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setKonamiDialogOpen(false)}>Awesome!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
