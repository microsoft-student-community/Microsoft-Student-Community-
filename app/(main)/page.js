"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";

export default function Home() {
  const videoRef = useRef(null);
  const [formStatus, setFormStatus] = useState("");
  const [formStatusType, setFormStatusType] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Loader logic
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

    return () => clearInterval(loaderInterval);
  }, []);

  useEffect(() => {
    // Checkpoint navigation dots logic
    const dots = document.querySelectorAll(".checkpoint-dot");
    const sections = Array.from(dots).map((dot) =>
      document.getElementById(dot.dataset.section),
    );

    const onScroll = () => {
      let current = "";
      sections.forEach((section) => {
        if (section) {
          const sectionTop = section.offsetTop;
          if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute("id");
          }
        }
      });
      dots.forEach((dot) => {
        dot.classList.remove("active");
        if (dot.dataset.section === current) {
          dot.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Gentle upward fade-in for section headings only
    const headings = document.querySelectorAll(
      ".pillars-header, .upcoming-header, .contact-header"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          } else {
            entry.target.classList.remove("is-revealed");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* Loading Screen ΓÇö Radiance Preloader */}
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

      {/* Background Video */}
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

      {/* Checkpoint Navigation Dots */}
      <div className="checkpoint-nav">
        <a
          href="#home"
          className="checkpoint-dot active"
          data-section="home"
          title="Home"
        ></a>
        <a
          href="#ecosystem"
          className="checkpoint-dot"
          data-section="ecosystem"
          title="Pillars"
        ></a>
        <a
          href="#upcoming"
          className="checkpoint-dot"
          data-section="upcoming"
          title="Upcoming"
        ></a>
        <a
          href="#contact"
          className="checkpoint-dot"
          data-section="contact"
          title="Contact"
        ></a>
      </div>

      {/* ===== HERO V3: MONUMENTAL CENTERED COMMAND CENTER ===== */}
      {/* ===== HERO: SPACIOUS KINETIC & TYPOGRAPHIC SHOWCASE (STRIPE / LINEAR STYLE) ===== */}
      <section id="home" className="hero hero-spacious-kinetic">
        <div className="kinetic-hero-container">

          {/* Elegant Architectural Pill */}
          <div className="kinetic-eyebrow-pill">
            <div className="ms-quad-emblem mini">
              <span className="ms-quad q-red"></span>
              <span className="ms-quad q-green"></span>
              <span className="ms-quad q-blue"></span>
              <span className="ms-quad q-yellow"></span>
            </div>
            <span className="eyebrow-text">MICROSOFT STUDENT COMMUNITY</span>
            <span className="eyebrow-sep">•</span>
            <span className="eyebrow-location">SRM UNIVERSITY AP</span>
            <span className="eyebrow-status">CHAPTER &apos;26</span>
          </div>

          {/* Monumental Typographic Display Heading (Stardom Serif) */}
          <h1 className="kinetic-hero-title">
            <span className="sr-only">Microsoft Student Community SRM University AP: </span>
            <span className="title-line-top">Where Student Builders</span>
            <span className="title-line-bottom">
              Architect the <span className="kinetic-gradient-accent">Future.</span>
            </span>
          </h1>

          {/* Balanced Editorial Subtitle */}
          <p className="kinetic-hero-subtext">
            SRM University AP&apos;s premier engineering collective powered by Microsoft Learn Student Ambassadors.
            We engineer scalable cloud platforms, accelerate applied AI, and compete across national hackathons.
          </p>

          {/* Clean Dual-Action Buttons */}
          <div className="kinetic-hero-actions" role="toolbar" aria-label="Primary Actions">
            <a
              href="https://discord.gg/K5NC5wAhg"
              target="_blank"
              rel="noopener noreferrer"
              className="kinetic-btn-primary"
              id="hero-join-btn"
            >
              <i className="fab fa-discord"></i>
              <span>Join Discord</span>
              <span className="btn-counter-badge">50+ Active</span>
            </a>

            <a href="#upcoming" className="kinetic-btn-secondary">
              <span className="beacon-indicator"></span>
              <span>SYNORA &apos;26 Hackathon</span>
              <span className="btn-tag-pill">SEP 17</span>
            </a>
          </div>

          {/* Architectural Telemetry Stream Marquee (Non-AI, 100% Unboxed & Free) */}
          <div className="kinetic-ticker-viewport" aria-label="Community Highlights Marquee">
            <div className="kinetic-ticker-track">
              {/* Loop Batch 1 */}
              <div className="kinetic-ticker-batch">
                <a href="#upcoming" className="telemetry-node telemetry-node-interactive">
                  <span className="telemetry-idx">01</span>
                  <span className="telemetry-beacon live"></span>
                  <span className="telemetry-title">SYNORA &apos;26</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">18-Hr National Hackathon</span>
                  <span className="telemetry-status-tag">LIVE</span>
                </a>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">02</span>
                  <i className="fa-solid fa-cloud telemetry-ico text-blue-400"></i>
                  <span className="telemetry-title">Azure &amp; Cloud</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Distributed Scale</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">03</span>
                  <i className="fa-solid fa-brain telemetry-ico text-amber-400"></i>
                  <span className="telemetry-title">Applied AI</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">LLMs &amp; Cognitive Services</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">04</span>
                  <i className="fa-solid fa-users telemetry-ico text-cyan-400"></i>
                  <span className="telemetry-title">50+ Engineers</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Active Campus Guild</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">05</span>
                  <i className="fa-solid fa-trophy telemetry-ico text-yellow-400"></i>
                  <span className="telemetry-title">₹1,00,000+</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Hackathon Prize Pool</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">06</span>
                  <i className="fa-solid fa-code-branch telemetry-ico text-purple-400"></i>
                  <span className="telemetry-title">Open Source</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Production Tooling</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">07</span>
                  <i className="fa-solid fa-award telemetry-ico text-blue-400"></i>
                  <span className="telemetry-title">MLSA Chapter</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Microsoft Ambassadors</span>
                </div>
                <span className="telemetry-divider">+</span>
              </div>

              {/* Loop Batch 2 (Exact Duplicate for Continuous Loop) */}
              <div className="kinetic-ticker-batch" aria-hidden="true">
                <a href="#upcoming" className="telemetry-node telemetry-node-interactive">
                  <span className="telemetry-idx">01</span>
                  <span className="telemetry-beacon live"></span>
                  <span className="telemetry-title">SYNORA &apos;26</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">18-Hr National Hackathon</span>
                  <span className="telemetry-status-tag">LIVE</span>
                </a>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">02</span>
                  <i className="fa-solid fa-cloud telemetry-ico text-blue-400"></i>
                  <span className="telemetry-title">Azure &amp; Cloud</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Distributed Scale</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">03</span>
                  <i className="fa-solid fa-brain telemetry-ico text-amber-400"></i>
                  <span className="telemetry-title">Applied AI</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">LLMs &amp; Cognitive Services</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">04</span>
                  <i className="fa-solid fa-users telemetry-ico text-cyan-400"></i>
                  <span className="telemetry-title">50+ Engineers</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Active Campus Guild</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">05</span>
                  <i className="fa-solid fa-trophy telemetry-ico text-yellow-400"></i>
                  <span className="telemetry-title">₹1,00,000+</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Hackathon Prize Pool</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">06</span>
                  <i className="fa-solid fa-code-branch telemetry-ico text-purple-400"></i>
                  <span className="telemetry-title">Open Source</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Production Tooling</span>
                </div>
                <span className="telemetry-divider">+</span>

                <div className="telemetry-node">
                  <span className="telemetry-idx">07</span>
                  <i className="fa-solid fa-award telemetry-ico text-blue-400"></i>
                  <span className="telemetry-title">MLSA Chapter</span>
                  <span className="telemetry-sep">{"//"}</span>
                  <span className="telemetry-desc">Microsoft Ambassadors</span>
                </div>
                <span className="telemetry-divider">+</span>
              </div>
            </div>
          </div>

          {/* Architectural Laser Glide Scroll Anchor */}
          <a href="#ecosystem" className="architectural-scroll-anchor" aria-label="Scroll to Pillars">
            <div className="scroll-anchor-meta">
              <span className="scroll-anchor-cross">+</span>
              <span className="scroll-anchor-label">EXPLORE ECOSYSTEM</span>
              <span className="scroll-anchor-cross">+</span>
            </div>
            <div className="scroll-laser-track">
              <span className="laser-stem-line"></span>
              <span className="laser-traveling-bead"></span>
              <svg className="scroll-vector-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>

        </div>
      </section>

      {/* Ecosystem Pillars Section - Free Editorial Architecture */}
      <section id="ecosystem" className="home-pillars-section">
        <div className="container">
          <div className="pillars-header">
            <h2 className="section-title">
              Built for serious student developers.
            </h2>
          </div>

          <div className="pillars-free-grid">
            {/* Pillar 1 */}
            <div className="pillar-free-col">
              <span className="pillar-free-num">01</span>
              <h3 className="pillar-free-title">Applied Cloud &amp; AI</h3>
              <p className="pillar-free-body">
                Hands-on systems engineering, Microsoft Azure deployments, and
                production LLM orchestration workshops built for real scale.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="pillar-free-col">
              <span className="pillar-free-num">02</span>
              <h3 className="pillar-free-title">National Hackathons</h3>
              <p className="pillar-free-body">
                Organizing high-stakes hackathons like Solutions for Smart
                India, uniting hundreds of student innovators to solve hard
                problems.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="pillar-free-col">
              <span className="pillar-free-num">03</span>
              <h3 className="pillar-free-title">
                Mentorship &amp; Open Source
              </h3>
              <p className="pillar-free-body">
                Direct mentorship from Microsoft MVP alumni, senior student
                engineers, and peer code reviews for production open-source
                tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section - Free Horizon Showcase */}
      <section id="upcoming" className="upcoming">
        <div className="container">
          <div className="upcoming-header">
            <h2 className="section-title">Upcoming Events</h2>
          </div>

          <div className="event-free-stage">
            {/* Date Display */}
            <div className="event-free-date">
              <span className="event-free-month">SEP</span>
              <span className="event-free-day">17</span>
            </div>

            {/* Event Core Information */}
            <div className="event-free-details">
              <h3 className="event-free-title">SYNORA</h3>
              <p className="event-free-description">
                It is a fresher-oriented 18-hour technology event that combines 6 hours of orientation and technical talks with a 12-hour intensive hackathon, giving students a complete experience of learning, collaboration, and hands-on project building.
              </p>
              <div className="event-free-actions">
                <Link
                  href="/events"
                  className="event-free-btn liquid-glass"
                  title="Explore SYNORA Hackathon"
                >
                  <span>Event Details</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Free Spatial Studio */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-header">
            <h2 className="section-title">Get In Touch</h2>
          </div>

          <div className="contact-free-layout">
            {/* Left: Direct Lines */}
            <div className="contact-free-direct">
              <div className="contact-free-intro">
                <h3 className="contact-free-heading">Reach Us</h3>
                <p className="contact-free-desc">
                  Connect with the student lead team directly for collaborations, hackathons, or membership questions.
                </p>
              </div>

              <div className="contact-free-channels">
                <a
                  href="mailto:msc.community@srmap.edu.in"
                  className="contact-channel-line"
                  title="Send email to MSC SRMAP"
                >
                  <div className="channel-line-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="channel-line-info">
                    <span className="channel-line-label">Official Inquiries</span>
                    <span className="channel-line-val">msc.community@srmap.edu.in</span>
                  </div>
                </a>

                <div className="contact-channel-line">
                  <div className="channel-line-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="channel-line-info">
                    <span className="channel-line-label">Campus Presence</span>
                    <span className="channel-line-val">SRM University AP, Andhra Pradesh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Unboxed Message Form */}
            <div className="contact-free-form-wrap">
              <div className="contact-free-form-intro">
                <h3 className="contact-free-heading">Send Us a Message</h3>
              </div>

              <form
                id="contact-form"
                className="contact-free-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormLoading(true);
                  setFormStatus("");
                  try {
                    const res = await fetch(
                      "https://api.web3forms.com/submit",
                      {
                        method: "POST",
                        body: new FormData(e.target),
                      },
                    );
                    const json = await res.json();
                    if (json.success) {
                      setFormStatus(
                        "Message sent successfully! We'll get back to you soon.",
                      );
                      setFormStatusType("success");
                      e.target.reset();
                    } else throw new Error();
                  } catch {
                    setFormStatus(
                      "Something went wrong. Please try again or email us directly.",
                    );
                    setFormStatusType("error");
                  } finally {
                    setFormLoading(false);
                  }
                }}
              >
                <input
                  type="hidden"
                  name="access_key"
                  value="b3f684a3-2f63-4d19-bb5c-60fe3d278ec2"
                />
                <input
                  type="hidden"
                  name="subject"
                  value="New Contact Form Submission from MSC Website"
                />
                <input
                  type="hidden"
                  name="from_name"
                  value="MSC Website Contact Form"
                />

                <div className="form-free-grid">
                  <div className="form-free-field">
                    <label htmlFor="name" className="form-free-label">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div className="form-free-field">
                    <label htmlFor="email" className="form-free-label">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                </div>

                <div className="form-free-field">
                  <label htmlFor="message" className="form-free-label">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Your Message"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="form-free-actions">
                  <button type="submit" id="submit-btn" className="form-free-submit liquid-glass" disabled={formLoading}>
                    <span>{formLoading ? "Sending..." : "Send Message"}</span>
                    {!formLoading && <i className="fa-solid fa-arrow-right"></i>}
                  </button>
                </div>
              </form>

              {formStatus && (
                <div
                  id="form-status"
                  className={`form-status ${formStatusType}`}
                >
                  {formStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Event Modal - unused in this layout directly but kept for visual parity if used by scripts */}
      <div className="event-modal" id="eventModal">
        <div className="event-modal-content">
          <div className="event-modal-header">
            <div className="event-modal-close" id="closeModal">
              &times;
            </div>
            <h3 className="event-modal-title" id="modalTitle"></h3>
            <div className="event-modal-date" id="modalDate"></div>
          </div>
          <div className="event-modal-body" id="modalBody"></div>
          <div className="event-modal-footer">
            <button className="event-modal-register" id="modalRegister">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
