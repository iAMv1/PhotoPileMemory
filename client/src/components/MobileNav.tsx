import { FC, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, User, LogIn, UserPlus, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home, show: true },
    { href: `/birthday/${user?.username}`, label: 'My Page', icon: User, show: isAuthenticated },
    { href: '/profile', label: 'Settings', icon: Settings, show: isAuthenticated },
    { href: '/login', label: 'Login', icon: LogIn, show: !isAuthenticated },
    { href: '/register', label: 'Sign Up', icon: UserPlus, show: !isAuthenticated },
  ];

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-40 p-6"
            >
              <div className="flex flex-col h-full">
                {/* User Info */}
                {isAuthenticated && user && (
                  <div className="mb-6 pb-6 border-b">
                    <p className="text-sm text-gray-500">Logged in as</p>
                    <p className="font-semibold text-lg">{user.displayName || user.username}</p>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2">
                  {navLinks
                    .filter((link) => link.show)
                    .map((link) => {
                      const Icon = link.icon;
                      const isActive = location === link.href;

                      return (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant={isActive ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {link.label}
                          </Button>
                        </Link>
                      );
                    })}
                </nav>

                {/* Logout Button */}
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}

                {/* App Info */}
                <div className="mt-6 pt-6 border-t text-center text-xs text-gray-500">
                  PhotoPileMemory
                  <br />
                  Make birthdays memorable! 🎂
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
