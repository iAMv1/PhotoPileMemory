import { FC, useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { PHOTOS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Play, SkipBack, SkipForward, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface PhotoCarouselProps {
  isDeepFried: boolean;
  isGlitched: boolean;
  userId?: number;
}

interface DraggablePhoto {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  comment?: string;
}

const PhotoCarousel: FC<PhotoCarouselProps> = ({ isDeepFried, isGlitched, userId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<DraggablePhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const controls = useAnimation();
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newPhotoComment, setNewPhotoComment] = useState('');

  // Query to fetch user uploaded photos
  const { data: userPhotosData, isLoading } = useQuery({
    queryKey: userId ? [`/api/user-photos?userId=${userId}`] : ['/api/user-photos'],
    queryFn: async () => {
      const url = userId ? `/api/user-photos?userId=${userId}` : '/api/user-photos';
      return await apiRequest<{ photos: DraggablePhoto[] }>(url);
    },
  });

  // Mutation to upload a new photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photoData: {
      src: string;
      x: number;
      y: number;
      rotation: number;
      zIndex: number;
      comment?: string;
      userId?: number;
    }) => {
      return await apiRequest('/api/user-photos', {
        method: 'POST',
        body: { ...photoData, userId },
      });
    },
    onSuccess: () => {
      const queryKey = userId ? [`/api/user-photos?userId=${userId}`] : ['/api/user-photos'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Initialize photos with both predefined and user-uploaded ones
  useEffect(() => {
    // Start with predefined photos
    const initialPhotos = PHOTOS.map((src, index) => ({
      id: index + 1,
      src,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotation: Math.random() * 20 - 10,
      zIndex: index + 1
    }));
    
    // Add user uploaded photos if available
    if (userPhotosData?.photos?.length) {
      const allPhotos = [
        ...initialPhotos,
        ...userPhotosData.photos
      ];
      setPhotos(allPhotos);
    } else {
      setPhotos(initialPhotos);
    }
  }, [userPhotosData?.photos]);
  
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
    setCurrentPhotoIndex((prevIndex) => {
      const newIndex = prevIndex === photos.length - 1 ? 0 : prevIndex + 1;
      
      // If we're in slideshow mode, animate the photos to slide left
      if (isSlideshow && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const centerX = containerWidth / 2 - 112;
        const centerY = containerRef.current.clientHeight / 2 - 127;
        
        // Update positions with animation
        setPhotos(prevPhotos => 
          prevPhotos.map((photo, index) => {
            let xPosition;
            
            // For slideshow mode, calculate new positions
            if (index === newIndex) {
              // New center photo
              xPosition = centerX;
            } else if (index < newIndex) {
              // Photos moving further left
              xPosition = centerX - ((newIndex - index) * 250);
            } else {
              // Photos moving right
              xPosition = centerX + ((index - newIndex) * 250);
            }
            
            return {
              ...photo,
              x: xPosition,
              y: centerY,
              rotation: 0, // Keep photos straight in slideshow
            };
          })
        );
      }
      
      return newIndex;
    });
  };
  
  // Go to previous photo in carousel
  const goToPrevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? photos.length - 1 : prevIndex - 1;
      
      // If we're in slideshow mode, animate the photos to slide right
      if (isSlideshow && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const centerX = containerWidth / 2 - 112;
        const centerY = containerRef.current.clientHeight / 2 - 127;
        
        // Update positions with animation
        setPhotos(prevPhotos => 
          prevPhotos.map((photo, index) => {
            let xPosition;
            
            // For slideshow mode, calculate new positions
            if (index === newIndex) {
              // New center photo
              xPosition = centerX;
            } else if (index < newIndex) {
              // Photos moving further left
              xPosition = centerX - ((newIndex - index) * 250);
            } else {
              // Photos moving right
              xPosition = centerX + ((index - newIndex) * 250);
            }
            
            return {
              ...photo,
              x: xPosition,
              y: centerY,
              rotation: 0, // Keep photos straight in slideshow
            };
          })
        );
      }
      
      return newIndex;
    });
  };
  
  // Handle random photo selection with zoom animation
  const goToRandomPhoto = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * photos.length);
    } while (randomIndex === currentPhotoIndex && photos.length > 1);
    
    // Set the new current photo index
    setCurrentPhotoIndex(randomIndex);
    
    // Apply zoom animation to the randomly selected photo
    const updatedPhotos = [...photos];
    
    // First bring it to the front by setting highest z-index
    const maxZIndex = Math.max(...updatedPhotos.map(photo => photo.zIndex));
    updatedPhotos[randomIndex].zIndex = maxZIndex + 1;
    
    // If in slideshow mode, also center it
    if (isSlideshow && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const centerX = containerWidth / 2 - 112;
      const centerY = containerRef.current.clientHeight / 2 - 127;
      
      // Position the random photo in the center
      updatedPhotos[randomIndex].x = centerX;
      updatedPhotos[randomIndex].y = centerY;
      
      // Update all other photos' positions
      updatedPhotos.forEach((photo, index) => {
        if (index !== randomIndex) {
          if (index < randomIndex) {
            updatedPhotos[index].x = centerX - ((randomIndex - index) * 250);
          } else {
            updatedPhotos[index].x = centerX + ((index - randomIndex) * 250);
          }
          updatedPhotos[index].y = centerY;
          updatedPhotos[index].rotation = 0;
        }
      });
    }
    
    setPhotos(updatedPhotos);
    
    // Apply zoom animation using the controls
    controls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    });
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
  
  // Handle file upload button click
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
      
      // Convert the file to a base64 string
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setShowUploadForm(true);
          
          // Handle the image upload in a separate step to let the user add a comment
          const imageUrl = event.target.result as string;
          
          // Save the image URL to state so we can access it when the form is submitted
          localStorage.setItem('tempImageUpload', imageUrl);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Add the user's uploaded photo with comment
  const addUserPhoto = () => {
    const imageUrl = localStorage.getItem('tempImageUpload');
    
    if (imageUrl) {
      const maxZIndex = Math.max(...photos.map(photo => photo.zIndex), 0);
      
      const centerX = containerRef.current ? 
        Math.round((containerRef.current.clientWidth / 2) - 112) : 0; // center the image
      const centerY = containerRef.current ? 
        Math.round((containerRef.current.clientHeight / 2) - 127) : 0;
      
      // Create a new photo object
      const newPhoto: DraggablePhoto = {
        id: Date.now(), // Temporary ID until server response
        src: imageUrl,
        x: centerX,
        y: centerY,
        rotation: Math.round(Math.random() * 10 - 5),
        zIndex: maxZIndex + 1,
        comment: newPhotoComment || 'This is my photo!'
      };
      
      // Add the photo to the UI immediately for better user experience
      setPhotos(prev => [...prev, newPhoto]);
        
      // Upload to the server
      uploadPhotoMutation.mutate({
        src: imageUrl,
        x: centerX,
        y: centerY,
        rotation: newPhoto.rotation,
        zIndex: newPhoto.zIndex,
        comment: newPhoto.comment
      }, {
        onError: (error) => {
          console.error('Error uploading photo:', error);
          alert('Failed to upload photo. Please try again with a smaller image.');
          
          // Remove the temporary photo if upload fails
          setPhotos(prev => prev.filter(p => p.id !== newPhoto.id));
        }
      });
      
      // Close the upload form and reset state
      setShowUploadForm(false);
      setNewPhotoComment('');
      localStorage.removeItem('tempImageUpload');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Toggle slideshow mode
  const toggleSlideshow = () => {
    // When entering slideshow mode, arrange photos in a slider format
    if (!isSlideshow) {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        // Calculate positions for slider layout
        const centerX = containerWidth / 2 - 112;
        const centerY = containerHeight / 2 - 127;
        
        // Arrange photos horizontally with the current photo in center
        const updatedPhotos = photos.map((photo, index) => {
          let xPosition;
          
          if (index === currentPhotoIndex) {
            // Center position for current photo
            xPosition = centerX;
          } else if (index < currentPhotoIndex) {
            // Position to the left for previous photos
            xPosition = centerX - ((currentPhotoIndex - index) * 250);
          } else {
            // Position to the right for next photos
            xPosition = centerX + ((index - currentPhotoIndex) * 250);
          }
          
          return {
            ...photo,
            x: xPosition,
            y: centerY,
            rotation: 0, // Keep photos straight in slideshow mode
          };
        });
        
        setPhotos(updatedPhotos);
      }
    }
    
    setIsSlideshow(!isSlideshow);
  };
  
  // Handle clicking on a photo
  const handlePhotoClick = (index: number) => {
    // Bring to front
    const updatedPhotos = [...photos];
    const maxZIndex = Math.max(...updatedPhotos.map(photo => photo.zIndex));
    updatedPhotos[index].zIndex = maxZIndex + 1;
    setPhotos(updatedPhotos);
  };
  
  // Set up automatic slideshow interval
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isSlideshow) {
      interval = setInterval(() => {
        goToNextPhoto();
      }, 3000); // Change slide every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSlideshow, currentPhotoIndex]);

  return (
    <div className="my-6 relative">
      {/* Carousel Controls */}
      <div className="flex flex-wrap justify-center gap-2 mb-2 px-4">
        <button 
          onClick={goToPrevPhoto}
          className="px-4 py-2 handwritten bg-blue-100 hover:bg-blue-200 text-blue-800 rounded shadow"
        >
          <SkipBack className="inline-block mr-1" size={16} />
          Previous
        </button>
        
        <button 
          onClick={goToRandomPhoto}
          className="px-4 py-2 handwritten bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded shadow"
        >
          Random!
        </button>
        
        <button 
          onClick={() => setShowUploadForm(true)}
          className="px-4 py-2 handwritten bg-green-100 hover:bg-green-200 text-green-800 rounded shadow"
        >
          <Upload className="inline-block mr-1" size={16} />
          Add Photo
        </button>
        
        <button 
          onClick={toggleSlideshow}
          className={`px-4 py-2 handwritten ${isSlideshow ? 'bg-purple-200 text-purple-800' : 'bg-purple-100 text-purple-800'} hover:bg-purple-200 rounded shadow`}
        >
          <Play className="inline-block mr-1" size={16} />
          {isSlideshow ? 'Exit Slideshow' : 'Slideshow'}
        </button>
        
        <button 
          onClick={goToNextPhoto}
          className="px-4 py-2 handwritten bg-blue-100 hover:bg-blue-200 text-blue-800 rounded shadow"
        >
          Next <SkipForward className="inline-block ml-1" size={16} />
        </button>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Photo Container */}
      <motion.div 
        ref={containerRef}
        className="relative mx-auto h-[500px] overflow-hidden bg-white rounded shadow-lg border-2 border-blue-100"
        animate={controls}
      >
        {/* Side navigation arrows for slideshow */}
        {isSlideshow && (
          <>
            <button 
              onClick={goToPrevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full text-white"
            >
              <ChevronLeft size={30} />
            </button>
            <button 
              onClick={goToNextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full text-white"
            >
              <ChevronRight size={30} />
            </button>
          </>
        )}
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
        
        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80 border-2 border-blue-100 relative">
              {/* Graph paper background */}
              <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-20 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`modal-col-${i}`} className="border-r border-blue-300"></div>
                ))}
              </div>
              <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-20 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`modal-row-${i}`} className="border-b border-blue-300"></div>
                ))}
              </div>
              
              <div className="relative z-10">
                <button 
                  onClick={() => setShowUploadForm(false)}
                  className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold mb-4 handwritten text-blue-800">Add Your Photo</h3>
                
                <div className="mb-4">
                  <Button 
                    onClick={handleUploadClick}
                    className="w-full handwritten bg-green-100 hover:bg-green-200 text-green-800 mb-4"
                  >
                    <Upload className="mr-2" size={16} />
                    Choose Photo
                  </Button>
                  
                  <label className="block text-sm handwritten font-medium text-gray-700 mb-1">
                    Add a comment:
                  </label>
                  <Textarea
                    value={newPhotoComment}
                    onChange={(e) => setNewPhotoComment(e.target.value)}
                    placeholder="Write something funny..."
                    className="handwritten-messy"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    className="handwritten"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addUserPhoto}
                    className="handwritten bg-blue-100 hover:bg-blue-200 text-blue-800"
                  >
                    Add to Gallery
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            drag={!isSlideshow}
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
                  <div key={`photo-col-${photo.id}-${i}`} className="border-r border-blue-200"></div>
                ))}
              </div>
              <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`photo-row-${photo.id}-${i}`} className="border-b border-blue-200"></div>
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
              
              {/* Comment or random handwritten note */}
              <div className="absolute bottom-2 right-4 left-4 text-center">
                <p className="text-xs handwritten text-blue-600 rotate-1">
                  {photo.comment || (index % 2 === 0 ? "remember this? lol" : "omg look how young u were!!")}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Slideshow Navigation buttons removed as requested */}
    </div>
  );
};

export default PhotoCarousel;