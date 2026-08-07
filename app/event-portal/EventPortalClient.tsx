"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import EventPortalTabs from "./EventPortalTabs";
import { Calendar, MapPin, ArrowRight, Sparkles, ChevronLeft, Users, Clock, Tag } from "lucide-react";

export default function EventPortalClient({
  events,
  selectedEvent,
  openTeams,
  invitedTeam,
}: {
  events: any[];
  selectedEvent: any;
  openTeams: any[];
  invitedTeam: any;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const filteredEvents = events.filter((e) => {
    if (filter === "upcoming") return e.status !== "completed";
    if (filter === "completed") return e.status === "completed";
    return true;
  });

  const isWaitlistMode = selectedEvent?.max_capacity ? false : false;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const startDate = selectedEvent?.date_start 
    ? new Date(selectedEvent.date_start).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
      })
    : "TBA";

  const startTime = selectedEvent?.date_start
    ? new Date(selectedEvent.date_start).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
      })
    : "TBA";

  return (
    <main className="min-h-screen relative font-sans text-slate-100 selection:bg-[#0078d4] selection:text-white overflow-x-hidden flex flex-col bg-[#0f0f11]">
      {/* Subtle Fluent Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[800px] h-[800px] bg-[#0078d4] opacity-[0.03] rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] bg-purple-600 opacity-[0.03] rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02]" />
      </div>

      {/* Navigation */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none"
      >
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shadow-lg backdrop-blur-xl group"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-sm font-semibold">Home</span>
        </Link>
      </motion.div>

      {/* Content Canvas */}
      <div className="relative z-10 flex-1 flex flex-col items-center pt-28 pb-24 px-4 w-full max-w-[1280px] mx-auto">
        
        {/* Dynamic Portal Body */}
        <div className="w-full">
          {selectedEvent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
              className="w-full flex flex-col lg:flex-row gap-8 items-start"
            >
              {/* LEFT COLUMN: Main Content */}
              <div className="w-full lg:w-2/3 flex flex-col gap-8">
                
                {/* Hero Banner Section */}
                <div className="w-full bg-[#18181b]/60 backdrop-blur-2xl border border-white/5 rounded-[24px] overflow-hidden relative shadow-2xl">
                  {selectedEvent.image_url ? (
                    <div className="w-full h-[320px] relative">
                      <img src={selectedEvent.image_url} alt="Event Poster" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#18181b]/90 via-[#18181b]/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="w-full h-[120px] bg-gradient-to-r from-[#0078d4]/20 to-purple-500/20" />
                  )}
                  
                  <div className={`px-8 lg:px-12 pb-12 ${selectedEvent.image_url ? '-mt-24 relative z-10' : 'pt-12'}`}>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#0078d4]/20 text-[#0078d4] text-xs font-bold rounded-full border border-[#0078d4]/30 backdrop-blur-md flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> {selectedEvent.type || "Event"}
                      </span>
                      <span className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-bold rounded-full border border-white/10 backdrop-blur-md">
                        Microsoft Student Community
                      </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                      {selectedEvent.title}
                    </h1>
                    
                    <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
                      {selectedEvent.description || "Join us for an incredible experience of learning, networking, and building the future."}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                        <span className="text-white font-medium">{startDate}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                        <span className="text-white font-medium">{startTime}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Venue</span>
                        <span className="text-white font-medium truncate" title={selectedEvent.location}>{selectedEvent.location || "TBA"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Capacity</span>
                        <span className="text-white font-medium">{selectedEvent.max_capacity ? `${selectedEvent.max_capacity} Seats` : "Unlimited"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Registration & Info Tabs */}
                <div className="w-full bg-[#18181b]/60 backdrop-blur-2xl border border-white/5 rounded-[24px] shadow-2xl overflow-hidden min-h-[600px]">
                  <EventPortalTabs
                    event={selectedEvent}
                    openTeams={openTeams}
                    invitedTeam={invitedTeam}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Sidebar Highlights (Fluent Design) */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
                
                {/* Dynamic Agenda */}
                {selectedEvent?.form_requirements?.agenda && selectedEvent.form_requirements.agenda.length > 0 && (
                  <div className="w-full bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#0078d4]" /> Event Agenda
                    </h3>
                    <div className="flex flex-col gap-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                      {selectedEvent.form_requirements.agenda.map((a: any, i: number) => (
                        <div key={i} className="flex gap-4 relative z-10">
                          <div className="w-6 h-6 rounded-full bg-[#18181b] border-2 border-[#0078d4] flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{a.time || a.t}</span>
                            <span className="text-sm text-slate-400">{a.title || a.d}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Speakers */}
                {selectedEvent?.form_requirements?.speakers && selectedEvent.form_requirements.speakers.length > 0 && (
                  <div className="w-full bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" /> Featured Speakers
                    </h3>
                    <div className="flex flex-col gap-4">
                      {selectedEvent.form_requirements.speakers.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                            <Users className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{s.name}</span>
                            <span className="text-xs text-slate-400">{s.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-[#0078d4]" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">MSC Events</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                  Discover Our <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0078d4] to-purple-500">Upcoming Events</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join the brightest minds at SRM University. Secure your spot, manage your team, and download your certificates.
                </p>
              </motion.div>

              {/* Filter Tabs */}
              <div className="flex p-1.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl mb-12 shadow-xl">
                {["all", "upcoming", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-8 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                      filter === f
                        ? "bg-[#0078d4] text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {f === "all" ? "All Events" : f}
                  </button>
                ))}
              </div>

              {/* Event Cards Grid */}
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 w-full bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
                  <p className="text-slate-400">Check back later for exciting new events!</p>
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants as any}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
                >
                  {filteredEvents.map((evt: any) => {
                    const evtDate = evt.date_start ? new Date(evt.date_start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "TBA";
                    const isCompleted = evt.status === "completed";
                    const isRegOpen = !!evt.registration_open;

                    return (
                      <motion.div key={evt.id} variants={itemVariants as any}>
                        <Link
                          href={`/event-portal?event=${evt.slug || evt.id}`}
                          className="group flex flex-col h-full bg-[#18181b]/60 backdrop-blur-xl border border-white/10 rounded-[20px] overflow-hidden hover:border-[#0078d4]/50 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,120,212,0.15)] hover:-translate-y-1"
                        >
                          {evt.image_url ? (
                            <div className="h-48 overflow-hidden relative">
                              <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent opacity-80" />
                              
                              <div className="absolute top-4 right-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md border ${
                                  isCompleted ? "bg-white/10 text-white/80 border-white/20" : isRegOpen ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                }`}>
                                  {isCompleted ? "Completed" : isRegOpen ? "Registration Open" : "Closed"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                              <div className="absolute top-4 right-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md border ${
                                  isCompleted ? "bg-white/10 text-white/80 border-white/20" : isRegOpen ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                }`}>
                                  {isCompleted ? "Completed" : isRegOpen ? "Open" : "Closed"}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {evtDate}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#0078d4] transition-colors leading-snug">
                              {evt.title}
                            </h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                              {evt.description || "Click to view event details and register."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 text-sm font-semibold text-[#0078d4] group-hover:text-white transition-colors">
                              {isCompleted ? "View Certificates" : "Explore Event"}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Professional Footer */}
        <div className="mt-24 pt-8 border-t border-white/10 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© 2026 Microsoft Student Community. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:msc.community@srmap.edu.in" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </main>
  );
}
