import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ThemeSelector from '@/components/ThemeSelector';
import PhotoEffects from '@/components/PhotoEffects';
import PhotoContainer from '@/components/PhotoContainer';
import WishForm from '@/components/WishForm';
import WishesDisplay from '@/components/WishesDisplay';
import TimeCapsule from '@/components/TimeCapsule';
import Footer from '@/components/Footer';
import Confetti from '@/components/Confetti';
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
  const [themeMode, setThemeMode] = useState<string>('normal');
  const [themeClass, setThemeClass] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(true);
  const [isDeepFried, setIsDeepFried] = useState<boolean>(false);
  const [isGlitched, setIsGlitched] = useState<boolean>(false);
  const [photoEffects, setPhotoEffects] = useState({
    shake: false,
    spin: false,
  });
  const [konamiDialogOpen, setKonamiDialogOpen] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [wishRefreshTrigger, setWishRefreshTrigger] = useState(0);
  
  // Initial confetti when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Set theme class based on theme mode
  useEffect(() => {
    switch (themeMode) {
      case 'vaporwave':
        setThemeClass('vaporwave');
        document.body.className = 'font-sans vaporwave';
        break;
      case 'matrix':
        setThemeClass('matrix');
        document.body.className = 'font-mono matrix';
        break;
      case 'nineties':
        setThemeClass('nineties');
        document.body.className = 'font-sans nineties';
        break;
      default:
        setThemeClass('');
        document.body.className = 'font-sans bg-background text-foreground';
        break;
    }
  }, [themeMode]);
  
  // Handle photo effects
  const handleEffectClick = (effectId: string) => {
    switch (effectId) {
      case 'deep-fried':
        setIsDeepFried(!isDeepFried);
        break;
      case 'glitch':
        setIsGlitched(!isGlitched);
        break;
      case 'shake':
        setPhotoEffects(prev => ({ ...prev, shake: true }));
        break;
      case 'spin':
        setPhotoEffects(prev => ({ ...prev, spin: true }));
        // Auto reset spin after animation completes
        setTimeout(() => {
          setPhotoEffects(prev => ({ ...prev, spin: false }));
        }, 3000);
        break;
      case 'confetti':
        setShowConfetti(true);
        break;
      default:
        break;
    }
  };
  
  // Clear temporary effects
  const clearEffects = () => {
    setPhotoEffects({
      shake: false,
      spin: false
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
      <Header themeClass={themeClass} />
      <ThemeSelector setThemeMode={setThemeMode} />
      <PhotoEffects onEffectClick={handleEffectClick} />
      
      <PhotoContainer 
        isDeepFried={isDeepFried} 
        isGlitched={isGlitched} 
        photoEffects={photoEffects}
        clearEffects={clearEffects}
      />
      
      <WishForm onWishAdded={handleWishAdded} />
      <WishesDisplay refreshTrigger={wishRefreshTrigger} />
      <TimeCapsule themeClass={themeClass} />
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
    </div>
  );
};

export default Home;
