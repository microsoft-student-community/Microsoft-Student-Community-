'use client'

import React from 'react'

export default function AboutTab() {
  return (
    <div className="bg-slate-900  border border-slate-800 rounded-md overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-blue-600">
        <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-3">
          <i className="fas fa-info-circle text-blue-400"></i>
          About MSC System
        </h2>
      </div>

      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-sans font-semibold text-slate-100 mb-2">Microsoft Student Community - SRM AP</h3>
          <p className="text-slate-300 leading-relaxed text-sm">
            The MSC Event Management System is a specialized, high-performance platform built exclusively for the Microsoft Student Community at SRM University AP. It handles end-to-end event registrations, matchmaking, QR ticket generation, and core member administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/30 border border-slate-800 rounded-md p-5 hover:border-blue-500/30 hover:bg-slate-800/30 transition-all duration-300">
            <h4 className="text-blue-400 font-sans font-semibold mb-2 flex items-center gap-2"><i className="fas fa-shield-alt"></i> Security & Roles</h4>
            <p className="text-xs text-slate-100/55 leading-relaxed">
              Strict Role-Based Access Control (RBAC) ensures Core Members can manage events and team members, while Admins have exclusive access to User Roles.
            </p>
          </div>
          <div className="bg-slate-800/30 border border-slate-800 rounded-md p-5 hover:border-green-500/30 hover:bg-slate-800/30 transition-all duration-300">
            <h4 className="text-green-400 font-sans font-semibold mb-2 flex items-center gap-2"><i className="fas fa-bolt"></i> Performance</h4>
            <p className="text-xs text-slate-100/55 leading-relaxed">
              Powered by Next.js 15 App Router and Supabase, the system leverages aggressive caching and Edge computing for sub-100ms response times globally.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            Version 2.0.0 &bull; Built for MSC SRM AP
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/mscsrmap/mscsrmap" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800/50 border border-slate-800 hover:border-slate-800 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all">
              <i className="fab fa-github text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
