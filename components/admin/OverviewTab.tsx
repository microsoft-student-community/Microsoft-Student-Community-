"use client";

import React from "react";
import { AdminTab } from "./AdminNavbar";
import { triggerHaptic } from "@/utils/haptic";
import {
  Calendar,
  Users,
  ImageIcon,
  Megaphone,
  QrCode,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  CheckCircle2,
  Bell,
  FileText,
} from "lucide-react";

interface OverviewTabProps {
  events: any[];
  team: any[];
  gallery: any[];
  announcements: any[];
  setActiveTab: (tab: AdminTab) => void;
  userRole: "admin" | "core_member" | null;
  userEmail: string;
  onOpenQRScanner: (eventId?: string) => void;
}

export default function OverviewTab({
  events,
  team,
  gallery,
  announcements,
  setActiveTab,
  userRole,
  userEmail,
  onOpenQRScanner,
}: OverviewTabProps) {
  const publishedEvents = events.filter((e) => e.is_published !== false);
  const activeAnnouncements = announcements.filter(
    (a) => a.is_active !== false,
  );
  const upcomingEvent =
    events.find((e) => new Date(e.date) >= new Date()) || events[0];

  const metrics = [
    {
      id: "events",
      title: "Published Events",
      count: publishedEvents.length,
      subtitle: `${events.length} total registered in system`,
      icon: Calendar,
      accent:
        "from-blue-600/20 to-blue-500/5 text-[#0078d4] border-blue-500/30",
      iconBg: "bg-blue-500/10 text-[#0078d4]",
      tab: "events" as AdminTab,
    },
    {
      id: "team",
      title: "Core Team Members",
      count: team.length,
      subtitle: "Active leads & core members",
      icon: Users,
      accent:
        "from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/30",
      iconBg: "bg-purple-500/10 text-purple-400",
      tab: "team" as AdminTab,
    },
    {
      id: "announcements",
      title: "Active Notices",
      count: activeAnnouncements.length,
      subtitle: "Live campus alert broadcasts",
      icon: Megaphone,
      accent:
        "from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/30",
      iconBg: "bg-amber-500/10 text-amber-400",
      tab: "announcements" as AdminTab,
    },
    {
      id: "gallery",
      title: "Media Assets",
      count: gallery.length,
      subtitle: "Event photos & showcases",
      icon: ImageIcon,
      accent:
        "from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      tab: "gallery" as AdminTab,
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0e172a] to-[#0a1122] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0078d4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                SYSTEM ONLINE
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                MSC WORKSPACE // {userRole?.toUpperCase()}
              </span>
            </div>

            <h1 className="font-syne font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Welcome back,{" "}
              <span className="text-[#0078d4] font-serif italic font-normal">
                {userEmail.split("@")[0]}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-light leading-relaxed">
              Enterprise CRM dashboard for Microsoft Student Community SRMAP —
              Manage event logistics, team rosters, notice broadcasts, and
              system telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                triggerHaptic("light");
                onOpenQRScanner();
              }}
              className="px-5 py-3 rounded-2xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/25 hover:shadow-[#0078d4]/40 transition-all flex items-center gap-2 group active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Scan QR Check-in</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setActiveTab("events");
              }}
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Manage Events</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={() => {
                triggerHaptic("light");
                setActiveTab(m.tab);
              }}
              className={`group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border ${m.accent} transition-all duration-200 cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                  {m.title}
                </span>
                <div className={`p-2.5 rounded-xl ${m.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-syne font-extrabold text-3xl text-white group-hover:text-[#a4d8ff] transition-colors">
                    {m.count}
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {m.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Dashboard Grid: Featured Event & Quick Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Featured Event Banner (7/12) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0078d4]" />
                <h3 className="font-syne font-bold text-base text-white">
                  Featured / Upcoming Event
                </h3>
              </div>
              <button
                onClick={() => {
                  triggerHaptic("light");
                  setActiveTab("events");
                }}
                className="text-xs font-mono text-[#a4d8ff] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingEvent ? (
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {upcomingEvent.poster_url && (
                  <img
                    src={upcomingEvent.poster_url}
                    alt={upcomingEvent.title}
                    className="w-full md:w-36 h-36 object-cover rounded-2xl border border-slate-800 shrink-0"
                  />
                )}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#a4d8ff] text-[10px] font-mono font-semibold uppercase">
                      {upcomingEvent.category || "Workshop"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Published
                    </span>
                  </div>

                  <h4 className="font-syne font-bold text-xl text-white">
                    {upcomingEvent.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0078d4]" />
                      <span>
                        {new Date(upcomingEvent.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    {upcomingEvent.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{upcomingEvent.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => {
                        triggerHaptic("light");
                        onOpenQRScanner(upcomingEvent.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Start QR Check-in</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No events currently scheduled. Click &quot;+ New Event&quot; to
                create one.
              </div>
            )}
          </div>

          {/* Quick Action Shortcuts Grid */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-syne font-bold text-sm text-slate-300">
              Quick Management Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab("events")}
                className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <Calendar className="w-4 h-4 text-[#0078d4] mb-2 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-semibold text-white">
                  Create Event
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Publish new event
                </span>
              </button>

              <button
                onClick={() => setActiveTab("announcements")}
                className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <Megaphone className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-semibold text-white">
                  Post Notice
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Broadcast alert
                </span>
              </button>

              <button
                onClick={() => setActiveTab("team")}
                className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <Users className="w-4 h-4 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-semibold text-white">
                  Add Team Member
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Update roster
                </span>
              </button>

              <button
                onClick={() => setActiveTab("blogs")}
                className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <FileText className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-semibold text-white">
                  Write Article
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Publish story
                </span>
              </button>

              <button
                onClick={() => setActiveTab("gallery")}
                className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <ImageIcon className="w-4 h-4 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-semibold text-white">
                  Upload Media
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Add event photos
                </span>
              </button>

              {userRole === "admin" && (
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-semibold text-white">
                    Manage Roles
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Access control
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Broadcasts Feed (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-syne font-bold text-sm text-white">
                  Active Notice Broadcasts
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("announcements")}
                className="text-xs font-mono text-[#a4d8ff] hover:underline"
              >
                Manage All
              </button>
            </div>

            <div className="space-y-3">
              {activeAnnouncements.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-4 text-center">
                  No active notices broadcast.
                </p>
              ) : (
                activeAnnouncements.slice(0, 4).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                        {ann.title}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                        {ann.priority || "NORMAL"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-light">
                      {ann.content}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block pt-1">
                      {new Date(
                        ann.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
