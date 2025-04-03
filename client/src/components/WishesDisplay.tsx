import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WISH_STYLES, NOTE_SHAPES } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Wish {
  id: number;
  text: string;
  name: string;
  style: string;
  shape: string;
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
          name: "Birthday Buddy",
          style: "comic",
          shape: "square",
          topPosition: 20,
          leftPosition: 10,
          rotation: -5,
          fontSize: "1.25rem"
        },
        {
          id: 2,
          text: "TIME KEEPS MOVING AND SO DOES YOUR HAIRLINE 👴",
          name: "anoni hea koi",
          style: "impact",
          shape: "square",
          topPosition: 50,
          leftPosition: 60,
          rotation: 3,
          fontSize: "2rem"
        },
        {
          id: 3,
          text: "01001000 01000001 01010000 01010000 01011001 00100000 01000010 01001001 01010010 01010100 01001000 01000100 01000001 01011001 00100000 01001110 01000101 01010010 01000100",
          name: "Tech Friend",
          style: "retro",
          shape: "square",
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
  
  const getShapeStyles = (shapeId: string) => {
    const shape = NOTE_SHAPES.find(s => s.id === shapeId);
    if (!shape) return { bgColor: 'bg-yellow-200', borderRadius: '2px' };
    
    const styles: any = {
      bgColor: shape.bgColor
    };
    
    // Different border-radius based on shape
    switch(shape.id) {
      case 'circle':
        styles.borderRadius = '50%';
        styles.aspectRatio = '1 / 1';
        break;
      case 'cloud':
        styles.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
        break;
      case 'star':
        styles.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        break;
      case 'triangle':
        styles.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        break;
      case 'heart':
        styles.clipPath = 'path("M512 0c-288 0-320 224-320 224s-32-224-320-224c0 288 320 512 320 512s320-224 320-512z")';
        break;
      case 'rectangle':
        styles.borderRadius = '4px';
        styles.minHeight = '120px';
        break;
      default:
        styles.borderRadius = '4px';
    }
    
    return styles;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="p-6 rounded-md">
          <p className="text-blue-800 handwritten animate-pulse">Getting your embarrassing notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Content area for sticky notes */}
      <div className="relative w-full h-full">
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
              backgroundColor: '#fef08a',
              borderRadius: '4px',
              boxShadow: '3px 3px 10px rgba(0,0,0,0.15)',
              maxWidth: '200px',
              minWidth: '130px',
              transform: `rotate(${wish.rotation}deg)`,
              zIndex: Math.floor(Math.random() * 10),
              position: 'absolute',
            } as any}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, zIndex: 50, boxShadow: '5px 5px 15px rgba(0,0,0,0.2)' }}
          >
            {/* Grid pattern inside each note */}
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
            
            {/* Note content */}
            <div className="relative z-10 flex flex-col">
              <div className="mb-2">{wish.text}</div>
              <div className="text-xs italic mt-2 text-right">
                - {wish.name || "anoni hea koi"}
              </div>
            </div>
            
            {/* Tape or pin effect */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-100 opacity-60 rounded-sm"></div>
          </motion.div>
        ))}
        
        {/* Hint text at bottom */}
        {wishes.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            <p>Hover over notes to read them better</p>
          </div>
        )}
        
        {/* Empty state */}
        {wishes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 handwritten text-lg">No birthday notes yet... add one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishesDisplay;
