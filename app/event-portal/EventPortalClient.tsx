"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import EventPortalTabs from "./EventPortalTabs";

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

  const isWaitlistMode = selectedEvent?.max_capacity
    ? false // will be computed client-side in EventPortalTabs
    : false;

  return (
    <main className="min-h-screen relative">
      {/* Background Video */}
      <video
        className="background-video"
        muted
        loop
        playsInline
        autoPlay
        id="bgVideo"
        preload="metadata"
      >
        <source
          src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/Microsoft_Student_Community_Title_Card.mp4"
          type="video/mp4"
        />
      </video>
      <div className="background-overlay" />

      {/* Particle Canvas */}
      <ParticleBackground particleColor="rgba(0, 120, 212, alpha)" />

      {/* Back to Home */}
      <Link
        href="/"
        className="fixed top-7 left-8 flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium uppercase tracking-widest z-20 transition-colors"
      >
        <i className="fa-solid fa-arrow-left" />
        Back to home
      </Link>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-24 pb-16 px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="flex items-center justify-center gap-3 text-[#0078d4] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            <span className="w-10 h-px bg-[#0078d4]/30" />
            Event Portal
            <span className="w-10 h-px bg-[#0078d4]/30" />
          </div>
          {selectedEvent ? (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {selectedEvent.title}
              </h1>
              <p className="text-white/40 text-sm max-w-lg mx-auto">
                {selectedEvent.description ||
                  "Register, check your team details, and download certificates."}
              </p>
              <button
                onClick={() => router.push("/event-portal")}
                className="mt-4 text-xs text-[#0078d4] hover:text-blue-300 transition-colors font-semibold uppercase tracking-wider"
              >
                <i className="fas fa-chevron-left mr-1" />
                View All Events
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                MSC Event Portal
              </h1>
              <p className="text-white/40 text-sm max-w-lg mx-auto">
                Select an event to register, check your team details, retrieve
                your ticket, or download e-certificates.
              </p>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl">
          {selectedEvent ? (
            /* Event Portal Tabs */
            <EventPortalTabs
              event={selectedEvent}
              isWaitlistMode={isWaitlistMode}
              openTeams={openTeams}
              invitedTeam={invitedTeam}
            />
          ) : (
            /* Event Selector */
            <div>
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 bg-[#18181b]/40 backdrop-blur-md p-1.5 rounded-xl border border-white/5 max-w-md mx-auto">
                {(["all", "upcoming", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      filter === f
                        ? "bg-[#0078d4]/15 text-[#0078d4] border border-[#0078d4]/20"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {f === "all"
                      ? "All Events"
                      : f === "upcoming"
                        ? "Upcoming"
                        : "Completed"}
                  </button>
                ))}
              </div>

              {/* Event Cards */}
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <i className="fas fa-calendar-xmark text-3xl text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    No Events Found
                  </h3>
                  <p className="text-white/40 text-sm">
                    {filter !== "all"
                      ? "Try changing the filter."
                      : "Check back later for upcoming events!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEvents.map((evt: any) => {
                    const startDate = evt.date_start
                      ? new Date(evt.date_start).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Kolkata",
                        })
                      : "TBA";
                    const isCompleted = evt.status === "completed";
                    const isRegistrationOpen = !!evt.registration_open;

                    return (
                      <Link
                        key={evt.id}
                        href={`/event-portal?event=${evt.slug || evt.id}`}
                        className="group bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:border-[#0078d4]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,120,212,0.08)]"
                      >
                        {/* Card Image */}
                        {evt.image_url && (
                          <div className="h-36 overflow-hidden relative">
                            <img
                              src={evt.image_url}
                              alt={evt.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent" />

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border ${
                                  isCompleted
                                    ? "bg-white/10 text-white/60 border-white/10"
                                    : isRegistrationOpen
                                      ? "bg-green-500/15 text-green-400 border-green-500/20"
                                      : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                                }`}
                              >
                                {isCompleted
                                  ? "Completed"
                                  : isRegistrationOpen
                                    ? "Open"
                                    : "Closed"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Card Body */}
                        <div className="p-5">
                          <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#0078d4] transition-colors line-clamp-1">
                            {evt.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                            <span className="flex items-center gap-1.5">
                              <i className="fas fa-calendar-day text-[10px]" />
                              {startDate}
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1.5">
                                <i className="fas fa-location-dot text-[10px]" />
                                {evt.location}
                              </span>
                            )}
                          </div>
                          {evt.description && (
                            <p className="text-white/30 text-xs line-clamp-2 mb-4">
                              {evt.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[#0078d4] text-xs font-semibold group-hover:gap-3 transition-all">
                            {isCompleted ? (
                              <>
                                <i className="fas fa-certificate" />
                                View Certificates
                              </>
                            ) : isRegistrationOpen ? (
                              <>
                                <i className="fas fa-arrow-right" />
                                Register Now
                              </>
                            ) : (
                              <>
                                <i className="fas fa-search" />
                                Check Details
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-center gap-5">
          <a
            href="https://discord.com/invite/wZ55nBhWtJ/"
            target="_blank"
            rel="noopener noreferrer"
            title="Discord"
            className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-[#0078d4]/50 hover:bg-[#0078d4]/[0.06] transition-all text-sm"
          >
            <i className="fab fa-discord" />
          </a>
          <a
            href="https://linkedin.com/company/microsoft-student-community-srm-university/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-[#0078d4]/50 hover:bg-[#0078d4]/[0.06] transition-all text-sm"
          >
            <i className="fab fa-linkedin" />
          </a>
          <a
            href="https://www.instagram.com/msc.srmap/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-[#0078d4]/50 hover:bg-[#0078d4]/[0.06] transition-all text-sm"
          >
            <i className="fab fa-instagram" />
          </a>
          <a
            href="mailto:msc.community@srmap.edu.in"
            title="Email"
            className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-[#0078d4]/50 hover:bg-[#0078d4]/[0.06] transition-all text-sm"
          >
            <i className="fa fa-envelope" />
          </a>
        </div>
      </div>
    </main>
  );
}
