import { FC, useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { PHOTOS } from '@/lib/constants';

interface PhotoCarouselProps {
  isDeepFried: boolean;
  isGlitched: boolean;
}

interface DraggablePhoto {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

const PhotoCarousel: FC<PhotoCarouselProps> = ({ isDeepFried, isGlitched }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<DraggablePhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const controls = useAnimation();
  
  // Initialize photos with random positions
  useEffect(() => {
    const initialPhotos = PHOTOS.map((src, index) => ({
      id: index + 1,
      src,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotation: Math.random() * 20 - 10,
      zIndex: index + 1
    }));
    
    setPhotos(initialPhotos);
  }, []);
  
  // Handle drag start to bring photo to front
  const handleDragStart = (index: number) => {
    const updatedPhotos = [...photos];
    // Find the maximum zIndex
    const maxZIndex = Math.max(...updatedPhotos.map(photo => photo.zIndex));
    // Update the zIndex of the dragged photo
    updatedPhotos[index].zIndex = maxZIndex + 1;
    setPhotos(updatedPhotos);
  };
  
  // Handle drag end to update photo position
  const handleDragEnd = (index: number, info: any) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index].x += info.offset.x;
    updatedPhotos[index].y += info.offset.y;
    setPhotos(updatedPhotos);
  };
  
  // Go to next photo in carousel
  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Go to previous photo in carousel
  const goToPrevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };
  
  // Handle random photo selection
  const goToRandomPhoto = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * photos.length);
    } while (randomIndex === currentPhotoIndex && photos.length > 1);
    
    setCurrentPhotoIndex(randomIndex);
  };
  
  // Add a new photo at a random position
  const addRandomPhoto = () => {
    if (photos.length >= 10) return; // Limit to 10 photos
    
    const randomIndex = Math.floor(Math.random() * PHOTOS.length);
    const randomPhoto = PHOTOS[randomIndex];
    
    const maxZIndex = Math.max(...photos.map(photo => photo.zIndex), 0);
    
    const newPhoto: DraggablePhoto = {
      id: Date.now(),
      src: randomPhoto,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotation: Math.random() * 20 - 10,
      zIndex: maxZIndex + 1
    };
    
    setPhotos([...photos, newPhoto]);
  };
  
  // Handle clicking on a photo
  const handlePhotoClick = (index: number) => {
    // Bring to front
    const updatedPhotos = [...photos];
    const maxZIndex = Math.max(...updatedPhotos.map(photo => photo.zIndex));
    updatedPhotos[index].zIndex = maxZIndex + 1;
    setPhotos(updatedPhotos);
  };
  
  return (
    <div className="my-6 relative">
      {/* Carousel Controls */}
      <div className="flex justify-between mb-2 px-4">
        <button 
          onClick={goToPrevPhoto}
          className="px-4 py-2 handwritten bg-blue-100 hover:bg-blue-200 text-blue-800 rounded shadow"
        >
          ← Previous
        </button>
        
        <button 
          onClick={goToRandomPhoto}
          className="px-4 py-2 handwritten bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded shadow"
        >
          Random!
        </button>
        
        <button 
          onClick={addRandomPhoto}
          className="px-4 py-2 handwritten bg-green-100 hover:bg-green-200 text-green-800 rounded shadow"
        >
          Add Photo
        </button>
        
        <button 
          onClick={goToNextPhoto}
          className="px-4 py-2 handwritten bg-blue-100 hover:bg-blue-200 text-blue-800 rounded shadow"
        >
          Next →
        </button>
      </div>
      
      {/* Photo Container */}
      <motion.div 
        ref={containerRef}
        className="relative mx-auto h-[500px] overflow-hidden bg-white rounded shadow-lg border-2 border-blue-100"
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
          <h3 className="text-xl font-bold text-blue-800 handwritten">Photo Gallery</h3>
          <p className="text-sm text-gray-600 handwritten-messy">(drag photos around!)</p>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {photos.map((_, index) => (
            <button
              key={`indicator-${index}`}
              className={`w-3 h-3 rounded-full ${
                index === currentPhotoIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentPhotoIndex(index)}
            />
          ))}
        </div>
        
        {/* Photos */}
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            className={`draggable absolute ${isGlitched ? 'glitch' : ''} ${
              index === currentPhotoIndex ? 'scale-100' : 'scale-90 opacity-70'
            }`}
            initial={{ x: photo.x, y: photo.y, rotate: photo.rotation }}
            animate={{ 
              x: photo.x, 
              y: photo.y, 
              rotate: photo.rotation,
              scale: index === currentPhotoIndex ? 1 : 0.9,
              opacity: index === currentPhotoIndex ? 1 : 0.7
            }}
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
            whileDrag={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={(event, info) => handleDragEnd(index, info)}
            onClick={() => handlePhotoClick(index)}
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
    </div>
  );
};

export default PhotoCarousel;