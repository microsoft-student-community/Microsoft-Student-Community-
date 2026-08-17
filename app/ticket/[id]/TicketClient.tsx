"use client";

import React, { useEffect, useState } from "react";
import {
 Calendar,
 MapPin,
 Clock,
 User,
 Users,
 CheckCircle2,
 AlertCircle,
 QrCode,
 Download,
 Info
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

export default function TicketClient({ ticket }: { ticket: any }) {
 const [mounted, setMounted] = useState(false);
 const [showQR, setShowQR] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 if (!mounted) return null;

 const event = ticket.events;
 const formData = ticket.form_data || {};
 const teamData = ticket.team_data;
 const isTeam = !!teamData;
 const isConfirmed = ticket.status === "confirmed";
 const isCheckedIn = ticket.checked_in;
 
 const attendeeName = formData.fullName || formData.name || formData.full_name || "Attendee";
 const attendeeEmail = formData.email || "";

 // The URL encoded in the QR code for scanners
 const scanUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/ticket/${ticket.hash_payload}`;
 const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}&margin=10`;

 return (
 <div className="min-h-screen bg-[#050914] text-slate-100 font-sans selection:bg-[#0078d4] selection:text-white relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
 {/* Dynamic Backgrounds */}
 <div className="absolute inset-0 z-0">
 <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#0078d4]/20 rounded-full hidden animate-pulse" style={{ animationDuration: '4s' }} />
 <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#a8329b]/20 rounded-full hidden animate-pulse" style={{ animationDuration: '5s' }} />
 </div>
 <ParticleBackground particleColor="rgba(0, 120, 212, 0.4)" />

 {/* Main Ticket Card Container */}
 <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
 
 {/* Ticket Top (Brand & Event Info) */}
 <div className="relative rounded-t-[32px] bg-slate-900 border-t border-x border-white/10 p-8 shadow-md overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-[#0078d4]/20 hidden rounded-full pointer-events-none" />
 
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-2">
 <img src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png" alt="MSC" className="w-5 h-5 brightness-0 invert opacity-90" />
 <span className="font-syne font-black text-xs tracking-widest text-white/90">MSC SRMAP</span>
 </div>
 <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase border ${
 isCheckedIn ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm' :
 isConfirmed ? 'bg-[#0078d4]/10 text-[#0078d4] border-[#0078d4]/30' :
 'bg-amber-500/10 text-amber-400 border-amber-500/30'
 }`}>
 {isCheckedIn ? 'CHECKED IN' : isConfirmed ? 'CONFIRMED' : 'WAITLISTED'}
 </span>
 </div>

 <div className="space-y-4">
  <div>
  <span className="inline-block px-2 py-0.5 rounded border border-white/10 bg-slate-800 text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-3">
  {event?.type || event?.category || "EVENT TICKET"}
  </span>
  <h1 className="font-syne font-black text-3xl text-white leading-[1.1] tracking-tight line-clamp-2">
  {event?.title}
  </h1>
  </div>

  <div className="pt-2 flex flex-col gap-2.5">
  <div className="flex items-center gap-3 text-slate-300">
  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
  <Calendar className="w-3.5 h-3.5 text-[#0078d4]" />
  </div>
  <div className="flex flex-col">
  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Date</span>
  <span className="text-xs font-semibold">{event?.date_start ? new Date(event.date_start).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
  </div>
  </div>
  
  <div className="flex items-center gap-3 text-slate-300">
  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
  <MapPin className="w-3.5 h-3.5 text-[#a8329b]" />
  </div>
  <div className="flex flex-col">
  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Venue</span>
  <span className="text-xs font-semibold">{event?.location || event?.venue || 'TBA'}</span>
  </div>
  </div>
  </div>
 </div>
 </div>

 {/* Ticket Perforation Divider */}
 <div className="relative h-6 bg-slate-900 border-x border-white/10 flex items-center shadow-md">
 {/* Left Cutout */}
 <div className="absolute left-[-12px] w-6 h-6 rounded-full bg-[#050914] border-r border-white/10 shadow-sm" />
 {/* Dashed Line */}
 <div className="w-full border-t-[1.5px] border-dashed border-white/15 mx-6" />
 {/* Right Cutout */}
 <div className="absolute right-[-12px] w-6 h-6 rounded-full bg-[#050914] border-l border-white/10 shadow-sm" />
 </div>

 {/* Ticket Bottom (Attendee Info & QR) */}
 <div className="relative rounded-b-[32px] bg-slate-900 border-b border-x border-white/10 p-8 shadow-md overflow-hidden flex flex-col items-center">
 
 {/* Attendee Details */}
 <div className="w-full flex items-center justify-between mb-8 p-4 rounded-2xl bg-slate-800 border border-white/10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0078d4] to-[#a8329b] flex items-center justify-center text-white font-syne font-bold">
 {attendeeName.charAt(0).toUpperCase()}
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
 {isTeam ? 'Team Lead' : 'Attendee'}
 </span>
 <span className="text-sm font-bold text-white max-w-[140px] truncate">{attendeeName}</span>
 </div>
 </div>
 
 {isTeam && teamData.team_name && (
 <div className="flex flex-col items-end text-right">
 <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Team</span>
 <span className="text-sm font-bold text-[#0078d4] max-w-[100px] truncate">{teamData.team_name}</span>
 </div>
 )}
 </div>

 {/* QR Code Section */}
 <div className="relative group cursor-pointer" onClick={() => setShowQR(!showQR)}>
 <div className={`p-3 bg-white rounded-2xl shadow-sm transition-all duration-500 ${showQR ? 'scale-110' : 'hover:scale-105'}`}>
 <img src={qrCodeUrl} alt="Ticket QR Code" className="w-40 h-40 object-contain rounded-xl pointer-events-none" />
 </div>
 
 {!showQR && (
 <div className="absolute inset-0 bg-slate-900 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ">
 <QrCode className="w-8 h-8 text-white" />
 </div>
 )}
 </div>

 <p className="text-[10px] font-mono text-slate-500 mt-6 text-center max-w-[250px]">
 Present this QR code to the event coordinators upon arrival. Do not share this ticket.
 </p>
 </div>
 
 {/* Floating Action Button */}
 <div className="mt-8 flex justify-center">
 <button 
 onClick={() => window.print()}
 className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-800 border border-white/10 text-xs font-bold text-white flex items-center gap-2 transition-all hover:scale-105"
 >
 <Download className="w-4 h-4" />
 Save Ticket
 </button>
 </div>
 </div>
 </div>
 );
}
