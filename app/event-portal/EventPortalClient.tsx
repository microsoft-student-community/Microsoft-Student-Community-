"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import EventPortalTabs from "./EventPortalTabs";
import { Calendar, Clock, Hourglass, MapPin, Tag, Users } from "lucide-react";

export default function EventPortalClient({
  selectedEvent,
  invitedTeam = null,
  openTeams = [],
}: {
  selectedEvent: any;
  invitedTeam?: any;
  openTeams?: any[];
}) {
  if (!selectedEvent) return null;

  const startDate = selectedEvent.date_start
    ? new Date(selectedEvent.date_start).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "TBA";
  const startTime = selectedEvent.date_start
    ? new Date(selectedEvent.date_start).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "TBA";
  const agenda = Array.isArray(selectedEvent.form_requirements?.agenda)
    ? selectedEvent.form_requirements.agenda.filter((item: any) => item.time || item.t || item.title || item.d)
    : [];
  const speakers = Array.isArray(selectedEvent.form_requirements?.speakers)
    ? selectedEvent.form_requirements.speakers.filter((item: any) => item.name)
    : [];

  return (
    <main className="event-portal-shell min-h-screen" style={{ fontFamily: "var(--font-b)" }}>
      <div className="event-portal-frame">
        <Link href="/events" className="event-portal-back">← Back to events</Link>
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="event-portal-hero"
        >
          <div className="event-portal-hero-media">
            {selectedEvent.image_url ? (
              <img
                src={selectedEvent.image_url}
                alt={selectedEvent.title}
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <div className="event-portal-hero-placeholder" />
            )}
          </div>
          <div className="event-portal-hero-copy">
            <div className="event-portal-eyebrows">
              <span><Tag size={14} /> {selectedEvent.type || "Event"}</span>
              <span>Microsoft Student Community</span>
            </div>
            <h1>{selectedEvent.title}</h1>
            <p>{selectedEvent.description || "Join the Microsoft Student Community for a focused session of learning, collaboration, and building."}</p>
            <div className="event-portal-meta-grid">
              <div><Calendar size={16} /><small>Date</small><strong>{startDate}</strong></div>
              <div><Clock size={16} /><small>Time</small><strong>{startTime}</strong></div>
              <div><MapPin size={16} /><small>Venue</small><strong>{selectedEvent.location || "TBA"}</strong></div>
              <div><Users size={16} /><small>Capacity</small><strong>{selectedEvent.max_capacity ? `${selectedEvent.max_capacity} seats` : "Unlimited"}</strong></div>
            </div>
          </div>
        </motion.section>

        <div className={agenda.length || speakers.length ? "event-portal-layout event-portal-layout--aside" : "event-portal-layout"}>
          <section className="event-portal-workspace">
            {!selectedEvent.registration_open && selectedEvent.show_opening_soon ? (
              <div className="event-portal-opening-soon">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="event-portal-opening-soon-card"
                >
                  <div className="event-portal-opening-soon-icon">
                    <Hourglass size={28} />
                  </div>
                  <span className="event-portal-opening-soon-eyebrow">Registrations Not Yet Open</span>
                  <h2>Registrations Are Opening Soon</h2>
                  <p>
                    Please be patient. The MSC team is finalizing the details for{" "}
                    <strong>{selectedEvent.title}</strong> and will open registrations
                    very shortly. Keep an eye on this page for updates!
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="event-portal-opening-soon-refresh"
                  >
                    <Clock size={14} /> Check Again
                  </button>
                </motion.div>
              </div>
            ) : (
              <EventPortalTabs event={selectedEvent} invitedTeam={invitedTeam} openTeams={openTeams} />
            )}
          </section>
          {(agenda.length || speakers.length) > 0 && (
            <aside className="event-portal-aside">
              {agenda.length > 0 && (
                <section className="event-portal-aside-card">
                  <h2>Schedule</h2>
                  <ol className="event-portal-agenda">
                    {agenda.map((item: any, index: number) => <li key={index}><span>{item.time || item.t}</span><strong>{item.title || item.d}</strong></li>)}
                  </ol>
                </section>
              )}
              {speakers.length > 0 && (
                <section className="event-portal-aside-card">
                  <h2>Speakers</h2>
                  {speakers.map((speaker: any, index: number) => (
                    <div className="event-portal-speaker" key={index}><span>{speaker.name.charAt(0).toUpperCase()}</span><div><strong>{speaker.name}</strong><small>{speaker.role}</small></div></div>
                  ))}
                </section>
              )}
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
