import { useState, useEffect, FC, useCallback } from 'react';
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
  const [jumpscarePhase, setJumpscarePhase] = useState<number>(0);
  const [showTVCountdown, setShowTVCountdown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  
  // TV Countdown effect
  const startCountdown = useCallback(() => {
    setShowTVCountdown(true);
    
    // Start at 10 and count down to 0
    setCountdown(10);
    
    // Create a countdown interval
    const countdownInterval = setInterval(() => {
      setCountdown(prevCount => {
        const newCount = prevCount - 1;
        
        // When countdown reaches 0, clear interval and start jumpscare
        if (newCount <= 0) {
          clearInterval(countdownInterval);
          setShowTVCountdown(false);
          setShowJumpscare(true);
        }
        
        return newCount;
      });
    }, 1000);
    
    // Clean up interval
    return () => clearInterval(countdownInterval);
  }, []);
  
  // Horror video and audio elements
  useEffect(() => {
    if (showJumpscare) {
      try {
        // Background horror ambience
        const backgroundAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
        backgroundAudio.loop = true;
        backgroundAudio.volume = 0.3;
        
        // Jumpscare scream
        const jumpscareAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3");
        jumpscareAudio.volume = 1.0;
        
        // TV static audio
        const staticAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/203/203-preview.mp3");
        staticAudio.volume = 0.3;
        
        // Play sounds
        const audioPromise = backgroundAudio.play();
        if (audioPromise !== undefined) {
          audioPromise.catch(e => {
            console.error("Audio playback prevented by browser:", e);
            // User interaction might be required to play audio
          });
        }
        
        // Play jumpscare sound after a short delay
        setTimeout(() => {
          jumpscareAudio.play().catch(e => {
            console.error("Jumpscare audio playback prevented:", e);
          });
        }, 1000);
        
        // Horror progression
        const phaseTimeline = [
          // Phase 1 - Initial tension
          setTimeout(() => setJumpscarePhase(1), 500),
          // Phase 2 - Build up
          setTimeout(() => setJumpscarePhase(2), 2000),
          // Phase 3 - Jumpscare
          setTimeout(() => setJumpscarePhase(3), 3000),
          // Phase 4 - Aftermath
          setTimeout(() => {
            setJumpscarePhase(4);
            setJumpscareEnded(true);
            backgroundAudio.volume = 0.1;
          }, 4000)
        ];
        
        return () => {
          backgroundAudio.pause();
          jumpscareAudio.pause();
          staticAudio.pause();
          phaseTimeline.forEach(timer => clearTimeout(timer));
        };
      } catch (error) {
        console.error("Error setting up horror experience:", error);
        // Fall back to basic experience if audio fails
        setTimeout(() => setJumpscareEnded(true), 4000);
      }
    }
  }, [showJumpscare]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAge = parseInt(age, 10);
    
    if (isNaN(numAge) || numAge <= 0 || numAge > 120) {
      alert('Please enter a valid age!');
      return;
    }
    
    setParsedAge(numAge);
    // Start countdown instead of directly showing jumpscare
    startCountdown();
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
  
  // Horror imagery and video sources
  const horrorFaces = [
    "https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // eerie figure
    "https://images.unsplash.com/photo-1546190255-451a91afc548?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // creepy mask
    "https://images.unsplash.com/photo-1535124406227-bd755c70d706?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"  // horror character
  ];
  
  // Horror video URL - using Creative Commons horror footage
  const horrorVideoUrl = "https://cdn.pixabay.com/vimeo/382676903/zombie-47262.mp4?width=640&hash=b4af74aab8c37c36ef1a19d78cd353a30cf4580e";
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
      {showTVCountdown ? (
        // TV Countdown effect
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
          <div className="relative w-full max-w-2xl aspect-video bg-black border-8 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
            {/* TV static effect */}
            <div className="absolute inset-0 bg-static z-0"></div>
            
            {/* TV screen with countdown */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              {/* TV static flicker */}
              <motion.div
                className="absolute inset-0 bg-black"
                animate={{ opacity: [0, 0.1, 0, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
              
              {/* TV scan lines */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={`scan-${i}`} 
                    className="w-full h-[2px] bg-white opacity-30"
                    style={{ marginTop: `${i * 10}px` }}
                  ></div>
                ))}
              </div>
              
              {/* Countdown timer */}
              <motion.div
                className="relative z-20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 8px rgba(255, 0, 0, 0.8)",
                    "0 0 16px rgba(255, 0, 0, 0.9)",
                    "0 0 8px rgba(255, 0, 0, 0.8)"
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <h2 className="text-gray-200 text-center mb-4 text-xl">WARNING: HORROR CONTENT</h2>
                <div className="text-red-600 text-8xl font-mono font-bold horror-text">
                  {countdown}
                </div>
                <p className="text-gray-300 text-center mt-8 text-sm">
                  The horror begins in <span className="text-red-500 font-bold">{countdown}</span> seconds...
                </p>
              </motion.div>
            </div>
            
            {/* TV buttons and knobs */}
            <div className="absolute bottom-3 right-4 flex space-x-3">
              <div className="w-5 h-5 rounded-full bg-gray-700"></div>
              <div className="w-5 h-5 rounded-full bg-gray-700"></div>
            </div>
          </div>
        </div>
      ) : !showJumpscare ? (
        // Age entry form
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
        // Horror jumpscare experience
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center z-50 cursor-pointer overflow-hidden"
          onClick={handleJumpscareClick}
        >
          {/* Horror video/animation sequence */}
          {!jumpscareEnded ? (
            <div className="w-full h-full relative">
              {/* Flickering television static effect */}
              <div className="absolute inset-0 bg-static opacity-20 z-10"></div>
              
              {/* Phase 1: Initial tension - Dimly lit room */}
              {jumpscarePhase >= 1 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: jumpscarePhase === 1 ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-full h-full bg-black opacity-80"></div>
                  <motion.p
                    className="absolute text-4xl text-red-600 font-bold"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    Something is coming...
                  </motion.p>
                </motion.div>
              )}
              
              {/* Phase 2: Build up - Horror video */}
              {jumpscarePhase >= 2 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: jumpscarePhase === 2 ? [0, 1, 0.7, 1] : 0
                  }}
                  transition={{ duration: 1, times: [0, 0.3, 0.6, 1] }}
                >
                  {/* Horror video background */}
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute w-full h-full object-cover opacity-70"
                    style={{ filter: "brightness(0.3) contrast(1.2)" }}
                  >
                    <source src={horrorVideoUrl} type="video/mp4" />
                    {/* Fallback image if video doesn't load */}
                    <motion.img
                      src={horrorFaces[0]} 
                      alt="Eerie figure"
                      className="absolute w-full h-full object-cover opacity-50"
                      animate={{
                        scale: [1, 1.05, 1],
                        filter: ["brightness(0.3)", "brightness(0.4)", "brightness(0.3)"]
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    />
                  </video>
                  
                  {/* Red overlay for horror effect */}
                  <motion.div
                    className="absolute inset-0 bg-red-900"
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  
                  {/* Haunting message */}
                  <motion.p
                    className="absolute text-3xl text-red-600 horror-text font-bold z-10"
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    IT SEES YOU
                  </motion.p>
                </motion.div>
              )}
              
              {/* Phase 3: Jumpscare - Monster face appears suddenly with intense effects */}
              {jumpscarePhase >= 3 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: jumpscarePhase === 3 ? 1 : 0,
                    scale: [0.5, 1.2, 1]
                  }}
                  transition={{ duration: 0.3, times: [0, 0.7, 1] }}
                >
                  {/* Background flash effect */}
                  <motion.div
                    className="absolute inset-0 bg-white"
                    animate={{ 
                      opacity: [0, 0.9, 0, 0.6, 0],
                    }}
                    transition={{ 
                      duration: 0.5,
                      times: [0, 0.1, 0.3, 0.4, 0.5],
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main jumpscare face */}
                  <motion.div
                    className="relative z-30 w-full h-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.3, 1.2, 1.4, 1.2],
                    }}
                    transition={{ duration: 0.7, times: [0, 0.2, 0.4, 0.6, 1] }}
                  >
                    <motion.img
                      src={horrorFaces[1]} 
                      alt="Horror face"
                      className="max-w-[80vw] max-h-[80vh] z-30"
                      animate={{
                        scale: [1, 1.3, 1.2],
                        rotate: [0, -3, 3, -2, 0],
                        filter: ["brightness(0.7) contrast(1.2)", "brightness(1.2) contrast(1.7)", "brightness(0.9) contrast(1.5)"]
                      }}
                      transition={{ duration: 0.5, times: [0, 0.25, 0.5, 0.75, 1] }}
                    />
                  </motion.div>
                  
                  {/* Red blood overlay */}
                  <motion.div
                    className="absolute inset-0 bg-red-600 mix-blend-overlay z-20"
                    animate={{ 
                      opacity: [0, 0.9, 0.4, 0.7, 0.2] 
                    }}
                    transition={{ 
                      duration: 0.8, 
                      times: [0, 0.2, 0.4, 0.6, 1] 
                    }}
                  />
                  
                  {/* Shaking effect for the entire screen */}
                  <motion.div
                    className="absolute inset-0 z-10"
                    animate={{
                      x: [0, -10, 15, -15, 10, -5, 0],
                      y: [0, 8, -12, 12, -8, 4, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1]
                    }}
                  />
                  
                  {/* Age taunt message that flashes quickly */}
                  <motion.p
                    className="absolute bottom-16 text-5xl font-bold text-white z-40 horror-text"
                    animate={{ 
                      opacity: [0, 1, 0, 1, 0],
                      scale: [0.8, 1.2, 1, 1.2, 0.9]
                    }}
                    transition={{ 
                      duration: 1,
                      times: [0, 0.2, 0.4, 0.6, 1]
                    }}
                  >
                    {parsedAge} YEARS OLD
                  </motion.p>
                </motion.div>
              )}
            </div>
          ) : (
            // After jumpscare - Click to continue (horror-themed aftermath)
            <div className="text-center p-8 relative">
              {/* Video background for aftermath */}
              <div className="absolute inset-0 overflow-hidden -z-10">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="absolute w-full h-full object-cover opacity-30"
                  style={{ filter: "brightness(0.2) contrast(1.3)" }}
                >
                  <source src={horrorVideoUrl} type="video/mp4" />
                  {/* Fallback image if video doesn't load */}
                  <motion.img
                    src={horrorFaces[2]} 
                    alt="Horror character"
                    className="w-full h-full object-cover"
                    animate={{
                      scale: [1, 1.05, 1],
                      filter: ["brightness(0.3)", "brightness(0.4)", "brightness(0.3)"]
                    }}
                    transition={{ repeat: Infinity, duration: 5 }}
                  />
                </video>
                
                {/* Static overlay */}
                <div className="absolute inset-0 bg-static opacity-10"></div>
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
              </div>
              
              {/* Blood dripping effect */}
              <div className="absolute top-0 left-0 w-full h-16 bg-red-900 opacity-70" style={{
                backgroundImage: 'linear-gradient(to bottom, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0.3) 70%, transparent 100%)',
                clipPath: 'polygon(0% 0%, 5% 100%, 10% 70%, 15% 100%, 20% 50%, 25% 100%, 30% 80%, 35% 100%, 40% 60%, 45% 100%, 50% 30%, 55% 100%, 60% 70%, 65% 100%, 70% 40%, 75% 100%, 80% 80%, 85% 100%, 90% 60%, 95% 100%, 100% 0%)'
              }}></div>
              
              {/* Main content */}
              <motion.div 
                className="mt-16"
                animate={{ 
                  y: [0, 2, -2, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  times: [0, 0.33, 0.66, 1]
                }}
              >
                <motion.h2
                  className="text-4xl text-red-600 handwritten mb-6 horror-text"
                  animate={{ 
                    opacity: [0.8, 1, 0.8],
                    textShadow: [
                      "0 0 12px rgba(220, 38, 38, 0.9)",
                      "0 0 16px rgba(220, 38, 38, 1.0)",
                      "0 0 12px rgba(220, 38, 38, 0.9)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {clickCount < parsedAge/2 ? 
                    "ACCEPT YOUR AGE..." : 
                    clickCount < parsedAge-3 ? 
                      "ALMOST THERE..." : 
                      "ONE FINAL BREATH..."}
                </motion.h2>
                
                <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-8 border border-red-900">
                  <motion.p 
                    className="text-white text-3xl mb-2"
                    animate={{ 
                      color: ['#ffffff', '#ff6b6b', '#ffffff']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Clicks: <span className="text-red-500 font-bold">{clickCount}</span> / {parsedAge}
                  </motion.p>
                  
                  {/* Progress bar */}
                  <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-red-600"
                      style={{ width: `${(clickCount / parsedAge) * 100}%` }}
                      animate={{
                        backgroundColor: ['#dc2626', '#b91c1c', '#dc2626']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
                
                <motion.div 
                  className="mt-8 text-red-500 text-xl max-w-md mx-auto"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    textShadow: ["0 0 5px rgba(220, 38, 38, 0.5)", "0 0 10px rgba(220, 38, 38, 0.8)", "0 0 5px rgba(220, 38, 38, 0.5)"]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <p>Every click brings you one step closer to the harsh reality of your age...</p>
                  {clickCount > parsedAge/2 && (
                    <p className="mt-3 text-red-400">Why are you still resisting? {parsedAge} is just a number...</p>
                  )}
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgeVerification;