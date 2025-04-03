import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TimeCapsuleProps {
  themeClass: string;
}

interface TimeCapsuleMessage {
  id: number;
  hour: number;
  message: string;
}

const TimeCapsule: FC<TimeCapsuleProps> = ({ themeClass }) => {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  
  const { data, isLoading } = useQuery({
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
    <Card className="max-w-md mx-auto my-8 bg-gray-900 border-2 border-yellow-400 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-yellow-400">The Time Capsule</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white mb-4">Secret messages will appear at specific times!</p>
        <motion.div 
          className={`p-4 bg-gradient-to-r from-pink-500 to-cyan-400 rounded text-center font-bold ${themeClass}`}
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
          {isLoading ? (
            "Loading message..."
          ) : data?.message ? (
            data.message.message
          ) : (
            "Waiting for the right moment..."
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TimeCapsule;
