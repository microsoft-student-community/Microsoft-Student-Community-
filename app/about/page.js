"use client";

import { useEffect, useRef } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import "./about-premium.css";

export default function About() {
  const videoRef = useRef(null);

  useEffect(() => {
    // Body class for styling
    document.body.classList.add("about-page-body");

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

    return () => {
      clearInterval(loaderInterval);
      document.body.classList.remove("about-page-body");
    };
  }, []);

  useEffect(() => {
    // 2. Cursor Spotlight (Tilt & Highlight)
    const cards = document.querySelectorAll(".glow-card");
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    };

    const mouseMoveListeners = new Map();
    cards.forEach((card) => {
      const listener = (e) => handleMouseMove(e, card);
      mouseMoveListeners.set(card, listener);
      card.addEventListener("mousemove", listener);
    });

    // 3. Staggered Word Reveal
    const heroWords = document.querySelectorAll(".editorial-word");
    heroWords.forEach((word, idx) => {
      setTimeout(
        () => {
          word.classList.add("visible");
        },
        idx * 100 + 200,
      );
    });

    // 4. Blueprint Timeline Scroll Progression & In-view Reveals
    const timelinePhases = document.querySelectorAll(".timeline-phase");
    const progressLine = document.querySelector(".timeline-progress-fill");

    const handleScroll = () => {
      if (timelinePhases.length === 0) return;

      let activeIndex = -1;
      const triggerPoint = window.innerHeight * 0.7;

      timelinePhases.forEach((phase, index) => {
        const rect = phase.getBoundingClientRect();
        if (rect.top < triggerPoint) {
          phase.classList.add("in-view");
          activeIndex = index;
        }
      });

      if (progressLine && activeIndex !== -1) {
        const totalPhases = timelinePhases.length;
        const progressPercent = ((activeIndex + 1) / totalPhases) * 100;
        progressLine.style.height = `${progressPercent}%`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 100);

    // 5. Dynamic Stats Counter Simulation
    const counterElements = document.querySelectorAll(".stat-counter");
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const targetVal = parseInt(target.getAttribute("data-target"), 10);
            let current = 0;
            const duration = 1200; // ms
            const steps = 25;
            const increment = Math.ceil(targetVal / steps);
            const stepTime = duration / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= targetVal) {
                target.textContent = targetVal + "+";
                clearInterval(timer);
              } else {
                target.textContent = current;
              }
            }, stepTime);

            counterObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.4 },
    );

    counterElements.forEach((el) => counterObserver.observe(el));

    return () => {
      cards.forEach((card) => {
        const listener = mouseMoveListeners.get(card);
        if (listener) card.removeEventListener("mousemove", listener);
      });
      window.removeEventListener("scroll", handleScroll);
      counterObserver.disconnect();
    };
  }, []);

  return (
    <main>
      {/* Loading Screen */}
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
      <div className="background-overlay" suppressHydrationWarning></div>
      <ParticleBackground particleColor="rgba(0, 120, 212, alpha)" />

      {/* Cinematic Hero */}
      <section className="ab-hero-premium">
        <div className="container">
          <div className="ab-hero-grid">
            <div className="ab-hero-left">
              <div className="ab-eyebrow-wrap">
                <span className="ab-eyebrow-accent"></span>
                <span className="ab-eyebrow-tag">About the Community</span>
              </div>
              <h1 className="ab-heading-hero">
                <span className="editorial-word">We</span>{" "}
                <span className="editorial-word">don&apos;t</span>{" "}
                <span className="editorial-word">just</span>{" "}
                <span className="editorial-word ab-heading-accent">learn</span>{" "}
                <span className="editorial-word">tech.</span>
                <br />
                <span className="editorial-word">We</span>{" "}
                <span className="editorial-word ab-heading-accent">build</span>{" "}
                <span className="editorial-word">with</span>{" "}
                <span className="editorial-word">it.</span>
              </h1>
              <p className="ab-desc-hero">
                A student-led space at SRM University AP where engineers,
                designers, and thinkers come together to ship real products with
                Microsoft technologies.
              </p>
            </div>
            <div className="ab-hero-right">
              <div className="stats-console-widget">
                <div className="console-header">
                  <div className="console-dots">
                    <span className="console-dot"></span>
                    <span className="console-dot"></span>
                    <span className="console-dot"></span>
                  </div>
                  <span className="console-title">msc-stats.json</span>
                </div>
                <div className="console-body">
                  <div className="console-line">
                    <span className="console-cmd">cat msc-stats.json</span>
                  </div>
                  <div className="console-metric-row">
                    <span className="metric-lbl">Active Builders</span>
                    <span className="metric-val stat-counter" data-target="150">
                      0
                    </span>
                  </div>
                  <div className="console-metric-row">
                    <span className="metric-lbl">Repositories</span>
                    <span className="metric-val stat-counter" data-target="12">
                      0
                    </span>
                  </div>
                  <div className="console-metric-row">
                    <span className="metric-lbl">Bootcamps Held</span>
                    <span className="metric-val stat-counter" data-target="8">
                      0
                    </span>
                  </div>
                  <div className="console-metric-row">
                    <span className="metric-lbl">Lines Written</span>
                    <span
                      className="metric-val stat-counter"
                      data-target="50000"
                    >
                      0
                    </span>
                  </div>
                  <div className="console-line" style={{ marginTop: "1.5rem" }}>
                    <span>
                      system: status initialized{" "}
                      <span className="console-cursor"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Ticker */}
      <div className="ab-marquee-wrap">
        <div className="ab-marquee-track">
          <div className="ab-marquee-content">
            <span className="ab-marquee-item">AZURE</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">WORKSHOPS</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">HACKATHONS</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">OPEN SOURCE</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">AI / ML</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">CLOUD COMPUTING</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">SYSTEMS DESIGN</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">PEER MENTORSHIP</span>
            <span className="ab-marquee-dot">●</span>
          </div>
          <div className="ab-marquee-content" aria-hidden="true">
            <span className="ab-marquee-item">AZURE</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">WORKSHOPS</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">HACKATHONS</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">OPEN SOURCE</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">AI / ML</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">CLOUD COMPUTING</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">SYSTEMS DESIGN</span>
            <span className="ab-marquee-dot">●</span>
            <span className="ab-marquee-item">PEER MENTORSHIP</span>
            <span className="ab-marquee-dot">●</span>
          </div>
        </div>
      </div>

      {/* Origin / Credits */}
      <section className="ab-origin-premium">
        <div className="container">
          <div className="editorial-origin-grid">
            <div className="editorial-origin-left">
              <span
                className="ab-eyebrow-tag"
                style={{ marginBottom: "1.5rem", display: "block" }}
              >
                Our Origin
              </span>
              <h2 className="editorial-quote">
                Founded on a<br />
                shared ambition.
              </h2>
              <p className="editorial-desc">
                What started as a handful of students sharing notes on Azure
                turned into SRM AP&apos;s most active engineering community. MSC
                isn&apos;t a club — it&apos;s a launchpad for future creators.
              </p>
              <div className="blueprint-credits-table">
                <div className="credit-row">
                  <span className="credit-row-label">Built by</span>
                  <span className="credit-row-value">
                    Microsoft Student Community — SRM University AP
                  </span>
                </div>
              </div>
            </div>
            <div className="editorial-origin-right">
              <div className="artwork-frame">
                <img
                  src="/about_visual.png"
                  alt="MSC Innovation Artwork"
                  className="artwork-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="ab-manifesto-premium">
        <div className="container">
          <div
            className="ab-eyebrow-wrap"
            style={{ justifyContent: "center", marginBottom: "1rem" }}
          >
            <span className="ab-eyebrow-accent"></span>
            <span className="ab-eyebrow-tag">Our Philosophy</span>
          </div>
          <h2
            className="section-title"
            style={{ textAlign: "center", marginBottom: "2rem" }}
          >
            The Manifesto
          </h2>

          <div className="manifesto-bento-grid">
            <article className="bento-card large-vision glow-card">
              <div className="bento-card-content">
                <div className="bento-top-group">
                  <div className="bento-idx">01</div>
                  <div>
                    <h3 className="bento-card-title">The Vision</h3>
                    <p className="bento-card-desc">
                      To position ourselves as a student focused community and
                      create visionaries of tomorrow
                    </p>
                  </div>
                </div>
                <div className="bento-badge-cloud">
                  <span className="bento-badge">Impact</span>
                  <span className="bento-badge">Innovation</span>
                  <span className="bento-badge">Scale</span>
                </div>
              </div>
            </article>

            <article className="bento-card mission-block glow-card">
              <div className="bento-card-content">
                <div className="bento-top-group">
                  <div className="bento-idx">02</div>
                  <div>
                    <h3 className="bento-card-title">The Mission</h3>
                    <p className="bento-card-desc">
                      To provide a student led and student focused platform for
                      interaction and ideas. Committed towards bringing
                      diversity in people and domains.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="bento-card pillars-block glow-card">
              <div className="bento-card-content">
                <div className="bento-top-group">
                  <div className="bento-idx">03</div>
                  <div>
                    <h3 className="bento-card-title">Core Technologies</h3>
                    <p
                      className="bento-card-desc"
                      style={{ marginBottom: "1rem" }}
                    >
                      We utilize industry-standard ecosystems to architect
                      scalable student applications.
                    </p>
                  </div>
                </div>
                <div className="bento-badge-cloud">
                  <span className="bento-badge">Azure Cloud</span>
                  <span className="bento-badge">Open Source</span>
                  <span className="bento-badge">AI Integration</span>
                  <span className="bento-badge">Web Dev</span>
                  <span className="bento-badge">System Design</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="ab-journey-premium">
        <div className="container">
          <div className="timeline-editorial-header">
            <span
              className="ab-eyebrow-tag"
              style={{ marginBottom: "1.5rem", display: "inline-block" }}
            >
              Our Journey
            </span>
            <h2 className="section-title">
              Three chapters,
              <br />
              one trajectory.
            </h2>
          </div>

          <div className="timeline-container-premium">
            <div className="timeline-vertical-bar">
              <div className="timeline-progress-fill"></div>
            </div>

            <div className="timeline-phase">
              <div className="timeline-node">
                <div className="timeline-node-inner"></div>
              </div>
              <article className="timeline-blueprint-card">
                <div className="timeline-phase-meta">
                  <span className="phase-number">Phase I</span>
                  <span className="phase-year">The Past</span>
                </div>
                <h4>Foundations</h4>
                <p>
                  The community has successfully led major events providing
                  student focused opportunities with events like HackMSC and
                  Zero Jam which have formed a major part of the
                  community&apos;s legacy and strengthen our vision for
                  tomorrow.
                </p>
              </article>
            </div>

            <div className="timeline-phase">
              <div className="timeline-node">
                <div className="timeline-node-inner"></div>
              </div>
              <article className="timeline-blueprint-card">
                <div className="timeline-phase-meta">
                  <span className="phase-number">Phase II</span>
                  <span className="phase-year">The Present</span>
                </div>
                <h4>Execution</h4>
                <p>
                  The community continues in the tradition of the star events
                  while bringing new ideas to diversify student outreach to
                  different courses and specializations. Thus fulfilling the
                  student first commitment.
                </p>
              </article>
            </div>

            <div className="timeline-phase">
              <div className="timeline-node">
                <div className="timeline-node-inner"></div>
              </div>
              <article className="timeline-blueprint-card">
                <div className="timeline-phase-meta">
                  <span className="phase-number">Phase III</span>
                  <span className="phase-year">The Future</span>
                </div>
                <h4>Evolution</h4>
                <p>
                  The community aims to be the forerunner in student led
                  communities in providing students with opportunities while
                  being transparent in its objective of working for all students
                  and providing support.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
