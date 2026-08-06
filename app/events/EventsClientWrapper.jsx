"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";

export default function EventsClientWrapper({ events: initialEvents }) {
  const videoRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);

  // Map Supabase event rows to the shape the UI expects
  const events = (initialEvents || []).map((e) => {
    const startDate = new Date(e.date_start);
    const month = startDate
      .toLocaleString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })
      .toUpperCase();
    let dayStr = startDate.toLocaleString("en-IN", {
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });

    if (e.date_end && e.date_end !== e.date_start) {
      const endDate = new Date(e.date_end);
      const endDay = endDate.toLocaleString("en-IN", {
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });
      dayStr = `${dayStr}-${endDay}`;
    }

    return {
      id: e.slug || e.id,
      category: e.type || "workshop",
      month,
      day: dayStr,
      title: e.title,
      tag: e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1) : "Event",
      desc: e.description || "",
      status: e.status === "completed" ? "Completed" : "Upcoming",
      location: e.location || "",
      img:
        e.image_url ||
        "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/hackmsc1.jpg",
      summary: e.long_description || e.description || "Join us for this event!",
      galleryLink: `/gallery#gallery-${e.slug || e.id}`,
      portalLink: `/event-portal?event=${e.slug || e.id}`,
      stats: [
        {
          label: "Status:",
          val: e.status === "completed" ? "Archived" : "Active",
        },
        { label: "Category:", val: e.type || "General" },
        ...(e.location ? [{ label: "Location:", val: e.location }] : []),
      ],
    };
  });

  useEffect(() => {
    document.body.classList.add("events-page");

    const loadingScreen = document.getElementById("loadingScreen");
    const loaderRingFill = document.getElementById("loaderRingFill");
    const loaderRingTrack = document.querySelector(".loader-ring-track");
    const bgVideo = videoRef.current;

    let progress = 0;
    let loaderInterval;

    const startLoader = () => {
      document.documentElement.classList.remove("skip-loader");
      if (loaderRingTrack) loaderRingTrack.style.strokeDashoffset = "0";

      loaderInterval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress >= 100) {
          progress = 100;
          clearInterval(loaderInterval);
          setTimeout(() => {
            if (loadingScreen) loadingScreen.classList.add("fade-out");
            document.documentElement.classList.add("skip-loader");
            if (bgVideo) bgVideo.play().catch((e) => function () {});
          }, 400);
        }
        if (loaderRingFill) {
          const circumference = 2 * Math.PI * 88;
          const offset = circumference - (progress / 100) * circumference;
          loaderRingFill.style.strokeDashoffset = offset;
        }
      }, 50);
    };

    if (document.documentElement.classList.contains("skip-loader")) {
      if (loadingScreen) loadingScreen.style.display = "none";
      if (bgVideo) bgVideo.play().catch((e) => function () {});
    } else {
      startLoader();
    }

    return () => {
      clearInterval(loaderInterval);
      document.body.classList.remove("events-page");
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".glow-card");
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    const mouseMoveListeners = new Map();
    cards.forEach((card) => {
      const listener = (e) => handleMouseMove(e, card);
      mouseMoveListeners.set(card, listener);
      card.addEventListener("mousemove", listener);
    });

    const eventCards = document.querySelectorAll(".event-cassette");
    eventCards.forEach((card, idx) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(18px)";
      card.style.transition =
        "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease";
      setTimeout(
        () => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        },
        idx * 90 + 200,
      );
    });

    const hero = document.querySelector(".featured-event-hero");
    if (hero) {
      hero.style.opacity = "0";
      hero.style.transform = "translateY(20px)";
      hero.style.transition =
        "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
      setTimeout(() => {
        hero.style.opacity = "1";
        hero.style.transform = "translateY(0)";
      }, 120);
    }

    return () => {
      cards.forEach((card) => {
        const listener = mouseMoveListeners.get(card);
        if (listener) card.removeEventListener("mousemove", listener);
      });
    };
  }, [filter]);

  const handleCardClick = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <main>
      <div className="loading-screen" id="loadingScreen">
        <div className="loader-glow-field"></div>
        <div className="loader-particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="loading-content">
          <div className="loading-logo-wrap">
            <div className="loader-ring-wrap">
              <svg className="loader-ring-svg" viewBox="0 0 200 200">
                <circle
                  className="loader-ring-track"
                  cx="100"
                  cy="100"
                  r="88"
                />
                <circle
                  className="loader-ring-fill"
                  cx="100"
                  cy="100"
                  r="88"
                  id="loaderRingFill"
                />
              </svg>
            </div>
            <img
              src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
              alt="MSC Logo"
              className="loading-logo-img"
            />
          </div>
          <div className="loader-text-group">
            <span className="loader-brand-line">
              MICROSOFT STUDENT COMMUNITY
            </span>
            <span className="loader-chapter-line">SRM UNIVERSITY AP</span>
          </div>
        </div>
      </div>

      <video
        className="background-video"
        muted
        loop
        playsInline
        id="bgVideo"
        preload="metadata"
        ref={videoRef}
      >
        <source
          src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/Microsoft_Student_Community_Title_Card.mp4"
          type="video/mp4"
        />
      </video>
      <div className="background-overlay"></div>
      <ParticleBackground particleColor="rgba(0, 120, 212, alpha)" />

      <section className="events-header-section">
        <div className="container">
          <div className="events-eyebrow-wrap">
            <span className="events-eyebrow-accent"></span>
            <span className="events-eyebrow-tag">MSC SRMAP ARCHIVE</span>
          </div>
          <h1 className="events-main-title">
            The <span className="title-serif-italic">Chronicles</span> of Build
          </h1>
          <p className="events-intro-text">
            A premium record of our technical coding bootcamps, developer
            hackathons, and open source workshops.
          </p>
        </div>
      </section>

      <section
        id="events"
        style={{ position: "relative", padding: "2rem 0 6rem" }}
      >
        <div className="container">
          <div className="featured-event-hero glow-card">
            <div className="featured-hero-visual">
              <img
                src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/hackmsc1.jpg"
                alt="Event Portal Banner"
                className="featured-hero-img"
              />
              <div className="featured-overlay-grad"></div>
              <div
                className="featured-status-badge"
                style={{
                  borderColor: "rgba(0, 120, 212, 0.4)",
                  color: "var(--blue)",
                }}
              >
                <div
                  className="pulse-dot"
                  style={{
                    background: "var(--blue)",
                    boxShadow: "0 0 10px var(--blue-glow)",
                    animation: "pulseBlue 2s infinite",
                  }}
                ></div>{" "}
                EVENT PORTAL
              </div>
            </div>
            <div className="featured-hero-content">
              <div className="featured-meta">
                <span className="featured-date">LIVE</span>
                <span className="featured-type">
                  Official Registration System
                </span>
              </div>
              <h3 className="featured-title">MSC Event Portal</h3>
              <p className="featured-desc">
                Access our central portal to register for upcoming hackathons,
                find teammates, manage your RSVPs, and download your
                e-certificates for past events.
              </p>
              <Link href="/event-portal" className="featured-cta-btn">
                Open Event Portal <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="events-filter-bar">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => {
                setFilter("all");
                setExpandedCard(null);
              }}
            >
              All Events
            </button>
            <button
              className={`filter-btn ${filter === "hackathon" ? "active" : ""}`}
              onClick={() => {
                setFilter("hackathon");
                setExpandedCard(null);
              }}
            >
              Hackathons
            </button>
            <button
              className={`filter-btn ${filter === "workshop" ? "active" : ""}`}
              onClick={() => {
                setFilter("workshop");
                setExpandedCard(null);
              }}
            >
              Workshops
            </button>
          </div>

          <div className="events-list-container">
            {filteredEvents.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  padding: "4rem 0",
                }}
              >
                No events found for this category.
              </p>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`event-cassette glow-card ${
                    expandedCard === evt.id ? "expanded" : ""
                  }`}
                  onClick={(e) => {
                    if (
                      e.target.closest(".event-summary-drawer") ||
                      e.target.closest("a")
                    )
                      return;
                    handleCardClick(evt.id);
                  }}
                >
                  <div className="event-cassette-row">
                    <div className="event-date-col">
                      <span className="event-month-lbl">{evt.month}</span>
                      <span
                        className={`event-day-lbl ${
                          evt.day.includes("-") ? "range" : ""
                        }`}
                      >
                        {evt.day}
                      </span>
                    </div>
                    <div className="event-info-col">
                      <div className="event-info-header">
                        <h3>{evt.title}</h3>
                        <span className="event-cat-tag">{evt.tag}</span>
                      </div>
                      <p className="event-lead-desc">{evt.desc}</p>
                      <div className="event-meta-strip">
                        <span className="event-meta-item">
                          <i className="fas fa-calendar-check"></i> {evt.status}
                        </span>
                        {evt.location && (
                          <span className="event-meta-item">
                            <i className="fas fa-map-marker-alt"></i>{" "}
                            {evt.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="event-toggle-col">
                      <span className="indicator-arrow">
                        <i className="fas fa-chevron-down"></i>
                      </span>
                    </div>
                  </div>

                  <div
                    className="event-summary-drawer"
                    style={{
                      maxHeight: expandedCard === evt.id ? "1000px" : null,
                    }}
                  >
                    <div className="event-drawer-content">
                      <div className="drawer-poster-frame">
                        <img src={evt.img} alt={`${evt.title} visual`} />
                      </div>
                      <div className="event-summary-left">
                        <h4>Event Summary</h4>
                        <p>{evt.summary}</p>
                        <div className="event-actions-row">
                          <Link href={evt.galleryLink} className="gallery-link">
                            View Event Photos{" "}
                            <i className="fa-solid fa-arrow-right"></i>
                          </Link>
                          {evt.status?.toLowerCase() !== 'completed' && (
                            <Link
                              href={evt.portalLink || "/event-portal"}
                              className="event-portal-link"
                            >
                              Open Event Portal{" "}
                              <i className="fa-solid fa-up-right-from-square"></i>
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="event-summary-right">
                        <div className="blueprint-console">
                          <div className="blueprint-console-header">
                            <span>SYS_BLUEPRINT_LOG</span>
                            <span className="console-green-val">ONLINE</span>
                          </div>
                          {evt.stats.map((stat, i) => (
                            <div className="blueprint-row" key={i}>
                              <span className="blueprint-lbl">
                                {stat.label}
                              </span>
                              <span className="blueprint-val">{stat.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
