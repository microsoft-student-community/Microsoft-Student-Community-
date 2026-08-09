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
  const activeLabel = items.find((item) => item.id === activeItem)?.label || 'Workspace'

  return (
    <div className="admin-crm flex h-screen overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-[276px] bg-[#101827] text-slate-200 border-r border-white/10 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0078d4] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Component className="w-5 h-5" />
            </div>
            <span className="font-semibold text-[15px] tracking-wide text-white">{logoText}</span>
          </div>
          <button aria-label="Close menu" className="ml-auto md:hidden text-slate-300 hover:bg-white/10 p-2 rounded-lg" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-7 px-3 space-y-1">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[.16em] mb-3">Workspace</p>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#0078d4] text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-white/[.07] hover:text-white'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-400/10 transition-all"
          >
            <LogOut className="w-[18px] h-[18px] text-rose-300" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="admin-crm-main flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-[#101827] border-b border-white/10 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0078d4] flex items-center justify-center text-white">
              <Component className="w-4 h-4" />
            </div>
            <span className="font-semibold text-white">{logoText}</span>
          </div>
          <button aria-label="Open menu" className="text-white hover:bg-white/10 p-2 rounded-lg" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <header className="hidden md:flex min-h-20 px-8 items-center justify-between border-b border-white/[0.08] bg-[#09090b]/55 backdrop-blur-xl shrink-0">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[.18em] font-semibold">Operations workspace</p>
            <h1 className="mt-1 text-lg text-white font-semibold tracking-tight">{activeLabel}</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] text-blue-300 font-semibold uppercase tracking-[.12em]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#38a3ff]" /> System online
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 relative">
          <div className="admin-crm-content mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
