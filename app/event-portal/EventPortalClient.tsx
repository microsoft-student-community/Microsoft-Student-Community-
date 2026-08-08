"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import EventPortalTabs from "./EventPortalTabs";
import EventModal from "./EventModal";
import { Calendar, MapPin, ArrowRight, Sparkles, ChevronLeft, Users, Clock, Tag, X } from "lucide-react";

export default function EventPortalClient({
  events,
  selectedEvent,
  openTeams,
  invitedTeam,
  registeredCount = 0,
}: {
  events: any[];
  selectedEvent: any;
  openTeams: any[];
  invitedTeam: any;
  registeredCount?: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const [activeEvent, setActiveEvent] = useState(selectedEvent);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    setActiveEvent(selectedEvent);
    if (!selectedEvent) setShowRegistration(false);
  }, [selectedEvent]);

  const closeEvent = () => {
    setActiveEvent(null);
    setShowRegistration(false);
    router.push("/event-portal", { scroll: false });
  };

  const filteredEvents = events.filter((e) => {
    if (filter === "upcoming") return e.status !== "completed";
    if (filter === "completed") return e.status === "completed";
    return true;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

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
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center">

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-16 mt-4"
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
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
              >
                {filteredEvents.map((evt) => {
                  const isCompleted = evt.status === "completed";
                  const isFree = evt.form_requirements?.event_pricing === "free";
                  return (
                    <motion.div key={evt.id} variants={itemVariants} className="h-full">
                      <Link href={`/event-portal?event=${evt.id}`} scroll={false}>
                        <div className={`group h-full flex flex-col bg-[#18181b]/60 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isCompleted
                          ? 'border-white/5 opacity-80 grayscale-[20%]'
                          : 'border-white/10 hover:border-[#0078d4]/50'
                          }`}>

                          <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative bg-slate-900 border border-white/5">
                            {evt.banner_url ? (
                              <img
                                src={evt.banner_url}
                                alt={evt.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#0078d4]/20 to-purple-500/20 flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-white/20" />
                              </div>
                            )}
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                              <div className={`px-3 py-1 text-[10px] font-bold rounded-full backdrop-blur-md border ${isCompleted
                                ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                : 'bg-[#0078d4]/20 text-blue-300 border-[#0078d4]/30'
                                }`}>
                                {isCompleted ? "COMPLETED" : "UPCOMING"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(evt.date_start).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" })}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[80px]" title={evt.location}>{evt.location || "TBA"}</span>
                            </span>
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
        </div>
      </div>

      {/* Professional Footer */}
      <div className="mt-24 pt-8 border-t border-white/10 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm px-4">
        <p>© 2026 Microsoft Student Community. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="mailto:msc.community@srmap.edu.in" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
      {/* Event Modal */}
      <AnimatePresence>
        {activeEvent && !showRegistration && (
          <EventModal
            key="event-modal"
            event={activeEvent}
            registeredCount={registeredCount}
            onClose={closeEvent}
            onRegisterClick={() => setShowRegistration(true)}
          />
        )}
      </AnimatePresence>

      {/* Registration Modal overlay wrapping EventPortalTabs */}
      <AnimatePresence>
        {showRegistration && activeEvent && (
          <div key="registration-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4 py-10 overflow-y-auto bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl relative mt-auto mb-auto"
            >
              <button
                onClick={() => setShowRegistration(false)}
                className="absolute -top-12 right-0 md:-right-12 md:top-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md z-[120] border border-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-full bg-[#18181b]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl overflow-hidden min-h-[600px]">
                <EventPortalTabs
                  event={activeEvent}
                  openTeams={openTeams}
                  invitedTeam={invitedTeam}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
