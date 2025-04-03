import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  count?: number;
  isActive: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
}

const colors = ['#FF69B4', '#00FFFF', '#FFA500', '#7CFC00', '#FF00FF', '#FFD700'];

const Confetti: FC<ConfettiProps> = ({ count = 50, isActive, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    if (isActive) {
      // Generate new confetti pieces
      const newPieces = Array.from({ length: count }).map((_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 100, // Position across the screen
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
        rotation: Math.random() * 360
      }));
      
      setPieces(newPieces);
      
      // Clear confetti after the longest duration + delay
      const maxDuration = Math.max(...newPieces.map(p => p.duration + p.delay));
      const timerId = setTimeout(() => {
        setPieces([]);
        if (onComplete) onComplete();
      }, maxDuration * 1000);
      
      return () => clearTimeout(timerId);
    }
  }, [isActive, count, onComplete]);
  
  if (!isActive && pieces.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}vw`,
            top: '-20px',
            transformOrigin: 'center',
          }}
          initial={{ y: '-20vh', rotate: 0, opacity: 1 }}
          animate={{ 
            y: '120vh', 
            rotate: piece.rotation + 360,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
