import { FC } from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  themeClass: string;
}

const Header: FC<HeaderProps> = ({ themeClass }) => {
  return (
    <header className={`relative py-6 px-6 bg-white border-b-2 border-blue-200 shadow-md ${themeClass}`}>
      {/* Graph paper background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] h-full w-full opacity-20 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`header-col-${i}`} className="border-r border-blue-300"></div>
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-[repeat(10,1fr)] h-full w-full opacity-20 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`header-row-${i}`} className="border-b border-blue-300"></div>
        ))}
      </div>
      
      {/* Red margin line */}
      <div className="absolute top-0 bottom-0 left-16 border-l-2 border-red-300"></div>
      
      <div className="relative ml-16">
        <h1 
          className="text-5xl font-extrabold text-center tracking-widest handwritten text-blue-900" 
          data-text="OMG UR OLD NOW!!!"
        >
          OMG UR OLD NOW!!!
        </h1>
        <div className="flex justify-center mt-2">
          <span className="rainbow-text text-xl font-bold handwritten">CONGRATS ON SURVIVING ANOTHER YEAR LOL!!1!!</span>
        </div>
        <div className="text-center mt-1">
          <span className="italic text-gray-500 text-sm">* this birthday card is intentionally embarrassing *</span>
        </div>
        <div className="flex justify-center space-x-8 mt-3">
          <motion.div 
            className="text-xl handwritten text-fuchsia-600 font-bold"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 3, 0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Janamdin Mubarak Ho!
          </motion.div>
          <motion.div 
            className="text-xl handwritten text-blue-600 font-bold"
            animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Janmadin ki Badhai!
          </motion.div>
          <motion.div 
            className="text-xl handwritten text-green-600 font-bold"
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Shubbh Janamdin!
          </motion.div>
        </div>
      </div>
      
      {/* Some decorative elements */}
      <div className="absolute top-4 right-4 text-red-500 text-3xl handwritten rotate-12">
        HAPPY B-DAY LOSER!
      </div>
      <div className="absolute top-6 left-4 text-blue-500 text-lg handwritten -rotate-6">
        don't fall<br/>& break a hip!
      </div>
      <motion.div 
        className="absolute bottom-2 right-10 text-purple-600 text-xl handwritten rotate-6"
        animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        Buddhu ka Birthday!
      </motion.div>
      <motion.div 
        className="absolute bottom-3 left-20 text-orange-500 text-lg handwritten -rotate-3"
        animate={{ rotate: [-3, 0, -3], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Ek aur saal boodha ho gaya!
      </motion.div>
    </header>
  );
};

export default Header;
