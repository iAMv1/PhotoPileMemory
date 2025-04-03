import { FC, useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { PHOTOS } from '@/lib/constants';

interface PhotoContainerProps {
  isDeepFried: boolean;
  isGlitched: boolean;
  photoEffects: {
    shake: boolean;
    spin: boolean;
  };
  clearEffects: () => void;
}

interface DraggablePhoto {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

const PhotoContainer: FC<PhotoContainerProps> = ({ 
  isDeepFried, 
  isGlitched, 
  photoEffects, 
  clearEffects 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<DraggablePhoto[]>([]);
  const controls = useAnimation();
  
  // Initialize photos with random positions
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const initialPhotos = PHOTOS.map((src, index) => {
        const randomX = Math.floor(Math.random() * (containerWidth - 200));
        const randomY = Math.floor(Math.random() * (containerHeight - 200));
        const randomRotation = Math.floor(Math.random() * 30) - 15;
        
        return {
          id: index,
          src,
          x: randomX,
          y: randomY,
          rotation: randomRotation,
          zIndex: index + 1
        };
      });
      
      setPhotos(initialPhotos);
    }
  }, []);
  
  // Handle window resize by repositioning photos
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        setPhotos(prev => prev.map(photo => {
          // Keep photos within new container bounds
          const x = Math.min(photo.x, containerWidth - 200);
          const y = Math.min(photo.y, containerHeight - 200);
          
          return {
            ...photo,
            x,
            y
          };
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Apply shake effect
  useEffect(() => {
    if (photoEffects.shake) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }).then(() => {
        clearEffects();
      });
    }
  }, [photoEffects.shake, controls, clearEffects]);
  
  // Bring photo to front when dragged
  const handleDragStart = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      const maxZIndex = Math.max(...newPhotos.map(p => p.zIndex));
      newPhotos[index].zIndex = maxZIndex + 1;
      return newPhotos;
    });
  };
  
  // Return photo to a random position when drag ends
  const handleDragEnd = (index: number, info: { offset: { x: number; y: number } }) => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const randomX = Math.floor(Math.random() * (containerWidth - 200));
      const randomY = Math.floor(Math.random() * (containerHeight - 200));
      const randomRotation = Math.floor(Math.random() * 30) - 15;
      
      setPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos[index] = {
          ...newPhotos[index],
          x: randomX,
          y: randomY,
          rotation: randomRotation
        };
        return newPhotos;
      });
    }
  };
  
  return (
    <motion.div 
      ref={containerRef}
      className="relative mx-auto my-4 border-4 border-dashed border-fuchsia-500 rounded-lg h-[400px] overflow-hidden"
      animate={controls}
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          className={`draggable absolute shadow-xl rounded-lg overflow-hidden ${isGlitched ? 'glitch' : ''}`}
          initial={{ x: photo.x, y: photo.y, rotate: photo.rotation }}
          animate={{ 
            x: photo.x, 
            y: photo.y, 
            rotate: photoEffects.spin ? 360 : photo.rotation,
            transition: photoEffects.spin ? { rotate: { duration: 1, repeat: 3, ease: "linear" } } : {}
          }}
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
          whileDrag={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          onDragStart={() => handleDragStart(index)}
          onDragEnd={(event, info) => handleDragEnd(index, info)}
          style={{ 
            zIndex: photo.zIndex,
            width: '224px',
            height: '224px'
          }}
          data-text={photo.src}
        >
          <img 
            src={photo.src} 
            alt="Birthday memory" 
            className={`w-56 h-56 object-cover ${isDeepFried ? 'deep-fried' : ''}`}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PhotoContainer;
