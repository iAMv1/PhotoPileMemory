import { FC } from 'react';

interface HeaderProps {
  themeClass: string;
}

const Header: FC<HeaderProps> = ({ themeClass }) => {
  return (
    <header className={`relative py-4 px-6 bg-gradient-to-r from-pink-500 to-cyan-400 border-b-4 border-dashed border-fuchsia-500 ${themeClass}`}>
      <h1 
        className="text-4xl font-bold text-center tracking-widest glitch" 
        data-text="HAPPY BIRTHDAY!"
      >
        HAPPY BIRTHDAY!
      </h1>
      <div className="flex justify-center mt-2">
        <span className="rainbow-text text-xl font-bold">DRAG ALL THE THINGS!!1!</span>
      </div>
    </header>
  );
};

export default Header;
