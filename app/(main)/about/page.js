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
            if (bgVideo) bgVideo.play().catch((e) => function () { });
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
      if (bgVideo) bgVideo.play().catch((e) => function () { });
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

      {/* Architectural HUD Hero Stage */}
      <section className="ab-stage-hero">
        <div className="container">
          <div className="ab-stage-content">

            {/* Architectural Signal Eyebrow */}
            <div className="ab-stage-signal">
              <div className="ms-quad-emblem mini">
                <span className="ms-quad q-red"></span>
                <span className="ms-quad q-green"></span>
                <span className="ms-quad q-blue"></span>
                <span className="ms-quad q-yellow"></span>
              </div>
              <span className="signal-label">ABOUT THE COMMUNITY</span>
              <span className="signal-dot">•</span>
              <span className="signal-sub">SRM UNIVERSITY AP</span>
              <div className="signal-live-pill">
                <span className="live-pulse-dot"></span>
                <span>ACTIVE CHAPTER &apos;26</span>
              </div>
            </div>

            {/* Monumental Kinetic Headline */}
            <h1 className="ab-stage-title">
              <span className="title-row">
                <span className="editorial-word">We</span>{" "}
                <span className="editorial-word">don&apos;t</span>{" "}
                <span className="editorial-word">just</span>{" "}
                <span className="editorial-word title-italic-learn">learn</span>{" "}
                <span className="editorial-word">tech.</span>
              </span>
              <span className="title-row">
                <span className="editorial-word">We</span>{" "}
                <span className="editorial-word title-gradient-build">build</span>{" "}
                <span className="editorial-word">with</span>{" "}
                <span className="editorial-word">it.</span>
              </span>
            </h1>

            {/* Editorial Manifesto Description */}
            <p className="ab-stage-desc">
              A student-led space at SRM University AP where engineers, designers,
              and thinkers come together to ship real products with Microsoft technologies.
            </p>

            {/* Telemetry Array */}
            <div className="ab-hud-array">
              {/* Telemetry Datum Header with Embedded Terminal Prompt */}
              <div className="hud-datum-header">
                <div className="hud-datum-left">
                  <span className="hud-corner-cross">+</span>
                  <span className="hud-cli-prompt">$</span>
                  <span className="hud-cli-cmd">cat msc-stats.json</span>
                  <span className="hud-cli-cursor"></span>
                </div>
                <div className="hud-datum-center">
                  <span className="hud-coord">16.46°N 80.50°E // MSC-SRMAP</span>
                </div>
                <div className="hud-datum-right">
                  <span className="hud-sys-status">system: status initialized</span>
                  <span className="hud-status-led"></span>
                  <span className="hud-corner-cross">+</span>
                </div>
              </div>

              {/* Metric Columns */}
              <div className="hud-metrics-horizon">
                <div className="hud-col">
                  <div className="hud-col-meta">
                    <span className="hud-col-num">01</span>
                    <span className="hud-col-cat">GUILD</span>
                  </div>
                  <div className="hud-col-value stat-counter" data-target="50">0</div>
                  <div className="hud-col-label">Active Builders</div>
                  <div className="hud-col-accent-bar"></div>
                </div>

                <div className="hud-col">
                  <div className="hud-col-meta">
                    <span className="hud-col-num">02</span>
                    <span className="hud-col-cat">OPEN SOURCE</span>
                  </div>
                  <div className="hud-col-value stat-counter" data-target="12">0</div>
                  <div className="hud-col-label">Repositories</div>
                  <div className="hud-col-accent-bar"></div>
                </div>

                <div className="hud-col">
                  <div className="hud-col-meta">
                    <span className="hud-col-num">03</span>
                    <span className="hud-col-cat">HANDS-ON</span>
                  </div>
                  <div className="hud-col-value stat-counter" data-target="8">0</div>
                  <div className="hud-col-label">Bootcamps Held</div>
                  <div className="hud-col-accent-bar"></div>
                </div>

                <div className="hud-col">
                  <div className="hud-col-meta">
                    <span className="hud-col-num">04</span>
                    <span className="hud-col-cat">PRODUCTION</span>
                  </div>
                  <div className="hud-col-value stat-counter" data-target="50000">0</div>
                  <div className="hud-col-label">Lines Written</div>
                  <div className="hud-col-accent-bar"></div>
                </div>
              </div>

              {/* Telemetry Datum Footer Line */}
              <div className="hud-datum-footer">
                <span className="hud-corner-cross">+</span>
                <div className="hud-datum-line"></div>
                <span className="hud-corner-cross">+</span>
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

      {/* Origin / Genesis Section */}
      <section className="ab-origin-premium">
        <div className="container">
          <div className="origin-architectural-grid">

            {/* Left Narrative Column */}
            <div className="origin-narrative-col">

              {/* Tactical Eyebrow */}
              <div className="origin-eyebrow-line">
                <span className="origin-beacon-dot"></span>
                <span className="origin-eyebrow-main">OUR ORIGIN</span>
                <span className="origin-eyebrow-sep">{"//"}</span>
                <span className="origin-eyebrow-tag">GENESIS ARCHIVE</span>
              </div>

              {/* Monumental Stardom Serif Heading */}
              <h2 className="origin-monumental-title">
                Founded on a<br />
                <span className="origin-italic-accent">shared ambition.</span>
              </h2>

              {/* Refined Narrative Story */}
              <p className="origin-story-text">
                What started as a handful of students sharing notes on Azure
                turned into SRM AP&apos;s most active engineering community. MSC
                isn&apos;t a club — it&apos;s a launchpad for future creators.
              </p>

              {/* Provenance Deck */}
              <div className="origin-provenance-deck">
                <div className="provenance-entry">
                  <div className="provenance-header">
                    <span className="provenance-num">01</span>
                    <span className="provenance-label">FOUNDED BY</span>
                  </div>
                  <div className="provenance-name">Jayanth Ramakrishnan</div>
                  <div className="provenance-line-indicator"></div>
                </div>

                <div className="provenance-entry">
                  <div className="provenance-header">
                    <span className="provenance-num">02</span>
                    <span className="provenance-label">GUIDED BY</span>
                  </div>
                  <div className="provenance-name">Dr. Murali Krishna Enduri Sir and Dr. CV Tomy Sir</div>
                  <div className="provenance-line-indicator"></div>
                </div>

                <div className="provenance-entry">
                  <div className="provenance-header">
                    <span className="provenance-num">03</span>
                    <span className="provenance-label">ESTABLISHED</span>
                  </div>
                  <div className="provenance-name">SRM University AP</div>
                  <div className="provenance-line-indicator"></div>
                </div>
              </div>

            </div>

            {/* Visual Artwork */}
            <div className="origin-visual-col">
              <div className="origin-visual-stage">
                <div className="visual-stage-backdrop"></div>

                {/* Precision HUD Coordinate Anchors */}
                <span className="visual-hud-marker marker-tl">+</span>
                <span className="visual-hud-marker marker-tr">MSC // ARCHIVE</span>
                <span className="visual-hud-marker marker-bl">LAT 16.46°N LON 80.50°E</span>
                <span className="visual-hud-marker marker-br">+</span>

                {/* Floating Luminous Artwork */}
                <div className="visual-artwork-glow-wrap">
                  <img
                    src="/about_visual.png"
                    alt="MSC Innovation Artwork"
                    className="origin-free-artwork"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="visual-glass-sheen"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="ab-manifesto-premium">
        <div className="container">

          {/* Editorial Section Header */}
          <div className="manifesto-editorial-header">
            <div className="manifesto-eyebrow-line">
              <span className="manifesto-pulse-beacon"></span>
              <span className="manifesto-eyebrow-main">OUR PHILOSOPHY</span>
              <span className="manifesto-eyebrow-sep">{"//"}</span>
              <span className="manifesto-eyebrow-sub">THE FOUNDATIONAL PRINCIPLES</span>
            </div>
            <h2 className="manifesto-monumental-title">
              The <span className="manifesto-italic-gradient">Manifesto.</span>
            </h2>
          </div>

          {/* Tri-Pillar Horizon */}
          <div className="manifesto-horizon-stage">

            {/* Top Datum Line with Corner Crosshairs */}
            <div className="manifesto-datum-header">
              <div className="datum-header-left">
                <span className="manifesto-cross">+</span>
                <span className="manifesto-datum-tag">DOCTRINE // 01-03</span>
              </div>
              <div className="datum-header-center">
                <span className="manifesto-datum-coord">SRM-AP // GUIDING FRAMEWORK</span>
              </div>
              <div className="datum-header-right">
                <span className="manifesto-datum-status">STATUS: RATIFIED</span>
                <span className="manifesto-cross">+</span>
              </div>
            </div>

            {/* 3 Open Architectural Doctrine Columns */}
            <div className="manifesto-columns-grid">

              {/* Pillar 01: The Vision */}
              <div className="manifesto-col">
                <div className="manifesto-col-header">
                  <span className="manifesto-col-index">01</span>
                  <span className="manifesto-col-type">ASPIRATION</span>
                </div>
                <h3 className="manifesto-col-title">The Vision</h3>
                <p className="manifesto-col-desc">
                  To position ourselves as a student focused community and create visionaries of tomorrow
                </p>
                <div className="manifesto-telemetry-stream">
                  <span className="stream-tag">Impact</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">Innovation</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">Scale</span>
                </div>
                <div className="manifesto-col-laser-line"></div>
              </div>

              {/* Pillar 02: The Mission */}
              <div className="manifesto-col">
                <div className="manifesto-col-header">
                  <span className="manifesto-col-index">02</span>
                  <span className="manifesto-col-type">PURPOSE</span>
                </div>
                <h3 className="manifesto-col-title">The Mission</h3>
                <p className="manifesto-col-desc">
                  To provide a student led and student focused platform for interaction and ideas. Committed towards bringing diversity in people and domains.
                </p>
                <div className="manifesto-telemetry-stream">
                  <span className="stream-tag">Interaction</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">Ideas</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">Diversity</span>
                </div>
                <div className="manifesto-col-laser-line"></div>
              </div>

              {/* Pillar 03: Core Technologies */}
              <div className="manifesto-col">
                <div className="manifesto-col-header">
                  <span className="manifesto-col-index">03</span>
                  <span className="manifesto-col-type">STACK</span>
                </div>
                <h3 className="manifesto-col-title">Core Technologies</h3>
                <p className="manifesto-col-desc">
                  We utilize industry-standard ecosystems to architect scalable student applications.
                </p>
                <div className="manifesto-telemetry-stream wrap">
                  <span className="stream-tag">Azure Cloud</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">Open Source</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">AI Integration</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">Web Dev</span>
                  <span className="stream-dot">•</span>
                  <span className="stream-tag">System Design</span>
                </div>
                <div className="manifesto-col-laser-line"></div>
              </div>

            </div>

            {/* Bottom Datum Line */}
            <div className="manifesto-datum-footer">
              <span className="manifesto-cross">+</span>
              <div className="manifesto-datum-line"></div>
              <span className="manifesto-cross">+</span>
            </div>

          </div>

        </div>
      </section>

      {/* Journey Section */}
      <section className="ab-journey-premium">
        <div className="container">

          {/* Editorial Section Header */}
          <div className="journey-editorial-header">
            <div className="journey-eyebrow-line">
              <span className="journey-beacon-dot"></span>
              <span className="journey-eyebrow-main">OUR JOURNEY</span>
              <span className="journey-eyebrow-sep">{"//"}</span>
              <span className="journey-eyebrow-sub">THE EXPANSION CHRONICLE</span>
            </div>
            <h2 className="journey-monumental-title">
              Three chapters,<br />
              <span className="journey-italic-accent">one trajectory.</span>
            </h2>
          </div>

          {/* Chrono-Spine Timeline */}
          <div className="journey-chrono-stage">

            {/* Vertical Laser Spine */}
            <div className="journey-spine-track">
              <div className="timeline-progress-fill"></div>
            </div>

            {/* Timeline Phases */}
            <div className="journey-phases-list">

              {/* Phase I */}
              <div className="timeline-phase journey-phase-station">
                <div className="journey-node-anchor">
                  <span className="journey-node-cross">+</span>
                  <div className="journey-node-beacon"></div>
                </div>

                <div className="journey-phase-content">
                  <div className="journey-phase-header">
                    <span className="phase-index-tag">PHASE I</span>
                    <span className="phase-sep">•</span>
                    <span className="phase-temporal-tag">THE PAST</span>
                  </div>

                  <h3 className="journey-phase-title">Foundations</h3>

                  <p className="journey-phase-desc">
                    The community has successfully led major events providing student focused opportunities with events like HackMSC and Zero Jam which have formed a major part of the community&apos;s legacy and strengthen our vision for tomorrow.
                  </p>

                  <div className="journey-datum-hairline"></div>
                </div>
              </div>

              {/* Phase II */}
              <div className="timeline-phase journey-phase-station">
                <div className="journey-node-anchor">
                  <span className="journey-node-cross">+</span>
                  <div className="journey-node-beacon"></div>
                </div>

                <div className="journey-phase-content">
                  <div className="journey-phase-header">
                    <span className="phase-index-tag">PHASE II</span>
                    <span className="phase-sep">•</span>
                    <span className="phase-temporal-tag">THE PRESENT</span>
                  </div>

                  <h3 className="journey-phase-title">Execution</h3>

                  <p className="journey-phase-desc">
                    The community continues in the tradition of the star events while bringing new ideas to diversify student outreach to different courses and specializations. Thus fulfilling the student first commitment.
                  </p>

                  <div className="journey-datum-hairline"></div>
                </div>
              </div>

              {/* Phase III */}
              <div className="timeline-phase journey-phase-station">
                <div className="journey-node-anchor">
                  <span className="journey-node-cross">+</span>
                  <div className="journey-node-beacon"></div>
                </div>

                <div className="journey-phase-content">
                  <div className="journey-phase-header">
                    <span className="phase-index-tag">PHASE III</span>
                    <span className="phase-sep">•</span>
                    <span className="phase-temporal-tag">THE FUTURE</span>
                  </div>

                  <h3 className="journey-phase-title">Evolution</h3>

                  <p className="journey-phase-desc">
                    The community aims to be the forerunner in student led communities in providing students with opportunities while being transparent in its objective of working for all students and providing support.
                  </p>

                  <div className="journey-datum-hairline"></div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    </main>
  );
}
