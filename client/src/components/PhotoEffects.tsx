import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PHOTO_EFFECTS } from '@/lib/constants';
import { Flame, Bug, Zap, RotateCw, Cake } from 'lucide-react';

interface PhotoEffectsProps {
  onEffectClick: (effectId: string) => void;
}

const iconMap = {
  flame: Flame,
  bug: Bug,
  dizzy: Zap, // Using Zap instead of Dizzy
  'rotate-cw': RotateCw,
  cake: Cake,
};

const PhotoEffects: FC<PhotoEffectsProps> = ({ onEffectClick }) => {
  return (
    <div className="flex flex-wrap justify-center p-3 bg-gradient-to-r from-gray-900 to-gray-800">
      {PHOTO_EFFECTS.map((effect) => {
        const IconComponent = iconMap[effect.icon as keyof typeof iconMap];
        
        return (
          <Button
            key={effect.id}
            className={`${effect.color} m-1 rounded-full transition-transform transform hover:scale-110 text-${effect.id === 'deep-fried' || effect.id === 'glitch' ? 'white' : 'black'}`}
            onClick={() => onEffectClick(effect.id)}
          >
            <IconComponent className="mr-2 h-4 w-4" />
            {effect.label}
          </Button>
        );
      })}
    </div>
  );
};

export default PhotoEffects;