import { FC } from 'react';

interface FooterProps {
  themeClass: string;
}

const Footer: FC<FooterProps> = ({ themeClass }) => {
  return (
    <footer className={`bg-white text-center py-4 border-t-2 border-blue-200 shadow-md relative ${themeClass}`}>
      {/* Graph paper background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] h-full w-full opacity-20 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`footer-col-${i}`} className="border-r border-blue-300"></div>
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-[repeat(10,1fr)] h-full w-full opacity-20 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`footer-row-${i}`} className="border-b border-blue-300"></div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative">
        <p className="text-sm handwritten text-blue-900">Made with <span className="text-red-500">♥</span> and absolutely <span className="underline">terrible</span> design skills</p>
        <p className="text-xs mt-1 text-gray-600">*PERFECT FOR SOMEONE YOUR AGE*</p>
        <p className="text-xs mt-2 animate-pulse text-blue-800">Tip: Try the Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) if you can still remember it, grandpa</p>
        <div className="mt-2 text-blue-700 text-[10px] overflow-hidden">
          <div className="animate-marquee whitespace-nowrap handwritten">
            FROM YOUR FAVORITE PEOPLE --- WHO TOTALLY DIDN'T FORGET YOUR BIRTHDAY --- UNTIL THE LAST MINUTE ---
          </div>
        </div>
      </div>
      
      {/* Doodles */}
      <div className="absolute bottom-2 left-4 text-red-400 handwritten text-xs -rotate-6">
        xoxo
      </div>
      <div className="absolute bottom-2 right-4 text-red-400 handwritten text-xs rotate-6">
        the end!
      </div>
    </footer>
  );
};

export default Footer;
