"use client";

import { useEffect, useRef, useState } from "react";

export default function TeamClientWrapper({
  chiefBoard,
  boardMembers,
  teamMembers,
}) {
  const videoRef = useRef(null);
  const [ghostVisible, setGhostVisible] = useState(false);
  const [ghostName, setGhostName] = useState("");
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [currentYear] = useState(new Date().getFullYear());
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const totalMembers =
    chiefBoard.length + boardMembers.length + teamMembers.length;

  useEffect(() => {
    document.body.classList.add("team-page");
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
          loaderRingFill.style.strokeDashoffset =
            circumference - (progress / 100) * circumference;
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
      document.body.classList.remove("team-page");
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetPosRef.current.x = ((e.clientX - cx) / cx) * 1.5;
      targetPosRef.current.y = ((e.clientY - cy) / cy) * 1.5;
    };

    const loop = () => {
      currentPosRef.current.x +=
        (targetPosRef.current.x - currentPosRef.current.x) * 0.06;
      currentPosRef.current.y +=
        (targetPosRef.current.y - currentPosRef.current.y) * 0.06;
      const ghostText = document.getElementById("ghostNameText");
      if (ghostText) {
        ghostText.style.transform = `translate(${currentPosRef.current.x}%, ${currentPosRef.current.y}%)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index || "0", 10);
            const delay = Math.min(index * 55, 500);
            setTimeout(() => {
              setVisibleElements((prev) => {
                const next = new Set(prev);
                next.add(entry.target.dataset.id);
                return next;
              });
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    const elements = document.querySelectorAll(
      ".msc-scroll-reveal, .tm-section-divider",
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const renderPhotoSlot = (member) => {
    const nameParts = (member.name || "").trim().split(" ");
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : (nameParts[0] || "?")[0].toUpperCase();

    const imgSrc = member.image_url || member.image || "";

    if (imgSrc) {
      return (
        <div className="tm-photo-slot msc-image-box">
          <img
            src={imgSrc}
            alt={member.name}
            className="tm-photo-img"
            loading="lazy"
            decoding="async"
          />
          <div className="msc-image-box__glare"></div>
          <div className="msc-image-box__hud">
            <div className="msc-hud-top">
              <span className="msc-hud-mark">MSC // CORE</span>
            </div>
            <div className="msc-hud-bottom">
              <div className="msc-hud-crosshair"></div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="tm-photo-slot tm-photo-placeholder msc-image-box">
        <div className="tm-avatar-fallback">
          <svg
            className="tm-avatar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="tm-avatar-initials">{initials}</span>
          <span className="tm-upload-tag">
            <i className="fa-solid fa-camera"></i> Photo Slot
          </span>
        </div>
        <div className="msc-image-box__glare"></div>
        <div className="msc-image-box__hud">
          <div className="msc-hud-top">
            <span className="msc-hud-mark">SLOT_OPEN</span>
          </div>
          <div className="msc-hud-bottom">
            <div className="msc-hud-crosshair"></div>
          </div>
        </div>
      </div>
    );
  };

  const buildSocialLinks = (member, extraClass = "") => {
    const links = [
      {
        key: "linkedin",
        icon: "fab fa-linkedin-in",
        href: member.linkedin_url || member.linkedin,
      },
      {
        key: "github",
        icon: "fab fa-github",
        href: member.github_url || member.github,
      },
      {
        key: "twitter",
        icon: "fab fa-x-twitter",
        href: member.twitter_url || member.twitter,
      },
      {
        key: "instagram",
        icon: "fab fa-instagram",
        href: member.instagram_url || member.instagram,
      },
      {
        key: "email",
        icon: "fa fa-envelope",
        href: member.email ? `mailto:${member.email}` : "",
      },
      {
        key: "portfolio",
        icon: "fas fa-globe",
        href: member.portfolio_url || member.portfolio,
      },
    ].filter((d) => d.href);

    return links.map((d, i) => (
      <a
        key={i}
        href={d.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`tm-social-link ${extraClass}`}
        aria-label={d.key}
      >
        <i className={d.icon}></i>
      </a>
    ));
  };

  const handleRowMouseMove = (e, target) => {
    if (window.innerWidth < 768) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    target.style.setProperty("--my", `${e.clientY - rect.top}px`);
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

      <div
        className="ghost-name-container"
        id="ghostNameContainer"
        aria-hidden="true"
      >
        <div
          className={`ghost-name-stage ${ghostVisible ? "ghost-visible" : ""}`}
          id="ghostNameStage"
        >
          <span
            className={`ghost-name-text ${ghostVisible ? "ghost-active" : ""}`}
            id="ghostNameText"
          >
            {ghostName}
          </span>
        </div>
      </div>

      <header className="tm-header">
        <div className="tm-header-inner">
          <div className="tm-header-meta">
            <span className="tm-meta-line" id="tmMemberCount">
              {String(totalMembers).padStart(2, "0")} MEMBERS
            </span>
            <span className="tm-meta-sep">·</span>
            <span className="tm-meta-line">MSC · SRMAP</span>
            <span className="tm-meta-sep">·</span>
            <span className="tm-meta-line">{currentYear}</span>
          </div>

          <h1 className="tm-headline">
            <span className="tm-headline-row tm-headline-light">
              <span
                className="inner"
                style={{
                  transform: "translateY(0)",
                  opacity: 1,
                  display: "inline-block",
                  transition:
                    "transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                }}
              >
                The
              </span>
            </span>
            <span className="tm-headline-row tm-headline-bold">
              <span
                className="inner"
                style={{
                  transform: "translateY(0)",
                  opacity: 1,
                  display: "inline-block",
                  transition:
                    "transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, opacity 0.8s ease 0.12s",
                }}
              >
                People
              </span>
            </span>
            <span className="tm-headline-row tm-headline-serif">
              <span
                className="inner"
                style={{
                  transform: "translateY(0)",
                  opacity: 1,
                  display: "inline-block",
                  transition:
                    "transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.24s, opacity 0.8s ease 0.24s",
                }}
              >
                behind it.
              </span>
            </span>
          </h1>

          <div className="tm-header-descriptor">
            <div className="tm-descriptor-bar"></div>
            <p className="tm-descriptor-text">
              Every commit, every workshop, every late-night debug session —
              <br />
              it starts here.
            </p>
          </div>
        </div>

        <div className="tm-archive-label" aria-hidden="true">
          <span className="tm-archive-tag">PERSONNEL</span>
          <span className="tm-archive-tag">ARCHIVE</span>
          <span className="tm-archive-tag">VOL.I</span>
        </div>
      </header>

      {chiefBoard.length > 0 && (
        <>
          <div
            className={`tm-section-divider msc-scroll-reveal ${
              visibleElements.has("divider-chief") ? "tm-row-visible" : ""
            }`}
            data-id="divider-chief"
          >
            <div
              className="tm-divider-line"
              style={{
                opacity: visibleElements.has("divider-chief") ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            ></div>
            <span
              className="tm-divider-label"
              style={{
                opacity: visibleElements.has("divider-chief") ? 1 : 0,
                transform: visibleElements.has("divider-chief")
                  ? "translateX(0)"
                  : "translateX(-8px)",
                transition:
                  "opacity 0.6s ease 0.15s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
              }}
            >
              CORE LEADERSHIP
            </span>
            <div
              className="tm-divider-count"
              style={{
                opacity: visibleElements.has("divider-chief") ? 0.6 : 0,
                transition: "opacity 0.6s ease 0.25s",
              }}
            >
              {String(chiefBoard.length).padStart(2, "0")}
            </div>
          </div>

          <section className="tm-tier tm-tier--chief">
            <div className="tm-roster tm-roster--exposed">
              {chiefBoard.map((m, i) => {
                const id = `chief-${i}`;
                return (
                  <div
                    key={id}
                    className={`tm-exposed-row msc-scroll-reveal ${
                      visibleElements.has(id) ? "tm-row-visible" : ""
                    }`}
                    data-id={id}
                    data-index={i}
                    onMouseEnter={() => {
                      setGhostName(m.name);
                      setGhostVisible(true);
                    }}
                    onMouseLeave={() => setGhostVisible(false)}
                    onMouseMove={(e) => handleRowMouseMove(e, e.currentTarget)}
                  >
                    <span className="tm-exposed-index">
                      {String(i + 1).padStart(2, "00")}
                    </span>
                    <div className="tm-exposed-avatar-wrap">
                      {renderPhotoSlot(m)}
                    </div>
                    <div className="tm-exposed-body">
                      <span className="tm-exposed-name">{m.name}</span>
                      <span className="tm-exposed-role">{m.role}</span>
                    </div>
                    <div className="tm-exposed-social">
                      {buildSocialLinks(m)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {boardMembers.length > 0 && (
        <>
          <div
            className={`tm-section-divider msc-scroll-reveal ${
              visibleElements.has("divider-board") ? "tm-row-visible" : ""
            }`}
            data-id="divider-board"
          >
            <div
              className="tm-divider-line"
              style={{
                opacity: visibleElements.has("divider-board") ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            ></div>
            <span
              className="tm-divider-label"
              style={{
                opacity: visibleElements.has("divider-board") ? 1 : 0,
                transform: visibleElements.has("divider-board")
                  ? "translateX(0)"
                  : "translateX(-8px)",
                transition:
                  "opacity 0.6s ease 0.15s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
              }}
            >
              CORE TEAM
            </span>
            <div
              className="tm-divider-count"
              style={{
                opacity: visibleElements.has("divider-board") ? 0.6 : 0,
                transition: "opacity 0.6s ease 0.25s",
              }}
            >
              {String(boardMembers.length).padStart(2, "0")}
            </div>
          </div>

          <section className="tm-tier tm-tier--board">
            <div className="tm-roster tm-roster--ledger">
              {boardMembers.map((m, i) => {
                const id = `board-${i}`;
                return (
                  <div
                    key={id}
                    className={`tm-ledger-row msc-scroll-reveal ${
                      visibleElements.has(id) ? "tm-row-visible" : ""
                    }`}
                    data-id={id}
                    data-index={i}
                    onMouseEnter={() => {
                      setGhostName(m.name);
                      setGhostVisible(true);
                    }}
                    onMouseLeave={() => setGhostVisible(false)}
                    onMouseMove={(e) => handleRowMouseMove(e, e.currentTarget)}
                  >
                    <span className="tm-ledger-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="tm-ledger-avatar-wrap">
                      {renderPhotoSlot(m)}
                    </div>
                    <span className="tm-ledger-name">{m.name}</span>
                    <span className="tm-ledger-role">{m.role}</span>
                    <div className="tm-ledger-social">
                      {buildSocialLinks(m)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {teamMembers.length > 0 && (
        <>
          <div
            className={`tm-section-divider msc-scroll-reveal ${
              visibleElements.has("divider-team") ? "tm-row-visible" : ""
            }`}
            data-id="divider-team"
          >
            <div
              className="tm-divider-line"
              style={{
                opacity: visibleElements.has("divider-team") ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            ></div>
            <span
              className="tm-divider-label"
              style={{
                opacity: visibleElements.has("divider-team") ? 1 : 0,
                transform: visibleElements.has("divider-team")
                  ? "translateX(0)"
                  : "translateX(-8px)",
                transition:
                  "opacity 0.6s ease 0.15s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
              }}
            >
              Core Team
            </span>
            <div
              className="tm-divider-count"
              style={{
                opacity: visibleElements.has("divider-team") ? 0.6 : 0,
                transition: "opacity 0.6s ease 0.25s",
              }}
            >
              {String(teamMembers.length).padStart(2, "0")}
            </div>
          </div>

          <section className="tm-tier tm-tier--team">
            <div className="tm-roster tm-roster--frequency">
              {teamMembers.map((m, i) => {
                const id = `team-${i}`;
                return (
                  <div
                    key={id}
                    className={`tm-freq-cell msc-scroll-reveal ${
                      visibleElements.has(id) ? "tm-row-visible" : ""
                    }`}
                    data-id={id}
                    data-index={i}
                    onMouseEnter={() => {
                      setGhostName(m.name);
                      setGhostVisible(true);
                    }}
                    onMouseLeave={() => setGhostVisible(false)}
                    onMouseMove={(e) => handleRowMouseMove(e, e.currentTarget)}
                  >
                    <span className="tm-freq-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="tm-freq-avatar-wrap">
                      {renderPhotoSlot(m)}
                    </div>
                    <span className="tm-freq-name">{m.name}</span>
                    <span className="tm-freq-role">{m.role}</span>
                    <div className="tm-freq-social">{buildSocialLinks(m)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <div className="tm-endstamp">
        <div className="tm-endstamp-inner">
          <span className="tm-endstamp-line">END OF RECORD</span>
          <div className="tm-endstamp-rule"></div>
          <span className="tm-endstamp-line">MSC · SRMAP · {currentYear}</span>
        </div>
      </div>
    </main>
  );
}
