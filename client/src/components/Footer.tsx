import { FC } from 'react';

interface FooterProps {
  themeClass: string;
}

const Footer: FC<FooterProps> = ({ themeClass }) => {
  return (
    <footer className={`bg-gray-900 text-white text-center py-4 border-t-2 border-cyan-400 ${themeClass}`}>
      <p className="text-sm">Made with <span className="text-pink-500">♥</span> for your birthday</p>
      <p className="text-xs mt-2">Tip: Try the Konami Code (↑ ↑ ↓ ↓ ← → ← → B A)</p>
    </footer>
  );
};

export default Footer;
