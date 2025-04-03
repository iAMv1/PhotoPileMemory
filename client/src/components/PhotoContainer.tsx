import { FC, useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { PHOTOS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, ImagePlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import PhotoEffects from './PhotoEffects';

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
  isUserAdded?: boolean;
}

interface UserPhotoResponse {
  photos: {
    id: number;
    src: string;
    x: number;
    y: number;
    rotation: number;
    zIndex: number;
    createdAt: string;
  }[];
}

const PhotoContainer: FC<PhotoContainerProps> = ({ 
  isDeepFried, 
  isGlitched, 
  photoEffects, 
  clearEffects 
}) => {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<DraggablePhoto[]>([]);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const controls = useAnimation();

  // Fetch user photos from the database
  const { data: userPhotosData, isLoading: isLoadingPhotos } = useQuery<UserPhotoResponse>({
    queryKey: ['/api/user-photos'],
    enabled: true,
  });

  // Mutation for saving a new photo
  const createPhotoMutation = useMutation({
    mutationFn: async (photoData: {
      src: string;
      x: number;
      y: number;
      rotation: number;
      zIndex: number;
    }) => {
      return await apiRequest('/api/user-photos', {
        method: 'POST',
        body: photoData
      });
    },
    onSuccess: () => {
      // Invalidate the user photos query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/user-photos'] });
    },
  });
  
  // Initialize photos with random positions
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Start with default photos
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
      
      // Add user photos from the database if available
      if (userPhotosData && userPhotosData.photos.length > 0) {
        const userPhotos = userPhotosData.photos.map(photo => ({
          id: photo.id,
          src: photo.src,
          x: photo.x,
          y: photo.y,
          rotation: photo.rotation,
          zIndex: photo.zIndex,
          isUserAdded: true
        }));
        
        // Combine default photos with user photos
        setPhotos([...initialPhotos, ...userPhotos]);
      } else {
        setPhotos(initialPhotos);
      }
    }
  }, [userPhotosData]);
  
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
  
  // Handle file upload dialog
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process the uploaded file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      
      // Convert the file to a base64 string for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const imageUrl = event.target.result as string;
          
          // Add the new photo
          if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            
            const randomX = Math.floor(Math.random() * (containerWidth - 200));
            const randomY = Math.floor(Math.random() * (containerHeight - 200));
            const randomRotation = Math.floor(Math.random() * 20) - 10;
            
            // Create new photo with highest Z-index
            const maxZIndex = photos.length > 0 ? Math.max(...photos.map(p => p.zIndex)) : 0;
            const zIndex = maxZIndex + 1;
            
            // Create the photo data for saving
            const photoData = {
              src: imageUrl,
              x: randomX,
              y: randomY,
              rotation: randomRotation,
              zIndex
            };
            
            // Save to database
            createPhotoMutation.mutate(photoData);
            
            // Temporarily add to UI (will be refreshed when query invalidates)
            const newPhoto: DraggablePhoto = {
              id: Date.now(), // Temporary ID, will be replaced with DB ID
              ...photoData,
              isUserAdded: true
            };
            
            setPhotos(prev => [...prev, newPhoto]);
          }
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          setShowUploadForm(false);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handler for photo effects
  const handleEffectClick = (effectId: string) => {
    // Apply effects based on the clicked effect
    if (effectId === 'shake') {
      // Apply shake effect directly
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
    } 
    else if (effectId === 'spin') {
      // Send to parent component to handle the spin effect
      if (!photoEffects.spin) {
        const event = new CustomEvent('photoEffect', {
          detail: { type: 'spin', value: true }
        });
        window.dispatchEvent(event);
      }
    }
    else if (effectId === 'deep-fried') {
      // Send to parent component to toggle deep-fried effect
      const event = new CustomEvent('photoEffect', {
        detail: { type: 'deep-fry', value: true }
      });
      window.dispatchEvent(event);
    }
    else if (effectId === 'glitch') {
      // Send to parent component to toggle glitch effect
      const event = new CustomEvent('photoEffect', {
        detail: { type: 'glitch', value: true }
      });
      window.dispatchEvent(event);
    }
    else if (effectId === 'confetti') {
      // Trigger confetti in parent component
      const event = new CustomEvent('photoEffect', {
        detail: { type: 'confetti', value: true }
      });
      window.dispatchEvent(event);
    }
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <PhotoEffects onEffectClick={handleEffectClick} />
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
      <div className="absolute top-4 left-20 flex items-center space-x-3 z-20">
        <h3 className="text-xl font-bold text-blue-800 handwritten">My Photos</h3>
        
        {/* Add photo button */}
        <Button
          onClick={() => setShowUploadForm(!showUploadForm)}
          variant="outline"
          size="sm"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 ml-4 flex items-center gap-1 handwritten"
        >
          <ImagePlus size={14} />
          <span>Add Photo</span>
        </Button>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Photo upload form */}
      {showUploadForm && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-lg shadow-xl border-2 border-blue-200 w-72">
          <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`upload-col-${i}`} className="border-r border-blue-200"></div>
            ))}
          </div>
          <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`upload-row-${i}`} className="border-b border-blue-200"></div>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowUploadForm(false)}
          >
            <X size={16} />
          </Button>
          <h3 className="text-lg font-bold text-blue-800 handwritten mb-4 relative z-10">Upload Your Photo</h3>
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors mb-4 relative z-10"
          >
            <Upload className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-sm text-center text-gray-600 handwritten">
              Click to select a photo<br />
              <span className="text-xs text-gray-500">or drag and drop</span>
            </p>
          </div>
          <div className="flex justify-end space-x-2 relative z-10">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUploadForm(false)}
              className="text-gray-600 handwritten"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadClick}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 handwritten"
              size="sm"
            >
              Upload
            </Button>
          </div>
        </div>
      )}
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
            width: '160px', // Minimized width
            height: '190px'  // Minimized height
          }}
          data-text={photo.src}
        >
          <div className="bg-white p-2 pb-8 shadow-lg border-2 border-blue-100 relative">
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
            <div className="relative z-10 mb-1">
              <img 
                src={photo.src} 
                alt="Birthday memory" 
                className={`w-36 h-36 object-cover border-2 border-white ${isDeepFried ? 'deep-fried' : ''}`}
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

export default PhotoContainer;
