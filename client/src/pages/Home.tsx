import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { toast } = useToast();
  const [themeClass, setThemeClass] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(true);
  const [isDeepFried, setIsDeepFried] = useState<boolean>(false);
  const [isGlitched, setIsGlitched] = useState<boolean>(false);
  const [photoEffects, setPhotoEffects] = useState<{shake: boolean; spin: boolean}>({
    shake: false,
    spin: false
  });
  const [konamiDialogOpen, setKonamiDialogOpen] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [wishRefreshTrigger, setWishRefreshTrigger] = useState(0);
  const [showAgeVerification, setShowAgeVerification] = useState<boolean>(true);
  const [userAge, setUserAge] = useState<number>(0);
  
  // Initial confetti when page loads after age verification
  useEffect(() => {
    if (!showAgeVerification) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showAgeVerification]);
  
  // Simple effects for the PhotoCarousel
  const toggleDeepFried = () => {
    setIsDeepFried(prev => !prev);
  };
  
  const toggleGlitch = () => {
    setIsGlitched(prev => !prev);
  };
  
  // Handle age verification completion
  const handleAgeVerificationComplete = (age: number) => {
    setUserAge(age);
    setShowAgeVerification(false);
    setShowConfetti(true);
    
    // Show age-related toast message
    toast({
      title: `Congrats on turning ${age}!`,
      description: age > 30 ? "You're practically a fossil now!" : "Still young, but aging rapidly!",
      variant: "default",
    });
  };
  
  // Handle wish added
  const handleWishAdded = () => {
    setWishRefreshTrigger(prev => prev + 1);
  };
  
  // Handle photo effect changes
  const handlePhotoEffectChange = (effectId: string) => {
    if (effectId === 'shake') {
      setPhotoEffects(prev => ({ ...prev, shake: !prev.shake }));
    } else if (effectId === 'spin') {
      setPhotoEffects(prev => ({ ...prev, spin: !prev.spin }));
    } else if (effectId === 'deep-fry') {
      setIsDeepFried(prev => !prev);
    } else if (effectId === 'glitch') {
      setIsGlitched(prev => !prev);
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
  
  // Setup Konami code detection
  useKonamiCode(handleKonamiCode);
  
  return (
    <div className={konamiActive ? 'rainbow-bg min-h-screen' : 'min-h-screen'}>
      {showAgeVerification ? (
        <AgeVerification onComplete={handleAgeVerificationComplete} />
      ) : (
        <>
          <Header themeClass={themeClass} />
          
          {/* Birthday-themed text sprinkled around - Reduced for better spacing */}
          <div className="absolute top-24 left-8 rotate-[-15deg] z-10">
            <motion.div 
              className="text-xl handwritten text-purple-600 font-bold"
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Ek saal aur khatam!!
            </motion.div>
          </div>
          
          <div className="absolute top-12 right-16 rotate-[-8deg] z-10">
            <motion.div 
              className="text-xl handwritten text-orange-500 font-bold"
              animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              Kitne saal ka hua re tu?
            </motion.div>
          </div>
          
          {/* BOTTOM SECTION messages */}
          <div className="absolute bottom-20 left-20 rotate-[-5deg] z-10">
            <motion.div 
              className="text-xl handwritten text-red-500 font-bold"
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Buddha ho gaya tu!
            </motion.div>
          </div>
          
          <div className="absolute bottom-48 left-1/2 rotate-[8deg] z-10">
            <motion.div 
              className="text-2xl handwritten text-indigo-600 font-bold"
              animate={{ x: [0, 10, 0, -10, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4.5, repeat: Infinity }}
            >
              Janamdin ki shubhkamnayein!
            </motion.div>
          </div>
          
          {/* Main content */}
          <main className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <PhotoCarousel 
                  isDeepFried={isDeepFried} 
                  isGlitched={isGlitched} 
                />
              </div>
              
              <div className="lg:w-1/2 flex flex-col">
                <div className="mb-6 p-4 bg-white rounded-lg shadow-lg relative notebook-paper">
                  {/* Paper styling */}
                  <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={`note-col-${i}`} className="border-r border-blue-200"></div>
                    ))}
                  </div>
                  <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={`note-row-${i}`} className="border-b border-blue-200"></div>
                    ))}
                  </div>
                  
                  <motion.h2 
                    className="text-2xl handwritten-messy text-center text-blue-900 mb-4 relative z-10"
                    animate={{ rotate: [0, 1, 0, -1, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    Happy Birthday Dude! 🎂
                  </motion.h2>
                  
                  <div className="flex justify-center mb-3">
                    <motion.div
                      className="text-xl handwritten text-red-500 font-bold relative z-10"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      Janamdin ki Shubhkamnayein! 🎊
                    </motion.div>
                  </div>
                  
                  <p className="handwritten text-gray-700 mb-3 relative z-10">
                    Enjoy your special day! Add birthday wishes in the form below and check your time capsule messages throughout the day!
                  </p>
                  
                  <div className="flex justify-between mb-3">
                    <motion.div
                      className="text-lg handwritten text-purple-600 font-bold relative z-10 -rotate-2"
                      animate={{ rotate: [-2, 0, -2], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Budhe ho gaye tum!
                    </motion.div>
                    
                    <motion.div
                      className="text-lg handwritten text-green-600 font-bold relative z-10 rotate-2"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.8, repeat: Infinity }}
                    >
                      Janam Din Manaao!
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="text-center font-bold handwritten text-xl text-pink-600 mt-4"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    PARTY MUBARAK! 🎉
                  </motion.div>
                </div>
                
                {/* Forms and time capsule side by side */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="md:w-1/2">
                    <WishForm onWishAdded={handleWishAdded} />
                  </div>
                  <div className="md:w-1/2">
                    <TimeCapsule themeClass={themeClass} />
                  </div>
                </div>
                
                {/* Sticky notes from friends */}
                <div className="relative bg-white border-2 border-blue-200 rounded-lg p-4 shadow-lg mb-6 min-h-[600px]">
                  <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-20 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={`board-col-${i}`} className="border-r border-blue-200"></div>
                    ))}
                  </div>
                  <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-20 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={`board-row-${i}`} className="border-b border-blue-200"></div>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-bold handwritten text-blue-800 mb-2 relative z-10">
                    Birthday Notes From Your "Friends"
                  </h2>
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="text-lg handwritten text-purple-500 font-bold relative z-10"
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 1, 0, -1, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Dosto ke Janamdin ke Sandesh
                    </motion.div>
                  </div>

                  <div className="relative min-h-[550px]" id="sticky-notes-board">
                    {/* Custom WishesDisplay component will render stickies inside this board */}
                    <WishesDisplay refreshTrigger={wishRefreshTrigger} />
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <Footer themeClass={themeClass} />
          
          <Confetti 
            isActive={showConfetti} 
            onComplete={() => setShowConfetti(false)} 
          />
          
          <Dialog open={konamiDialogOpen} onOpenChange={setKonamiDialogOpen}>
            <DialogContent className="bg-black bg-opacity-80 text-white">
              <DialogHeader>
                <DialogTitle className="text-4xl rainbow-text font-bold text-center">KONAMI CODE ACTIVATED!</DialogTitle>
                <DialogDescription className="text-2xl mt-4 text-center text-white">
                  YOU ARE GAMING ROYALTY!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-center">
                <Button 
                  onClick={() => {
                    setKonamiDialogOpen(false);
                    setTimeout(() => setKonamiActive(false), 500);
                  }}
                  className="mt-6 bg-lime-400 text-black px-4 py-2 rounded"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Display user age in a fun way */}
          <div className="fixed top-4 left-4 z-40 bg-white p-2 rounded-full shadow-lg">
            <div className="handwritten-messy text-sm text-red-500 animate-pulse">
              Age: {userAge} {userAge > 50 ? '👴' : userAge > 30 ? '👨‍🦳' : '🧑'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
