'use client'

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
}

interface NavMenuProps {
  items: MenuItem[];
  activeItem: string;
  onSelect: (id: string) => void;
  logoText: string;
  onLogout: () => void;
}

export default function NavMenu({ items, activeItem, onSelect, logoText, onLogout }: NavMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-2xl flex items-center w-full h-[72px]">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center" style={{ pointerEvents: 'none' }}>
          <img src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png" alt="MSC Logo" className="w-[115px] h-[35px] md:w-[130px] md:h-[40px] rounded-[18px]" />
          <span className="font-sans font-black tracking-widest text-base sm:text-lg bg-white bg-clip-text text-transparent uppercase hidden sm:inline ml-3">
            {logoText}
          </span>
        </div>

        {/* Mobile menu toggle button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden z-20 p-2"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className={`w-6 h-0.5 bg-white mb-1.5 transition-transform duration-300 ${isMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white mb-1.5 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></div>
        </button>
        
        {/* Menu container */}
        <div className={`
          absolute top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-black/95 backdrop-blur-3xl
          md:static md:w-auto md:h-auto md:bg-transparent md:backdrop-blur-none
          flex items-center justify-center
          ${isMenuOpen ? 'flex' : 'hidden md:flex'}
        `}>
          <ul className={`
            flex flex-col items-center space-y-6
            md:flex-row md:space-y-0 md:space-x-2 md:justify-center
            lg:space-x-4
          `}>
            {items.map((item) => (
              <li key={item.id} className="list-none">
                <button 
                  className="relative inline-block group"
                  onClick={() => { onSelect(item.id); setIsMenuOpen(false); }}
                >
                  {/* Link text */}
                  <span className={`
                    relative z-10 block uppercase 
                    font-sans font-semibold transition-colors duration-300 
                    text-xl py-2 px-3 md:text-[13px] md:py-2 md:px-3
                    ${activeItem === item.id ? 'text-white' : 'text-[#a1a1aa] group-hover:text-white'}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Top & bottom border animation */}
                  <span className={`
                    absolute inset-0 border-t-2 border-b-2 border-white
                    transform scale-y-[2] transition-all duration-300 origin-center
                    ${activeItem === item.id ? 'opacity-100 scale-y-100' : 'opacity-0 group-hover:scale-y-100 group-hover:opacity-100'}
                  `} />
                  
                  {/* Background fill animation */}
                  <span className={`
                    absolute top-[2px] left-0 w-full h-full bg-white/10
                    transform transition-all duration-300 origin-top
                    ${activeItem === item.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}
                  `} />
                </button>
              </li>
            ))}
            
            <li className="list-none mt-8 md:mt-0 md:ml-4">
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-5 py-2 md:py-1.5 rounded-full text-sm md:text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all w-full md:w-auto"
              >
                Logout
                <LogOut className="w-4 h-4 md:hidden" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
