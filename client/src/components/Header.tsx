import { FC } from 'react';

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
      </div>
      
      {/* Some decorative elements */}
      <div className="absolute top-4 right-4 text-red-500 text-3xl handwritten rotate-12">
        HAPPY B-DAY LOSER!
      </div>
      <div className="absolute top-6 left-4 text-blue-500 text-lg handwritten -rotate-6">
        don't fall<br/>& break a hip!
      </div>
    </header>
  );
};

export default Header;
