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

      {/* Hero Section */}
      <section id="home" className="hero hero-pro">
        <div className="hero-container">
          <div className="hero-content-left">
            <h1 className="hero-title-v2">
              <span className="sr-only">
                Microsoft Student Community ΓÇö SRM University AP:{" "}
              </span>
              Architecting the{" "}
              <span className="hero-italic-highlight">next standard</span> of
              applied engineering.
            </h1>
            <p className="hero-desc-v2">
              A student-driven collective engineering real-world solutions with
              Azure, AI, and cloud systems. We learn by building, shipping, and
              pushing technical boundaries.
            </p>
            <div className="hero-cta-group">
              <a
                href="https://discord.gg/K5NC5wAhg"
                target="_blank"
                rel="noopener noreferrer"
                id="hero-join-btn"
                className="hero-btn-primary"
              >
                <i className="fab fa-discord"></i> Join Discord{" "}
                <i className="fa-solid fa-arrow-right btn-arrow"></i>
              </a>
              <a href="#ecosystem" className="hero-btn-secondary">
                Explore Ecosystem <i className="fa-solid fa-arrow-down"></i>
              </a>
            </div>
          </div>

          <div className="hero-console-card glow-card">
            <div className="console-header-bar">
              <div className="console-dots-group">
                <span className="console-mac-dot red"></span>
                <span className="console-mac-dot yellow"></span>
                <span className="console-mac-dot green"></span>
              </div>
              <span className="console-tag-mono">SYS.TELEMETRY.v2 // LIVE</span>
            </div>
            <div className="console-inner-body">
              <div className="console-telemetry-grid">
                <div className="telemetry-item">
                  <div className="telemetry-lbl">CHAPTER STATUS</div>
                  <div className="telemetry-val">ACTIVE / SRM AP</div>
                </div>
                <div className="telemetry-item">
                  <div className="telemetry-lbl">COMMUNITY</div>
                  <div className="telemetry-val">500+ BUILDERS</div>
                </div>
                <div className="telemetry-item">
                  <div className="telemetry-lbl">FOCUS TRACKS</div>
                  <div className="telemetry-val">AZURE AI OS</div>
                </div>
                <div className="telemetry-item">
                  <div className="telemetry-lbl">IMPACT HACKATHONS</div>
                  <div className="telemetry-val">10+ SHIPPED</div>
                </div>
              </div>
              <div className="console-terminal-line">
                <span className="console-prompt-char">&gt;</span>
                <span>git clone https://github.com/msc-srmap/core</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Pillars Bento Section */}
      <section id="ecosystem" className="home-pillars-section">
        <div className="container">
          
          <h2 className="section-title">
            Built for serious student developers.
          </h2>
          <div className="home-bento-grid">
            <article className="bento-feature-card glow-card">
              <div className="bento-card-icon">
                <i className="fa-solid fa-code"></i>
              </div>
              <div>
                <h3 className="bento-card-head">Applied Cloud &amp; AI</h3>
                <p className="bento-card-body">
                  Hands-on systems engineering, Microsoft Azure deployments, and
                  production LLM orchestration workshops built for real scale.
                </p>
              </div>
            </article>

            <article className="bento-feature-card glow-card">
              <div className="bento-card-icon">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div>
                <h3 className="bento-card-head">National Hackathons</h3>
                <p className="bento-card-body">
                  Organizing high-stakes hackathons like Solutions for Smart
                  India, uniting hundreds of student innovators to solve hard
                  problems.
                </p>
              </div>
            </article>

            <article className="bento-feature-card glow-card">
              <div className="bento-card-icon">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <h3 className="bento-card-head">
                  Mentorship &amp; Open Source
                </h3>
                <p className="bento-card-body">
                  Direct mentorship from Microsoft MVP alumni, senior student
                  engineers, and peer code reviews for production open-source
                  tools.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="upcoming" className="upcoming">
        <div className="container">
         
          <h2 className="section-title">Upcoming Events</h2>
          <div className="upcoming-list">
            <article className="event-cassette glow-card">
              <div className="event-spine">
                <span className="event-month">SEP</span>
                <span className="event-day">17</span>
              </div>
              <div className="event-body">
                <h3>SYNORA</h3>
                <p>
                  It is a fresher-oriented 18-hour technology event that combines 6 hours of orientation and technical talks with a 12-hour intensive hackathon, giving students a complete experience of learning, collaboration, and hands-on project building.
                </p>
                <div className="event-meta">
                  <span
                    className="event-status"
                    style={{ color: "#666", borderColor: "#666" }}
                  >
                    Not Completed
                  </span>
                  <span className="event-note">Upcoming Event</span>
                </div>
              </div>
              <div className="event-edge">
                <span>HACKATHON</span>
              </div>
            </article>

            

            
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
         
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Reach Us</h3>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <p>msc.community@srmap.edu.in</p>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <p>SRM University AP, Andhra Pradesh</p>
              </div>
            </div>
            <div className="contact-form">
              <h3>Send Us a Message</h3>
              <form
                id="contact-form"
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
                        "Message sent successfully! We\'ll get back to you soon.",
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

                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  required
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your Email"
                  required
                />
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  required
                ></textarea>
                <button type="submit" id="submit-btn" disabled={formLoading}>
                  {formLoading ? "Sending..." : "Send Message"}
                </button>
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
