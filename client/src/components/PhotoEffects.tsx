import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PHOTO_EFFECTS } from '@/lib/constants';
import { Zap, RotateCw, Waves, FlaskConical } from 'lucide-react';

interface PhotoEffectsProps {
  onEffectClick: (effectId: string) => void;
}

const PhotoEffects: FC<PhotoEffectsProps> = ({ onEffectClick }) => {
  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'shake':
        return <Waves className="mr-1 h-4 w-4" />;
      case 'spin':
        return <RotateCw className="mr-1 h-4 w-4" />;
      case 'deep-fry':
        return <Zap className="mr-1 h-4 w-4" />;
      case 'glitch':
        return <FlaskConical className="mr-1 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mb-4 p-4 bg-white rounded-lg shadow-md border border-blue-100 relative notebook-paper">
      {/* Graph paper background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`effect-col-${i}`} className="border-r border-blue-200"></div>
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full opacity-30 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`effect-row-${i}`} className="border-b border-blue-200"></div>
        ))}
      </div>
      
      <h3 className="text-base font-bold handwritten text-blue-800 mb-2 text-center relative z-10">
        Photo Effects
      </h3>
      
      <div className="flex flex-wrap justify-center gap-2 relative z-10">
        {PHOTO_EFFECTS.map((effect) => (
          <Button
            key={effect.id}
            onClick={() => onEffectClick(effect.id)}
            size="sm"
            variant="outline"
            className="flex items-center text-xs handwritten bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            {getEffectIcon(effect.id)}
            {effect.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PhotoEffects;