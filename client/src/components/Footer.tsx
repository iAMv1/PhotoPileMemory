import { FC } from 'react';
import { motion } from 'framer-motion';

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
        
        <div className="flex justify-center space-x-6 mt-2">
          <motion.div 
            className="text-sm handwritten text-pink-600 font-bold"
            animate={{ opacity: [0.7, 1, 0.7], y: [0, -2, 0] }}
            transition={{ duration: 2.1, repeat: Infinity }}
          >
            Janamdin ke shubhkamanayein!
          </motion.div>
          <motion.div 
            className="text-sm handwritten text-blue-600 font-bold"
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Janam din ki hardik badhai!
          </motion.div>
          <motion.div 
            className="text-sm handwritten text-purple-600 font-bold"
            animate={{ rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Janamdin par dher saari badhaiyan!
          </motion.div>
        </div>
        
        <p className="text-xs mt-2 animate-pulse text-blue-800">Tip: Try the Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) if you can still remember it, grandpa</p>
        <div className="mt-2 text-blue-700 text-[10px] overflow-hidden">
          <div className="animate-marquee whitespace-nowrap handwritten">
            FROM YOUR FAVORITE PEOPLE --- WHO TOTALLY DIDN'T FORGET YOUR BIRTHDAY --- UNTIL THE LAST MINUTE --- HAPPY BIRTHDAY BUDDHA --- EK AUR SAAL GUZAR GAYA --- PARTY KIDHAR HAI? ---
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
      <motion.div 
        className="absolute top-2 left-10 text-green-500 handwritten text-xs rotate-6"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Janmadin ki Ram Ram!
      </motion.div>
      <motion.div 
        className="absolute top-2 right-10 text-orange-500 handwritten text-xs -rotate-3"
        animate={{ y: [0, -2, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Janamdin ki lakh lakh badhai!
      </motion.div>
    </footer>
  );
};

export default Footer;
