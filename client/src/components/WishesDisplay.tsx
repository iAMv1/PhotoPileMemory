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

interface WishesDisplayProps {
  refreshTrigger: number;
}

const WishesDisplay: FC<WishesDisplayProps> = ({ refreshTrigger }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/wishes'],
    refetchOnWindowFocus: false,
  });

  const [wishes, setWishes] = useState<Wish[]>([]);

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
          text: "Have an awesome birthday! 🎂",
          style: "comic",
          topPosition: 20,
          leftPosition: 10,
          rotation: -5,
          fontSize: "1.25rem"
        },
        {
          id: 2,
          text: "YOU'RE OLD NOW! 👴",
          style: "impact",
          topPosition: 50,
          leftPosition: 60,
          rotation: 3,
          fontSize: "2rem"
        },
        {
          id: 3,
          text: "01001000 01100001 01110000 01110000 01111001 00100001",
          style: "retro",
          topPosition: 70,
          leftPosition: 30,
          rotation: -7,
          fontSize: "1.75rem"
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
      <div className="relative w-full h-80 overflow-hidden border-t-4 border-dashed border-yellow-400 flex items-center justify-center">
        <p className="text-xl text-white">Loading wishes...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 overflow-hidden border-t-4 border-dashed border-yellow-400">
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
            ...getStyleProps(wish.style)
          } as any}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {wish.text}
        </motion.div>
      ))}
    </div>
  );
};

export default WishesDisplay;
