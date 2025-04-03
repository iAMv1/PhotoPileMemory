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
      className="relative mx-auto my-4 h-[500px] overflow-hidden bg-white rounded shadow-lg border-2 border-blue-100"
      animate={controls}
    >
      {/* Graph paper background for the container */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] h-full w-full opacity-20 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`container-col-${i}`} className="border-r border-blue-300"></div>
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-[repeat(40,1fr)] h-full w-full opacity-20 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`container-row-${i}`} className="border-b border-blue-300"></div>
        ))}
      </div>
      
      {/* Red margin line */}
      <div className="absolute top-0 bottom-0 left-16 border-l-2 border-red-300 z-10"></div>
      
      {/* Title for photo section */}
      <div className="absolute top-4 left-20 z-10">
        <h3 className="text-xl font-bold text-blue-800 handwritten">My Photos</h3>
      </div>
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          className={`draggable absolute ${isGlitched ? 'glitch' : ''}`}
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
            height: '254px'
          }}
          data-text={photo.src}
        >
          <div className="bg-white p-3 pb-10 shadow-lg border-2 border-blue-100 relative">
            {/* Graph paper pattern background */}
            <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`col-${i}`} className="border-r border-blue-200"></div>
              ))}
            </div>
            <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`row-${i}`} className="border-b border-blue-200"></div>
              ))}
            </div>
            
            {/* Main photo with effects */}
            <div className="relative z-10 mb-2">
              <img 
                src={photo.src} 
                alt="Birthday memory" 
                className={`w-56 h-56 object-cover border-4 border-white ${isDeepFried ? 'deep-fried' : ''}`}
              />
            </div>
            
            {/* Tape pieces for authentic paper look */}
            <div className="absolute -left-2 top-10 w-8 h-4 bg-yellow-100 opacity-60 rotate-12"></div>
            <div className="absolute -right-2 top-10 w-8 h-4 bg-yellow-100 opacity-60 -rotate-12"></div>
            
            {/* Random handwritten note */}
            <div className="absolute bottom-2 right-4 left-4 text-center">
              <p className="text-xs handwritten text-blue-600 rotate-1">
                {index % 2 === 0 ? "remember this? lol" : "omg look how young u were!!"}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PhotoContainer;
