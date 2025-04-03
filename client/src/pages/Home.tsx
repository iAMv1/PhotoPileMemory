import { useState, useEffect } from 'react';
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
          
          {/* Main content */}
          <main className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-3/4">
                <PhotoCarousel 
                  isDeepFried={isDeepFried} 
                  isGlitched={isGlitched} 
                />
                
                <WishForm onWishAdded={handleWishAdded} />
              </div>
              
              <div className="lg:w-1/4 flex flex-col items-end">
                <TimeCapsule themeClass={themeClass} />
              </div>
            </div>
          </main>
          
          <Footer themeClass={themeClass} />
          
          {/* Floating elements */}
          <WishesDisplay refreshTrigger={wishRefreshTrigger} />
          
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
