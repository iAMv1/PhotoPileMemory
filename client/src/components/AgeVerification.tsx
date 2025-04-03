import { useState, useEffect, FC } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface AgeVerificationProps {
  onComplete: (age: number) => void;
}

const AgeVerification: FC<AgeVerificationProps> = ({ onComplete }) => {
  const [age, setAge] = useState<string>('');
  const [showJumpscare, setShowJumpscare] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [parsedAge, setParsedAge] = useState<number>(0);
  const [jumpscareEnded, setJumpscareEnded] = useState<boolean>(false);
  
  // Create audio elements
  useEffect(() => {
    // Background eerie sound
    const backgroundAudio = new Audio('https://freesound.org/data/previews/457/457045_8494851-lq.mp3');
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.2;
    
    // Jumpscare sound
    const jumpscareAudio = new Audio('https://freesound.org/data/previews/404/404048_140737-lq.mp3');
    jumpscareAudio.volume = 0.8;
    
    if (showJumpscare) {
      backgroundAudio.play();
      jumpscareAudio.play();
      
      // Stop background audio after jumpscare is complete
      setTimeout(() => {
        backgroundAudio.pause();
      }, 5000);
    }
    
    return () => {
      backgroundAudio.pause();
      jumpscareAudio.pause();
    };
  }, [showJumpscare]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAge = parseInt(age, 10);
    
    if (isNaN(numAge) || numAge <= 0 || numAge > 120) {
      alert('Please enter a valid age!');
      return;
    }
    
    setParsedAge(numAge);
    setShowJumpscare(true);
    
    // After jumpscare animation completes
    setTimeout(() => {
      setJumpscareEnded(true);
    }, 4000);
  };
  
  const handleJumpscareClick = () => {
    setClickCount(prev => prev + 1);
    
    // If user has clicked the jumpscare the number of times equal to their age
    if (clickCount + 1 >= parsedAge) {
      setTimeout(() => {
        onComplete(parsedAge);
      }, 500);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-notebook">
      {!showJumpscare ? (
        <div className="max-w-md w-full p-8 bg-white shadow-lg rounded notebook-paper relative">
          {/* Paper styling */}
          <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`age-col-${i}`} className="border-r border-blue-200"></div>
            ))}
          </div>
          <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`age-row-${i}`} className="border-b border-blue-200"></div>
            ))}
          </div>
          
          <h2 className="text-3xl handwritten text-center mb-8 text-blue-900 relative z-10">
            How old are you today?
          </h2>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="flex flex-col space-y-4">
              <Input
                type="number"
                placeholder="Enter your age..."
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="handwritten-input text-center text-xl p-4"
                min="1"
                max="120"
                required
              />
              
              <Button 
                type="submit" 
                className="w-full mt-4 bg-amber-100 text-blue-900 font-bold py-6 px-4 border-2 border-amber-300 hover:bg-amber-200 transition-colors handwritten text-xl"
              >
                CONFIRM
              </Button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                * please enter your age to continue to your birthday card *
              </p>
            </div>
          </form>
        </div>
      ) : (
        <div 
          className={`fixed inset-0 ${jumpscareEnded ? 'bg-black' : 'bg-red-900'} flex items-center justify-center z-50 cursor-pointer`}
          onClick={handleJumpscareClick}
        >
          {!jumpscareEnded ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0.8, 1.2, 1],
                opacity: [0, 1, 1, 1, 1]
              }}
              transition={{ 
                duration: 1,
                times: [0, 0.2, 0.5, 0.8, 1]
              }}
              className="text-center"
            >
              <motion.h1 
                className="text-8xl font-bold text-white mb-4"
                animate={{ 
                  scale: [1, 1.5, 1, 1.8, 1],
                  color: ['#ffffff', '#ff0000', '#ffffff', '#ff0000', '#ffffff']
                }}
                transition={{ duration: 2, repeat: 2, repeatType: "reverse" }}
              >
                BOO!
              </motion.h1>
              <motion.p 
                className="text-4xl text-white handwritten"
                animate={{ 
                  y: [0, -20, 0, -30, 0],
                  opacity: [1, 0.8, 1, 0.8, 1]
                }}
                transition={{ duration: 2, repeat: 2 }}
              >
                You're ANCIENT!
              </motion.p>
            </motion.div>
          ) : (
            <div className="text-center p-8">
              <h2 className="text-4xl text-white handwritten mb-4">
                Click {parsedAge} times to enter...
              </h2>
              <p className="text-white text-2xl">
                Clicks: {clickCount} / {parsedAge}
              </p>
              <div className="mt-8 text-red-500 text-xl animate-pulse">
                Every click brings you closer to accepting your age...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgeVerification;