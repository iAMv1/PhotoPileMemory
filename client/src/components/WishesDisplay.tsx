import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WISH_STYLES } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Wish {
  id: number;
  text: string;
  style: string;
  topPosition: number;
  leftPosition: number;
  rotation: number;
  fontSize: string;
}

interface WishResponse {
  wishes: Wish[];
}

interface WishesDisplayProps {
  refreshTrigger: number;
}

const WishesDisplay: FC<WishesDisplayProps> = ({ refreshTrigger }) => {
  const { data, isLoading, refetch } = useQuery<WishResponse>({
    queryKey: ['/api/wishes'],
    refetchOnWindowFocus: false,
  });

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    if (data?.wishes) {
      setWishes(data.wishes);
    }
  }, [data]);

  // If no server wishes are available, use some default wishes
  useEffect(() => {
    if (!isLoading && (!wishes || wishes.length === 0)) {
      const defaultWishes = [
        {
          id: 1,
          text: "Remember when we wrote notes in class? Yeah, you're that old. 🎂",
          style: "comic",
          topPosition: 20,
          leftPosition: 10,
          rotation: -5,
          fontSize: "1.25rem"
        },
        {
          id: 2,
          text: "TIME KEEPS MOVING AND SO DOES YOUR HAIRLINE 👴",
          style: "impact",
          topPosition: 50,
          leftPosition: 60,
          rotation: 3,
          fontSize: "2rem"
        },
        {
          id: 3,
          text: "01001000 01000001 01010000 01010000 01011001 00100000 01000010 01001001 01010010 01010100 01001000 01000100 01000001 01011001 00100000 01001110 01000101 01010010 01000100",
          style: "retro",
          topPosition: 70,
          leftPosition: 30,
          rotation: -7,
          fontSize: "1rem"
        }
      ];
      setWishes(defaultWishes);
    }
  }, [isLoading, wishes]);

  const getStyleProps = (styleId: string) => {
    const style = WISH_STYLES.find(s => s.id === styleId);
    if (!style) return {};
    
    const props: any = {
      fontFamily: style.fontFamily,
      color: style.color
    };
    
    if (style.textShadow) {
      props.textShadow = style.textShadow;
    }
    
    return props;
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-30 w-[300px] shadow-xl rounded">
        <div className="bg-blue-50 p-6 rounded-md">
          <p className="text-blue-800 handwritten">Getting your embarrassing notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-30 transition-all duration-300 ease-in-out 
      ${isExpanded ? 'w-[400px] h-[500px]' : 'w-[300px] h-[200px]'}`}
    >
      {/* Expandable wishes box with notebook aesthetic */}
      <motion.div 
        className="w-full h-full bg-white border-2 border-blue-300 shadow-xl rounded overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-20 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`wish-display-col-${i}`} className="border-r border-blue-200"></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-20 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`wish-display-row-${i}`} className="border-b border-blue-200"></div>
          ))}
        </div>
        
        {/* Header with expand/collapse button */}
        <div className="relative py-2 px-4 bg-blue-50 border-b-2 border-blue-200 flex justify-between items-center">
          <h2 className="text-lg font-bold handwritten text-blue-900 truncate">
            Birthday Notes From Your "Friends"
          </h2>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-1 rounded"
          >
            {isExpanded ? '↓' : '↑'}
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative overflow-auto">
          <div className="absolute inset-0 p-4">
            {wishes.map((wish) => (
              <motion.div
                key={wish.id}
                className={`float-wish absolute ${wish.style === 'rainbow' ? 'rainbow-text' : ''}`}
                style={{
                  top: `${wish.topPosition}%`,
                  left: `${wish.leftPosition}%`,
                  fontSize: wish.fontSize,
                  '--rand': (Math.random() * 0.7 + 0.3).toString(),
                  '--rot': `${wish.rotation}deg`,
                  ...getStyleProps(wish.style),
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '2px',
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                  maxWidth: '180px',
                  transform: `rotate(${wish.rotation}deg)`,
                  zIndex: Math.floor(Math.random() * 10),
                } as any}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, zIndex: 50 }}
              >
                <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={`wish-col-${i}-${wish.id}`} className="border-r border-blue-200"></div>
                  ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={`wish-row-${i}-${wish.id}`} className="border-b border-blue-200"></div>
                  ))}
                </div>
                
                <div className="relative z-10">
                  {wish.text}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-2 text-center text-xs text-gray-500 bg-blue-50 border-t border-blue-200">
          <p>Hover over notes to read them better</p>
        </div>
      </motion.div>
    </div>
  );
};

export default WishesDisplay;
