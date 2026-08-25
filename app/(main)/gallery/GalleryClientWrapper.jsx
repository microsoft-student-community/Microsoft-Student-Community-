"use client";

import { useEffect, useRef, useState } from "react";

export default function GalleryClientWrapper({ items: galleryData }) {
  const videoRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(new Set());

  // Map Supabase rows to UI shape
  const INITIAL_GALLERY_DATA = galleryData.map((e, idx) => {
    // Generate a variant pattern for layout (standard, wide, tall, featured)
    const variants = [
      "standard",
      "wide",
      "standard",
      "standard",
      "tall",
      "wide",
    ];
    const variant = variants[idx % variants.length];

    // Format date
    const d = new Date(e.created_at);
    const dateStr = d
      .toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();

    return {
      id: e.id,
      title: e.title || "Untitled",
      category: e.category || "misc",
      date: dateStr,
      image: e.image_url || "",
      variant: variant,
      desc: e.alt_text || "Community Archive Frame",
      stats: [],
    };
  });

  const filteredItems = INITIAL_GALLERY_DATA.filter((item) => {
    const matchesFilter =
      filter === "all" || item.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const nextLightbox = () => {
    if (filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevLightbox = () => {
    if (filteredItems.length === 0) return;
    setLightboxIndex(
      (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, filteredItems.length]);

  useEffect(() => {
    document.body.classList.add("gallery-page");

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
      document.body.classList.remove("gallery-page");
    };
  }, []);

  useEffect(() => {
    // Scroll reveal logic
    const cards = document.querySelectorAll(".msc-scroll-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            setVisibleItems((prev) => new Set(prev).add(id));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredItems]);

  const handleMouseMove = (e, target) => {
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    const imageBox = target.querySelector(".msc-image-box");
    if (imageBox) {
      imageBox.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
      imageBox.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
      imageBox.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }
  };

  const handleMouseLeave = (target) => {
    const imageBox = target.querySelector(".msc-image-box");
    if (imageBox) {
      imageBox.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  };

  const activeItem = filteredItems[lightboxIndex];

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

      <section className="gallery-hero">
        <div className="container">
          <div className="gallery-hero-inner">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              <span className="hero-badge-text">
                VISUAL ARCHIVE · VOL. 2025
              </span>
            </div>
            <h1 className="gallery-hero-title">
              Stories in <span className="accent-serif">Motion</span> &amp;{" "}
              <span className="accent-glow">Frames</span>
            </h1>
            <p className="gallery-hero-desc">
              An interactive chronicle of hackathons, technical bootcamps,
              hardware exhibitions, and community moments hosted by Microsoft
              Student Community at SRM University AP.
            </p>
          </div>
        </div>
      </section>

      <section className="gallery-controls-section">
        <div className="container">
          <div className="gallery-controls-wrapper">
            <div className="gallery-filter-pills" id="filterPills">
              <button
                className={`filter-pill ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Frames
              </button>
              <button
                className={`filter-pill ${
                  filter === "hackathon" ? "active" : ""
                }`}
                onClick={() => setFilter("hackathon")}
              >
                Hackathons
              </button>
              <button
                className={`filter-pill ${filter === "workshop" ? "active" : ""}`}
                onClick={() => setFilter("workshop")}
              >
                Workshops
              </button>
              <button
                className={`filter-pill ${filter === "festival" ? "active" : ""}`}
                onClick={() => setFilter("festival")}
              >
                Festivals
              </button>
              <button
                className={`filter-pill ${filter === "community" ? "active" : ""}`}
                onClick={() => setFilter("community")}
              >
                Community
              </button>
            </div>

            <div className="gallery-actions">
              <div className="gallery-search-box">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  id="gallerySearch"
                  placeholder="Search frames, tags..."
                  aria-label="Search gallery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-grid-section">
        <div className="container">
          <div className="gallery-bento-grid" id="galleryBento">
            {filteredItems.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <i
                  className="fa-solid fa-photo-film"
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "12px",
                    color: "rgba(0,120,212,0.5)",
                  }}
                ></i>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  No frames match your search
                </h3>
                <p style={{ fontSize: "0.9rem" }}>
                  Try selecting a different filter or clearing your search term.
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <article
                  key={item.id}
                  className={`bento-card ${item.variant || "standard"} msc-scroll-reveal ${
                    visibleItems.has(item.id) ? "is-visible" : ""
                  }`}
                  data-id={item.id}
                  onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                  onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                  onClick={() => openLightbox(index)}
                >
                  <div className="msc-image-box">
                    <div className="msc-image-box__media">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="msc-image-box__glare"></div>

                    <div className="msc-image-box__hud">
                      <div className="msc-hud-top">
                        <span className="msc-hud-mark">
                          {item.category.toUpperCase()}
                        </span>
                        <div className="msc-hud-crosshair"></div>
                      </div>
                      <div className="msc-hud-bottom">
                        <span className="msc-hud-mark">MSC_RAW</span>
                        <span className="msc-hud-mark">REC ●</span>
                      </div>
                    </div>

                    <div className="bento-card-overlay">
                      <span className="bento-meta-badge">{item.category}</span>
                      <h3 className="bento-title">{item.title}</h3>
                      <span className="bento-date">{item.date}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <div
        className={`vf-lightbox ${lightboxOpen ? "active" : ""}`}
        id="vfLightbox"
        aria-hidden={!lightboxOpen}
        role="dialog"
      >
        <div
          className="vf-lightbox-backdrop"
          id="vfBackdrop"
          onClick={closeLightbox}
        ></div>

        <button
          className="vf-close-btn"
          id="vfCloseBtn"
          aria-label="Close modal"
          onClick={closeLightbox}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="vf-lightbox-body">
          <div className="vf-viewport">
            <button
              className="vf-nav-arrow vf-prev"
              id="vfPrevBtn"
              aria-label="Previous image"
              onClick={prevLightbox}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {activeItem && (
              <div className="vf-img-wrapper msc-image-box">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  id="vfImg"
                  decoding="async"
                />
                <div className="msc-image-box__glare"></div>
                <div className="msc-image-box__hud">
                  <div className="msc-hud-top">
                    <span className="msc-hud-mark">MSC // RAW_CAPTURE</span>
                    <div className="msc-hud-crosshair"></div>
                  </div>
                  <div className="msc-hud-bottom">
                    <span className="msc-hud-mark">4K UHD</span>
                    <span className="msc-hud-mark" id="vfCounter">
                      {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
                      {String(filteredItems.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              className="vf-nav-arrow vf-next"
              id="vfNextBtn"
              aria-label="Next image"
              onClick={nextLightbox}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <aside className="vf-panel">
            {activeItem && (
              <>
                <div className="vf-panel-header">
                  <span className="vf-tag" id="vfTag">
                    {activeItem.category.toUpperCase()}
                  </span>
                  <span className="vf-date" id="vfDate">
                    {activeItem.date}
                  </span>
                </div>
                <h2 className="vf-title" id="vfTitle">
                  {activeItem.title}
                </h2>
                <p className="vf-desc" id="vfDesc">
                  {activeItem.desc}
                </p>

                <div className="vf-divider"></div>

                <div className="vf-stats-grid" id="vfStatsGrid">
                  {activeItem.stats && activeItem.stats.length > 0 ? (
                    activeItem.stats.map((s, idx) => (
                      <div className="vf-stat-card" key={idx}>
                        <span className="vf-stat-label">{s.label}</span>
                        <span className="vf-stat-value">{s.value}</span>
                      </div>
                    ))
                  ) : (
                    <div
                      className="vf-stat-card"
                      style={{ gridColumn: "span 2" }}
                    >
                      <span className="vf-stat-label">STATUS</span>
                      <span className="vf-stat-value">
                        Community Archive Frame
                      </span>
                    </div>
                  )}
                </div>

                <div className="vf-panel-actions">
                  <a
                    href={activeItem.image}
                    id="vfDownloadBtn"
                    download
                    className="vf-action-btn primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa-solid fa-download"></i>{" "}
                    <span>Download Original</span>
                  </a>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
