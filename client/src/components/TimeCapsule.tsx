import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

interface TimeCapsuleProps {
  themeClass: string;
}

interface TimeCapsuleMessage {
  id: number;
  hour: number;
  message: string;
}

interface TimeCapsuleResponse {
  message: TimeCapsuleMessage;
}

const TimeCapsule: FC<TimeCapsuleProps> = ({ themeClass }) => {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  
  const { data, isLoading } = useQuery<TimeCapsuleResponse>({
    queryKey: ['/api/time-capsule-messages/current'],
    refetchOnWindowFocus: false,
  });
  
  // Update the current hour every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentHour]);
  
  return (
    <div className="max-w-md mx-auto my-8 relative">
      {/* Sticky note appearance */}
      <div className="bg-yellow-100 p-6 shadow-lg relative transform -rotate-1">
        {/* Small grid pattern for sticky note */}
        <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] h-full w-full opacity-10 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`sticky-col-${i}`} className="border-r border-black"></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-[repeat(40,1fr)] h-full w-full opacity-10 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`sticky-row-${i}`} className="border-b border-black"></div>
          ))}
        </div>
      
        <h3 className="text-2xl font-bold text-yellow-800 handwritten mb-4">The Time Capsule</h3>
        <p className="text-yellow-800 mb-4 handwritten">Messages change throughout the day! Keep checking back...</p>
        
        <motion.div 
          className="p-5 bg-white rounded shadow-inner text-center"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut" 
          }}
        >
          <div className="handwritten text-lg font-bold text-blue-900">
            {isLoading ? (
              "Loading message..."
            ) : data?.message ? (
              data.message.message
            ) : (
              "Waiting for the right moment..."
            )}
          </div>
        </motion.div>
        
        {/* Tape at the top */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-100 opacity-60"></div>
        
        {/* Current time */}
        <div className="absolute bottom-1 right-2 text-xs text-yellow-800">
          Current Hour: {currentHour}:00
        </div>
      </div>
    </div>
  );
};

export default TimeCapsule;
