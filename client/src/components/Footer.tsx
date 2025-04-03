import { FC } from 'react';

interface FooterProps {
  themeClass: string;
}

const Footer: FC<FooterProps> = ({ themeClass }) => {
  return (
    <footer className={`bg-gray-900 text-white text-center py-4 border-t-2 border-cyan-400 ${themeClass}`}>
      <p className="text-sm">Made with <span className="text-pink-500">♥</span> and absolutely <span className="underline">terrible</span> design skills</p>
      <p className="text-xs mt-1">*SITE BEST VIEWED IN NETSCAPE NAVIGATOR 3.0*</p>
      <p className="text-xs mt-2 animate-pulse">Tip: Try the Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) if you're as old as you look</p>
      <div className="mt-2 text-yellow-300 text-[10px] overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          UNDER CONSTRUCTION FOREVER --- DEAL WITH IT --- YES THIS IS GEOCITIES LEVEL DESIGN ---
        </div>
      </div>
    </footer>
  );
};

export default Footer;
