import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { THEME_MODES } from '@/lib/constants';
import { Mountain, Terminal, Disc, Undo } from 'lucide-react';

interface ThemeSelectorProps {
  setThemeMode: (mode: string) => void;
}

const iconMap = {
  mountain: Mountain,
  terminal: Terminal,
  disc: Disc,
  undo: Undo
};

const ThemeSelector: FC<ThemeSelectorProps> = ({ setThemeMode }) => {
  return (
    <div className="flex flex-wrap justify-center p-3 bg-gray-900 border-b-2 border-yellow-400">
      {THEME_MODES.map((theme) => {
        const IconComponent = iconMap[theme.icon as keyof typeof iconMap];
        
        return (
          <Button
            key={theme.id}
            className={`m-1 rounded-full transition-transform transform hover:scale-110 ${theme.buttonColor} ${theme.textColor === 'text-white' ? 'text-white' : 'text-black'}`}
            onClick={() => setThemeMode(theme.id)}
          >
            <IconComponent className="mr-2 h-4 w-4" />
            {theme.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
