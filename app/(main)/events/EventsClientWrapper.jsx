"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";

export default function EventsClientWrapper({ events: initialEvents }) {
  const videoRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);

  const events = useMemo(() => {
    return (initialEvents || []).map((e) => {
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
        dateStart: e.date_start,
        title: e.title,
        tag: e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1) : "Event",
        desc: e.description || "",
        status: e.status === "completed" ? "Completed" : "Upcoming",
        img: e.image_url || null,
        summary: e.long_description || e.description || "Join us for this event!",
        galleryLink: `/gallery#gallery-${e.slug || e.id}`,
        portalLink: `/event-portal?event=${e.slug || e.id}`,
        stats: [
          {
            label: "Status",
            val: e.status === "completed" ? "Archived" : "Active",
          },
          { label: "Category", val: e.type || "General" },
          ...(e.location ? [{ label: "Location", val: e.location }] : []),
        ],
      };
    });
  }, [initialEvents]);

  const featuredEvent = useMemo(() => {
    const upcomingWithImg = events.filter((e) => e.status === "Upcoming" && e.img);
    if (upcomingWithImg.length > 0) return upcomingWithImg[upcomingWithImg.length - 1];
    const completedWithImg = events.filter((e) => e.status === "Completed" && e.img);
    return completedWithImg.length > 0 ? completedWithImg[0] : null;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return filter === "all" ? events : events.filter((e) => e.category === filter);
  }, [events, filter]);

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
            if (bgVideo) bgVideo.play().catch(() => {});
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
      if (bgVideo) bgVideo.play().catch(() => {});
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
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };

    cards.forEach((card) => card.addEventListener("mousemove", handleMouseMove));
    return () => {
      cards.forEach((card) => card.removeEventListener("mousemove", handleMouseMove));
    };
  }, [filteredEvents]);

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const targetDate = featuredEvent?.dateStart
      ? new Date(featuredEvent.dateStart).getTime()
      : new Date("2026-09-17T09:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent?.dateStart]);

  const handleCardClick = (id) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

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
              loading="eager"
              decoding="async"
              fetchPriority="high"
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
      <div className="background-overlay" suppressHydrationWarning></div>
      <ParticleBackground particleColor="rgba(0, 120, 212, alpha)" />

      <section className="events-header-section">
        <div className="container">
          <div className="events-eyebrow-wrap">
            <span className="events-eyebrow-dot"></span>
            <span className="events-eyebrow-tag">MSC SRMAP ARCHIVE</span>
          </div>
          <h1 className="events-main-title">
            The <span className="title-serif-italic">Chronicles</span> of Build
          </h1>
          <p className="events-intro-text">
            A premium record of our technical coding bootcamps, developer hackathons, and open source workshops.
          </p>
        </div>
      </section>

      <section className="editorial-showcase-section">
        <div className="container">
          {featuredEvent ? (
            <div className="editorial-showcase-layout">
              <div className="editorial-content-column">
                <div className="editorial-kicker">
                  <span className="kicker-dot"></span>
                  <span className="kicker-text">Upcoming Flagship Sprint</span>
                  <span className="kicker-sep">/</span>
                  <span className="kicker-date">{featuredEvent.day} {featuredEvent.month}</span>
                  <span className="kicker-sep">/</span>
                  <span className="kicker-venue">SRM University AP</span>
                </div>

                <h2 className="editorial-monument-title">
                  {featuredEvent.title}
                </h2>

                <p className="editorial-hook">
                  18 hours of hands-on workshops, real-world engineering challenges, and continuous builder momentum.
                </p>

                <p className="editorial-story">
                  {featuredEvent.desc}
                </p>

                <div className="editorial-metrics-strip">
                  <div className="metric-item">
                    <span className="metric-figure gold">₹30,000+</span>
                    <span className="metric-caption">Prize Bounty</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-figure">18 Hours</span>
                    <span className="metric-caption">Non-Stop Sprint</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-figure">3–5</span>
                    <span className="metric-caption">Team Size</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-figure">All Freshers</span>
                    <span className="metric-caption">Open To</span>
                  </div>
                </div>

                <div className="editorial-action-row">
                  <a
                    href={featuredEvent.portalLink}
                    className="editorial-primary-action"
                  >
                    <span>Register for Synora</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>

                  <div className="editorial-countdown-inline">
                    <span className="countdown-prefix">Starts in</span>
                    <span className="countdown-value">
                      {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : <strong className="sec-glow">{timeLeft.seconds}s</strong>
                    </span>
                  </div>

                  <a
                    href="https://discord.gg/K5NC5wAhg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editorial-subtle-link"
                  >
                    <i className="fab fa-discord"></i>
                    <span>Join Discord Guild</span>
                  </a>
                </div>
              </div>

              <div className="editorial-visual-column">
                <div className="editorial-poster-stage">
                  <div className="poster-ambient-aura"></div>
                  <img
                    src={featuredEvent.img}
                    alt={featuredEvent.title}
                    className="editorial-poster-image"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="editorial-showcase-layout">
              <div className="editorial-content-column">
                <div className="editorial-kicker">
                  <span className="kicker-dot"></span>
                  <span className="kicker-text">Community Network</span>
                  <span className="kicker-sep">/</span>
                  <span className="kicker-venue">SRM University AP</span>
                </div>

                <h2 className="editorial-monument-title">
                  Build with MSC
                </h2>

                <p className="editorial-hook">
                  The central hub for hackathons, engineering sprints, and technical workshops at SRM University AP.
                </p>

                <p className="editorial-story">
                  Connect with fellow student builders, find project teammates, and get real-time notifications for every upcoming event on campus.
                </p>

                <div className="editorial-action-row">
                  <a
                    href="https://discord.gg/K5NC5wAhg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editorial-primary-action"
                  >
                    <i className="fab fa-discord"></i>
                    <span>Join Community Discord</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>

              <div className="editorial-visual-column">
                <div className="editorial-poster-stage">
                  <div className="poster-ambient-aura"></div>
                  <img
                    src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/hackmsc1.jpg"
                    alt="MSC Community"
                    className="editorial-poster-image"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="events-archive-section">
        <div className="container">
          <div className="schedule-ledger-header">
            <div className="ledger-header-info">
              <span className="ledger-eyebrow">CHRONOLOGY {"//"} SPRINT ARCHIVE</span>
              <h2 className="ledger-section-title">
                The Sprints <span className="title-serif-italic">Archive</span>
              </h2>
            </div>

            <div className="schedule-tabs-horizon">
              <button
                className={`schedule-tab-item ${filter === "all" ? "active" : ""}`}
                onClick={() => {
                  setFilter("all");
                  setExpandedCard(null);
                }}
              >
                <span className="tab-index">01</span>
                <span className="tab-name">All Sprints</span>
                <span className="tab-badge">{events.length}</span>
              </button>
              <button
                className={`schedule-tab-item ${filter === "hackathon" ? "active" : ""}`}
                onClick={() => {
                  setFilter("hackathon");
                  setExpandedCard(null);
                }}
              >
                <span className="tab-index">02</span>
                <span className="tab-name">Hackathons</span>
                <span className="tab-badge">
                  {events.filter((e) => e.category === "hackathon").length}
                </span>
              </button>
              <button
                className={`schedule-tab-item ${filter === "workshop" ? "active" : ""}`}
                onClick={() => {
                  setFilter("workshop");
                  setExpandedCard(null);
                }}
              >
                <span className="tab-index">03</span>
                <span className="tab-name">Workshops</span>
                <span className="tab-badge">
                  {events.filter((e) => e.category === "workshop").length}
                </span>
              </button>
            </div>
          </div>

          <div className="schedule-ledger-stream">
            {filteredEvents.length === 0 ? (
              <div className="ledger-empty-state">
                <p>No sprint records found matching this filter.</p>
              </div>
            ) : (
              filteredEvents.map((evt, idx) => {
                const isExpanded = expandedCard === evt.id;
                const isUpcoming = evt.status === "Upcoming";
                const indexStr = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={evt.id}
                    className={`ledger-entry-row glow-card ${isExpanded ? "is-expanded" : ""}`}
                    onClick={(e) => {
                      if (
                        e.target.closest(".ledger-expanded-pane") ||
                        e.target.closest("a")
                      )
                        return;
                      handleCardClick(evt.id);
                    }}
                  >
                    <div className="ledger-row-main">
                      <span className="ledger-num">/{indexStr}</span>

                      <div className="ledger-date-anchor">
                        <span className="ledger-month">{evt.month}</span>
                        <span className="ledger-day">{evt.day}</span>
                      </div>

                      <div className="ledger-visual-anchor">
                        {evt.img ? (
                          <img
                            src={evt.img}
                            alt={evt.title}
                            className="ledger-thumb-img"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="ledger-thumb-placeholder">
                            <i className="fa-solid fa-code"></i>
                          </div>
                        )}
                      </div>

                      <div className="ledger-info-block">
                        <div className="ledger-meta-line">
                          <span className={`ledger-discipline-tag ${evt.category}`}>
                            {evt.tag}
                          </span>
                          <span className="ledger-meta-sep">/</span>
                          <span className={`ledger-status-indicator ${isUpcoming ? "status-live" : "status-archived"}`}>
                            <span className="status-dot"></span>
                            <span>{isUpcoming ? "Upcoming Sprint" : "Archived Session"}</span>
                          </span>
                          {evt.location && (
                            <>
                              <span className="ledger-meta-sep">/</span>
                              <span className="ledger-location-text">
                                <i className="fa-solid fa-location-dot"></i> {evt.location}
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="ledger-entry-title">
                          {evt.title}
                        </h3>

                        <p className="ledger-entry-desc">
                          {evt.desc}
                        </p>
                      </div>

                      <div className="ledger-toggle-anchor">
                        <span className="ledger-toggle-btn" aria-label="Toggle Details">
                          <i className="fa-solid fa-plus"></i>
                        </span>
                      </div>
                    </div>

                    <div
                      className="ledger-expanded-pane"
                      style={{
                        maxHeight: isExpanded ? "1200px" : "0px",
                      }}
                    >
                      <div className={`ledger-dossier-inner ${!evt.img ? "no-image" : ""}`}>
                        {evt.img && (
                          <div className="dossier-poster-wrap">
                            <img
                              src={evt.img}
                              alt={`${evt.title} Poster`}
                              className="dossier-poster-img"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}

                        <div className="dossier-narrative-col">
                          <div className="dossier-kicker">
                            <span>SESSION OVERVIEW</span>
                          </div>
                          <p className="dossier-body-text">{evt.summary}</p>

                          <div className="dossier-actions-strip">
                            <Link href={evt.galleryLink} className="dossier-gallery-btn">
                              <span>View Gallery Photos</span>
                              <i className="fa-solid fa-arrow-right"></i>
                            </Link>

                            <a
                              href={evt.portalLink || "/event-portal"}
                              className="dossier-portal-btn"
                            >
                              <span>Open Event Portal</span>
                              <i className="fa-solid fa-up-right-from-square"></i>
                            </a>
                          </div>
                        </div>

                        <div className="dossier-specs-col">
                          <div className="dossier-kicker">
                            <span>SPECIFICATIONS</span>
                          </div>
                          <div className="dossier-specs-table">
                            <div className="spec-row">
                              <span className="spec-label">Discipline</span>
                              <span className="spec-value">{evt.tag}</span>
                            </div>
                            <div className="spec-row">
                              <span className="spec-label">Cycle</span>
                              <span className="spec-value">{isUpcoming ? "Active Upcoming" : "Completed / Archived"}</span>
                            </div>
                            {evt.location && (
                              <div className="spec-row">
                                <span className="spec-label">Location</span>
                                <span className="spec-value">{evt.location}</span>
                              </div>
                            )}
                            {evt.stats && evt.stats.map((st, i) => (
                              <div className="spec-row" key={i}>
                                <span className="spec-label">{st.label.replace(':', '')}</span>
                                <span className="spec-value">{st.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
