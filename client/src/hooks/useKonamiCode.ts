import { useState, useEffect, useCallback } from 'react';
import { KONAMI_CODE } from '@/lib/constants';

type KonamiCodeHandler = () => void;

export const useKonamiCode = (onKonamiCode: KonamiCodeHandler): void => {
  const [konamiCodePosition, setKonamiCodePosition] = useState<number>(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const requiredKey = KONAMI_CODE[konamiCodePosition].toLowerCase();

      if (key === requiredKey) {
        const nextPosition = konamiCodePosition + 1;
        
        if (nextPosition === KONAMI_CODE.length) {
          // Konami code completed!
          onKonamiCode();
          setKonamiCodePosition(0); // Reset
        } else {
          setKonamiCodePosition(nextPosition);
        }
      } else {
        setKonamiCodePosition(0); // Reset on mismatch
      }
    },
    [konamiCodePosition, onKonamiCode]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKonamiCode;
