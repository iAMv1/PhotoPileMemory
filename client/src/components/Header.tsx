import { FC } from 'react';

interface HeaderProps {
  themeClass: string;
}

const Header: FC<HeaderProps> = ({ themeClass }) => {
  return (
    <header className={`relative py-4 px-6 bg-gradient-to-r from-pink-500 to-cyan-400 border-b-4 border-dashed border-fuchsia-500 ${themeClass}`}>
      <h1 
        className="text-5xl font-extrabold text-center tracking-widest glitch" 
        data-text="OMG UR OLD NOW!!!"
      >
        OMG UR OLD NOW!!!
      </h1>
      <div className="flex justify-center mt-2">
        <span className="rainbow-text text-xl font-bold">CONGRATS ON SURVIVING ANOTHER YEAR LOL!!1!!</span>
      </div>
      <div className="text-center mt-1 text-sm">
        <span className="italic text-white">* this site intentionally looks like it was made in 1997 *</span>
      </div>
    </header>
  );
};

export default Header;
