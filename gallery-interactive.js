/* ==========================================================================
   GALLERY-INTERACTIVE.JS (v7.0)
   Microsoft Student Community · SRM University AP
   3D Tilt Engine · Live Category & Text Search · Lightbox · Local Photo Upload
   ========================================================================== */

(function () {
  'use strict';

  // INITIAL GALLERY ARCHIVE DATASET
  const INITIAL_GALLERY_DATA = [
    {
      id: "hack-2-0",
      title: "<hack>2.0</msc>",
      category: "hackathon",
      date: "NOV 01-02, 2024",
      image: "https://res.cloudinary.com/ds0ipwzxr/image/upload/v1761658955/HachMSC_igttdh.jpg",
      variant: "featured", // 2x2 bento card
      desc: "Our flagship 30-hour student hackathon. Teams from all blocks converged to design, prototype, and present software/hardware automations addressing national challenges.",
      stats: [
        { label: "Hackers", value: "200+" },
        { label: "Duration", value: "30 Hours" },
        { label: "Location", value: "SRM University AP" },
        { label: "Projects", value: "34 Deployed" }
      ]
    },
    {
      id: "hack-x-msc",
      title: "<hack>X<msc>",
      category: "hackathon",
      date: "JAN 24-25, 2025",
      image: "https://res.cloudinary.com/ds0ipwzxr/image/upload/v1761658924/HackXMSC_vc0uae.gif",
      variant: "wide", // 2x1 bento card
      desc: "A developer sprint addressing university-wide administrative bottlenecks. Student teams constructed tools for cafeteria line tracking, parking logs, and automated library syncs.",
      stats: [
        { label: "Teams", value: "45+" },
        { label: "Duration", value: "24 Hours" },
        { label: "Focus", value: "Campus Automation" },
        { label: "Repos", value: "40+" }
      ]
    },
    {
      id: "quantum-comp",
      title: "Quantum Computing Workshop",
      category: "workshop",
      date: "OCT 31, 2024",
      image: "https://res.cloudinary.com/ds0ipwzxr/image/upload/v1761658945/QuantumComp_yes6wo.jpg",
      variant: "standard",
      desc: "An introductory deep dive into quantum mechanics applied to computation. Students designed qubits, superposition states, and simulated circuits with Qiskit.",
      stats: [
        { label: "Attendees", value: "60+" },
        { label: "Stack", value: "Python / Qiskit" },
        { label: "Lab", value: "3 Hours" }
      ]
    },
    {
      id: "zero-jam",
      title: "Zero Jam Hackathon",
      category: "hackathon",
      date: "APR 04-05, 2024",
      image: "https://res.cloudinary.com/ds0ipwzxr/image/upload/v1761658980/ZeroZam_qpyr1u.jpg",
      variant: "standard",
      desc: "A high-octane build marathon powered by Microsoft Azure AI Services, Cognitive Search APIs, and serverless compute structures.",
      stats: [
        { label: "Hackers", value: "120+" },
        { label: "Projects", value: "28 Deployed" },
        { label: "Cloud", value: "Azure AI" }
      ]
    },
    {
      id: "tech-fest",
      title: "MSC Tech Fest",
      category: "festival",
      date: "OCT 31 - NOV 03, 2024",
      image: "https://res.cloudinary.com/ds0ipwzxr/image/upload/v1761658960/TechFest_qshvkr.gif",
      variant: "tall", // 1x2 bento card
      desc: "Annual celebration of engineering and builder culture spanning guest keynotes, competitive programming brackets, hardware showcases, and tech battles.",
      stats: [
        { label: "Visitors", value: "350+" },
        { label: "Channels", value: "5 Tracks" },
        { label: "Keynotes", value: "3 Speakers" }
      ]
    },
    {
      id: "tech-hunt",
      title: "MSC Tech Hunt",
      category: "community",
      date: "FEB 07, 2025",
      image: "https://res.cloudinary.com/ds0ipwzxr/image/upload/v1761658920/TechHunt_ocdicd.jpg",
      variant: "wide",
      desc: "An interactive version control repository quest. Students navigated Git branching strategies, resolved merge conflicts under pressure, and pushed PRs.",
      stats: [
        { label: "Participants", value: "85+" },
        { label: "Tooling", value: "Git / GitHub" },
        { label: "Merged PRs", value: "70+" }
      ]
    }
  ];

  let galleryItems = [...INITIAL_GALLERY_DATA];
  let activeFilter = "all";
  let searchQuery = "";
  let currentLightboxIndex = 0;

  // DOM ELEMENTS
  const bentoGrid = document.getElementById("galleryBento");
  const filterPills = document.querySelectorAll(".filter-pill");
  const searchInput = document.getElementById("gallerySearch");

  // LIGHTBOX DOM
  const vfLightbox = document.getElementById("vfLightbox");
  const vfBackdrop = document.getElementById("vfBackdrop");
  const vfCloseBtn = document.getElementById("vfCloseBtn");
  const vfPrevBtn = document.getElementById("vfPrevBtn");
  const vfNextBtn = document.getElementById("vfNextBtn");
  const vfImg = document.getElementById("vfImg");
  const vfTag = document.getElementById("vfTag");
  const vfDate = document.getElementById("vfDate");
  const vfTitle = document.getElementById("vfTitle");
  const vfDesc = document.getElementById("vfDesc");
  const vfCounter = document.getElementById("vfCounter");
  const vfStatsGrid = document.getElementById("vfStatsGrid");
  const vfDownloadBtn = document.getElementById("vfDownloadBtn");



  // ─── RENDER BENTO GALLERY ────────────────────────────────────────────────
  function renderGallery() {
    if (!bentoGrid) return;

    // Filter items
    const filtered = galleryItems.filter(item => {
      const matchesFilter = activeFilter === "all" || item.category.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) ||
        item.desc.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      bentoGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">
          <i class="fa-solid fa-photo-film" style="font-size: 2.5rem; margin-bottom: 12px; color: rgba(0,120,212,0.5);"></i>
          <h3 style="font-family: var(--font-d); color: #fff; margin-bottom: 8px;">No frames match your search</h3>
          <p style="font-size: 0.9rem;">Try selecting a different filter or clearing your search term.</p>
        </div>
      `;
      return;
    }

    bentoGrid.innerHTML = filtered.map((item, index) => {
      const variantClass = item.variant || "standard";
      return `
        <article class="bento-card ${variantClass} msc-scroll-reveal" data-id="${item.id}" data-index="${index}">
          <div class="msc-image-box">
            <div class="msc-image-box__media">
              <img src="${item.image}" alt="${item.title}" loading="lazy" />
            </div>
            <div class="msc-image-box__glare"></div>
            
            <div class="msc-image-box__hud">
              <div class="msc-hud-top">
                <span class="msc-hud-mark">${item.category.toUpperCase()}</span>
                <div class="msc-hud-crosshair"></div>
              </div>
              <div class="msc-hud-bottom">
                <span class="msc-hud-mark">MSC_RAW</span>
                <span class="msc-hud-mark">REC ●</span>
              </div>
            </div>

            <div class="bento-card-overlay">
              <span class="bento-meta-badge">${item.category}</span>
              <h3 class="bento-title">${item.title}</h3>
              <span class="bento-date">${item.date}</span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Initialize 3D Mouse Tilt & Click Listeners
    initCardInteractions(filtered);
    initScrollObserver();
  }

  // ─── CARD 3D TILT ENGINE & LIGHTBOX TRIGGER ──────────────────────────────
  function initCardInteractions(filteredItems) {
    const cards = bentoGrid.querySelectorAll(".bento-card");

    cards.forEach(card => {
      const imageBox = card.querySelector(".msc-image-box");

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8; // degrees
        const rotateY = ((x - centerX) / centerX) * 8;

        imageBox.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
        imageBox.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
        imageBox.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        imageBox.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });

      card.addEventListener("click", () => {
        const index = parseInt(card.dataset.index, 10);
        openLightbox(filteredItems, index);
      });
    });
  }

  // ─── SCROLL OBSERVER REVEAL ──────────────────────────────────────────────
  function initScrollObserver() {
    const reveals = bentoGrid.querySelectorAll(".msc-scroll-reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, i * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    reveals.forEach(el => observer.observe(el));
  }

  // ─── VIEWFINDER LIGHTBOX MODAL ───────────────────────────────────────────
  let currentActiveSet = [];

  function openLightbox(dataset, index) {
    currentActiveSet = dataset;
    currentLightboxIndex = index;
    updateLightboxContent();
    vfLightbox.classList.add("active");
    vfLightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    vfLightbox.classList.remove("active");
    vfLightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function updateLightboxContent() {
    if (!currentActiveSet[currentLightboxIndex]) return;
    const item = currentActiveSet[currentLightboxIndex];

    vfImg.src = item.image;
    vfImg.alt = item.title;
    vfTag.textContent = item.category.toUpperCase();
    vfDate.textContent = item.date;
    vfTitle.textContent = item.title;
    vfDesc.textContent = item.desc;
    vfCounter.textContent = `${String(currentLightboxIndex + 1).padStart(2, "0")} / ${String(currentActiveSet.length).padStart(2, "0")}`;
    vfDownloadBtn.href = item.image;

    // Render Stats
    if (item.stats && item.stats.length > 0) {
      vfStatsGrid.innerHTML = item.stats.map(s => `
        <div class="vf-stat-card">
          <span class="vf-stat-label">${s.label}</span>
          <span class="vf-stat-value">${s.value}</span>
        </div>
      `).join("");
    } else {
      vfStatsGrid.innerHTML = `
        <div class="vf-stat-card" style="grid-column: span 2;">
          <span class="vf-stat-label">STATUS</span>
          <span class="vf-stat-value">Community Archive Frame</span>
        </div>
      `;
    }
  }

  // Lightbox Navigation
  vfPrevBtn?.addEventListener("click", () => {
    currentLightboxIndex = (currentLightboxIndex - 1 + currentActiveSet.length) % currentActiveSet.length;
    updateLightboxContent();
  });

  vfNextBtn?.addEventListener("click", () => {
    currentLightboxIndex = (currentLightboxIndex + 1) % currentActiveSet.length;
    updateLightboxContent();
  });

  vfCloseBtn?.addEventListener("click", closeLightbox);
  vfBackdrop?.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!vfLightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") vfPrevBtn.click();
    if (e.key === "ArrowRight") vfNextBtn.click();
  });

  // ─── FILTER & SEARCH HANDLERS ───────────────────────────────────────────
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeFilter = pill.dataset.filter;
      renderGallery();
    });
  });

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderGallery();
  });


  // INITIALIZE ON LOAD
  document.addEventListener("DOMContentLoaded", renderGallery);

})();
