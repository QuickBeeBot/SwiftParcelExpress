// src/components/Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser, signOut } = useAuth(); // ✅ Correct: 'currentUser', not 'user'
  const { language, changeLanguage, t } = useLanguage();

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/quote', label: t('nav.quote') },
    { path: '/track', label: t('nav.track') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#1F1F1F]/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center group">
            <img 
              src="/images/logo.png" 
              alt="SwiftParcel logo" 
              className="h-6 w-auto transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#36FFDB] ${
                  isActive(link.path) ? 'text-[#36FFDB]' : 'text-white/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-[#36FFDB] hover:bg-white/5">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#151515] border-white/10 text-white min-w-[150px]">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`cursor-pointer hover:bg-white/10 focus:bg-white/10 ${language === lang.code ? 'text-[#36FFDB]' : ''}`}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authenticated vs Guest UI - Desktop */}
            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-white hover:text-[#36FFDB] hover:bg-white/5">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  className="border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {t('nav.signout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-[#36FFDB] hover:bg-white/5">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/login?signup=true">
                  <Button className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] font-bold transition-all">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white hover:text-[#36FFDB] transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-[#151515] border-t border-white/10"
            >
              <div className="py-4 space-y-4 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block text-sm font-medium transition-colors hover:text-[#36FFDB] ${
                      isActive(link.path) ? 'text-[#36FFDB]' : 'text-white/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Language Selection */}
                <div className="py-2 border-y border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setIsOpen(false); }}
                        className={`text-sm text-left px-2 py-1 rounded ${language === lang.code ? 'text-[#36FFDB] bg-white/5' : 'text-white/60'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 space-y-3">
                  {/* Authenticated vs Guest UI - Mobile */}
                  {currentUser ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block w-full">
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-[#36FFDB]">
                          <User className="w-4 h-4 mr-2" />
                          {t('nav.dashboard')}
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => { signOut(); setIsOpen(false); }} 
                        variant="outline" 
                        className="w-full justify-start border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        {t('nav.signout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full">
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-[#36FFDB]">
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link to="/login?signup=true" onClick={() => setIsOpen(false)} className="block w-full">
                        <Button className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] font-bold">
                          {t('nav.signup')}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
