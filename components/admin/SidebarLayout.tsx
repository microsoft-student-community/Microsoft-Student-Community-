'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Key, Calendar, LayoutDashboard, Settings, LogOut, Menu, X, Component } from 'lucide-react'

export interface SidebarItem {
  id: string
  label: string
  icon: React.ElementType
}

interface SidebarLayoutProps {
  items: SidebarItem[]
  activeItem: string
  onSelect: (id: string) => void
  logoText: string
  onLogout: () => void
  children: React.ReactNode
}

export default function SidebarLayout({ items, activeItem, onSelect, logoText, onLogout, children }: SidebarLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#fdfaf6] overflow-hidden text-black font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-2 md:border-4 border-black flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b-2 md:border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#FFEB3B] flex items-center justify-center text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ">
              <Component className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-black">{logoText}</span>
          </div>
          <button className="ml-auto md:hidden text-gray-800 font-bold hover:bg-[#E0E0E0] p-2 rounded-none" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'text-black hover:bg-[#f4f4f0] hover:text-black'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t-2 md:border-t-4 border-black">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fdfaf6]">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-2 md:border-4 border-black flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#FFEB3B] flex items-center justify-center text-black font-bold">
              <Component className="w-4 h-4" />
            </div>
            <span className="font-bold text-black">{logoText}</span>
          </div>
          <button className="text-black hover:bg-[#E0E0E0] p-2 rounded-none" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
