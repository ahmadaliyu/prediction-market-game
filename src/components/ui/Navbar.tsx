'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, TrendingUp, Trophy, Wallet, PlusCircle, Menu, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import WalletButton from './WalletButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store';

const navItems = [
  { href: '/', label: 'Arena', icon: Gamepad2 },
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/create', label: 'Create', icon: PlusCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode, initTheme } = useThemeStore();

  // Initialize theme from localStorage on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
          ? 'bg-arena-surface/95 backdrop-blur-xl border-b border-arena-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-arena-surface/60 backdrop-blur-lg border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-9 h-9 rounded-lg bg-arena-primary
                          flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,212,232,0.5)] 
                          transition-shadow duration-300"
              >
                <span className="text-lg font-bold text-black">P</span>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-arena-green"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-arena-primary">
                Prediction Arena
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">on Avalanche</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'text-arena-primary bg-arena-primary/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-arena-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-arena-card border border-arena-border hover:border-arena-primary/50 
                         transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-arena-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <WalletButton />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-arena-surface border-t border-arena-border"
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'text-arena-primary bg-arena-primary/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
