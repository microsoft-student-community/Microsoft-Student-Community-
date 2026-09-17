/**
 * SYNORA PITSTOP 01 — TELEMETRY TRACK REVELATION CONTROLLER
 * Automatically unlocks on September 17, 2026 at 5:00 PM IST (17:00:00).
 * Challenge Tracks: Ai&ML, CyberSec, Full-Stack/Web-dev, Web3/Blockchain
 */

(function () {
  "use strict";

  // ===========================================================================
  // TARGET REVEAL TIMESTAMP CONFIGURATION
  // ===========================================================================
  // Official Production Date: September 17, 2026 at 5:00 PM IST (UTC+05:30)
  // const PROD_REVEAL_TIMESTAMP = new Date("2026-09-17T17:00:00+05:30").getTime();
  const PROD_REVEAL_TIMESTAMP = new Date("2026-09-17T17:00:00+05:30").getTime();

  // Test Simulation Mode: 2 Minutes Duration
  const TEST_MODE_DURATION_MS = 2 * 60 * 1000;
  const TEST_STORAGE_KEY = "synora_test_target_timestamp";

  function resolveRevealTimestamp() {
    const urlParams = new URLSearchParams(window.location.search);

    // Only activate 2-minute test simulation if explicitly requested via ?test_2min=true
    if (urlParams.get("test_2min") === "true") {
      const saved = sessionStorage.getItem(TEST_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed > Date.now()) {
          return parsed;
        }
      }
      const fresh = Date.now() + TEST_MODE_DURATION_MS;
      sessionStorage.setItem(TEST_STORAGE_KEY, String(fresh));
      return fresh;
    }

    // Always clear test storage in normal production mode
    try {
      sessionStorage.removeItem(TEST_STORAGE_KEY);
    } catch (_) {}

    // Real official event countdown: September 17, 2026 at 5:00 PM IST
    return PROD_REVEAL_TIMESTAMP;
  }

  let REVEAL_TIMESTAMP = resolveRevealTimestamp();

  // Helper for developers/organizers to test if needed
  window.restartSynoraTestTimer = function () {
    const fresh = Date.now() + TEST_MODE_DURATION_MS;
    sessionStorage.setItem(TEST_STORAGE_KEY, String(fresh));
    REVEAL_TIMESTAMP = fresh;
    initRevelationSystem();
  };

  // Official Problem Statement Domains (Five Tracks)
  const TRACK_DETAILS = {
    "01": { name: "Ai&ML", category: "INTELLIGENCE" },
    "02": { name: "CyberSec", category: "SECURITY" },
    "03": { name: "Full-Stack/Web-dev", category: "SOFTWARE" },
    "04": { name: "Web3/Blockchain", category: "WEB3" },
    "05": { name: "Internet of Things (IoT)", category: "HARDWARE" }
  };

  let countdownTimer = null;
  let scrambleInterval = null;

  // Determine current revelation status
  function getIsRevealed() {
    // Secret admin preview query param if organizers need to test privately
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("synora_admin_preview") === "true") return true;

    // Strict automatic reveal based on target timestamp: 17 Sep 2026 at 5:00 PM IST
    return Date.now() >= REVEAL_TIMESTAMP;
  }

  // Format countdown data
  function getCountdownData() {
    const now = Date.now();
    const diff = Math.max(0, REVEAL_TIMESTAMP - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      isExpired: diff <= 0
    };
  }

  // Build Telemetry HUD element (No public simulation button)
  function createHudElement(isRevealed) {
    const existing = document.getElementById("trackRevelationHud");
    if (existing) existing.remove();

    const hud = document.createElement("div");
    hud.id = "trackRevelationHud";
    hud.className = `track-revelation-hud ${isRevealed ? "revealed" : "locked"}`;

    const cd = getCountdownData();

    if (!isRevealed) {
      hud.innerHTML = `
        <div class="hud-scanline"></div>
        <div class="hud-top-bar">
          <div class="hud-protocol-tag">
            <span class="hud-pulse-dot"></span>
            <span>RACE CONTROL // PROTOCOL 17-SEP</span>
          </div>
          <div>
            <span class="hud-status-badge">TELEMETRY CLASSIFIED</span>
          </div>
        </div>
        <div class="hud-grid-body">
          <div class="hud-narrative-box">
            <h3 class="hud-main-title">TRACKS &amp; PROBLEM STATEMENTS <em>ENCRYPTED</em></h3>
            <p class="hud-subtext">
              Official challenge directives, problem statements, and domain briefs are locked under Race Control encryption. Full telemetry stream unlocks automatically at 05:00 PM on September 17, 2026.
            </p>
          </div>
          <div class="hud-clock-stage">
            <div class="hud-clock-label">
              <span>T-MINUS COUNTDOWN</span>
              <span style="color: #ef6b5d;">GRID LOCKDOWN</span>
            </div>
            <div class="hud-clock-digits">
              <div class="clock-segment"><span class="clock-num" id="cdDays">${cd.days}</span><span class="clock-sub">DAYS</span></div>
              <span class="clock-sep">:</span>
              <div class="clock-segment"><span class="clock-num" id="cdHours">${cd.hours}</span><span class="clock-sub">HRS</span></div>
              <span class="clock-sep">:</span>
              <div class="clock-segment"><span class="clock-num" id="cdMins">${cd.minutes}</span><span class="clock-sub">MIN</span></div>
              <span class="clock-sep">:</span>
              <div class="clock-segment"><span class="clock-num" id="cdSecs">${cd.seconds}</span><span class="clock-sub">SEC</span></div>
            </div>
            <div class="hud-clock-target">
              AUTO-REVEAL: 17 SEPTEMBER 2026 // 05:00 PM IST
            </div>
          </div>
        </div>
      `;
    } else {
      hud.innerHTML = `
        <div class="hud-scanline"></div>
        <div class="hud-top-bar">
          <div class="hud-protocol-tag">
            <span class="hud-pulse-dot"></span>
            <span style="color: #00e676;">GREEN FLAG // RACE CONTROL: TELEMETRY UNLOCKED</span>
          </div>
          <div>
            <span class="hud-status-badge">GRID TRANSMITTING</span>
          </div>
        </div>
        <div class="hud-grid-body">
          <div class="hud-narrative-box">
            <h3 class="hud-main-title">OFFICIAL TRACKS &amp; <em>PROBLEM STATEMENTS LIVE</em></h3>
            <p class="hud-subtext">
              Sectors 01–05 are decrypted. The five official problem statement domains are now live on the grid.
            </p>
          </div>
          <div class="hud-clock-stage">
            <div class="hud-clock-label">
              <span style="color: #00e676;">STATUS: ACTIVE SPRINT</span>
              <span style="color: #00e676;">● IN PROGRESS</span>
            </div>
            <div class="hud-clock-digits" style="font-size: 20px; color: #00e676;">
              TRACKS UNLOCKED
            </div>
            <div class="hud-clock-target">
              ALL 5 DOMAINS LIVE
            </div>
          </div>
        </div>
      `;
    }

    return hud;
  }

  const FLAG_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`;

  // Show race control locked telemetry notification
  function showLockedPsAlert() {
    let toast = document.getElementById("f1LockedToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "f1LockedToast";
      toast.className = "f1-locked-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="f1-toast-inner">
        <span class="f1-toast-icon">⚠️</span>
        <div>
          <strong>ACCESS RESTRICTED // DOSSIER SEALED</strong>
          <p>Official Problem Statements PDF remains classified until the countdown reaches 00:00:00 (17 Sep 5:00 PM IST).</p>
        </div>
      </div>
    `;

    toast.classList.add("visible");
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("visible");
    }, 3800);

    const btn = document.getElementById("f1PsCarButton");
    if (btn) {
      btn.classList.add("f1-shake");
      setTimeout(() => btn.classList.remove("f1-shake"), 500);
    }
  }

  // Render SVG for F1 Car monocoque
  function renderF1CarSvg(isRevealed) {
    const rainColor = isRevealed ? "#ff1801" : "#ff5252";
    return `
      <svg viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="f1-car-svg">
        <defs>
          <linearGradient id="f1ChassisGrad" x1="0" y1="0" x2="500" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${isRevealed ? '#1e211f' : '#1a1616'}" />
            <stop offset="45%" stop-color="${isRevealed ? '#121413' : '#110e0e'}" />
            <stop offset="100%" stop-color="#0a0c0b" />
          </linearGradient>
          <linearGradient id="f1StripeGrad" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${isRevealed ? '#ff1801' : '#b71c1c'}" />
            <stop offset="100%" stop-color="${isRevealed ? '#ff5722' : '#e53935'}" />
          </linearGradient>
          <radialGradient id="f1TireGrad" cx="50%" cy="50%" r="50%">
            <stop offset="65%" stop-color="#191b1a" />
            <stop offset="100%" stop-color="#0a0c0b" />
          </radialGradient>
          <filter id="f1RainGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Speed Streaks -->
        <line x1="10" y1="28" x2="120" y2="28" stroke="rgba(255,255,255,0.12)" stroke-dasharray="8 14" stroke-width="1.5" />
        <line x1="30" y1="80" x2="160" y2="80" stroke="${isRevealed ? 'rgba(255,24,1,0.3)' : 'rgba(180,30,20,0.2)'}" stroke-dasharray="12 18" stroke-width="1.5" />
        <line x1="15" y1="132" x2="135" y2="132" stroke="rgba(255,255,255,0.12)" stroke-dasharray="6 12" stroke-width="1.5" />

        <!-- Rear Left Tire -->
        <rect x="70" y="10" width="65" height="32" rx="5" fill="url(#f1TireGrad)" stroke="#363c38" stroke-width="1.5" />
        <rect x="72" y="24" width="61" height="4" fill="${rainColor}" opacity="0.9" />
        <!-- Rear Right Tire -->
        <rect x="70" y="118" width="65" height="32" rx="5" fill="url(#f1TireGrad)" stroke="#363c38" stroke-width="1.5" />
        <rect x="72" y="132" width="61" height="4" fill="${rainColor}" opacity="0.9" />

        <!-- Front Left Tire -->
        <rect x="385" y="16" width="58" height="26" rx="4" fill="url(#f1TireGrad)" stroke="#363c38" stroke-width="1.5" />
        <rect x="387" y="28" width="54" height="3.5" fill="${rainColor}" opacity="0.9" />
        <!-- Front Right Tire -->
        <rect x="385" y="118" width="58" height="26" rx="4" fill="url(#f1TireGrad)" stroke="#363c38" stroke-width="1.5" />
        <rect x="387" y="128.5" width="54" height="3.5" fill="${rainColor}" opacity="0.9" />

        <!-- Suspension Wishbones (Rear) -->
        <line x1="102" y1="42" x2="150" y2="64" stroke="#4b534d" stroke-width="2.5" stroke-linecap="round" />
        <line x1="102" y1="42" x2="175" y2="66" stroke="#333834" stroke-width="1.5" />
        <line x1="102" y1="118" x2="150" y2="96" stroke="#4b534d" stroke-width="2.5" stroke-linecap="round" />
        <line x1="102" y1="118" x2="175" y2="94" stroke="#333834" stroke-width="1.5" />

        <!-- Suspension Wishbones (Front) -->
        <line x1="414" y1="42" x2="360" y2="68" stroke="#4b534d" stroke-width="2.5" stroke-linecap="round" />
        <line x1="414" y1="42" x2="330" y2="72" stroke="#333834" stroke-width="1.5" />
        <line x1="414" y1="118" x2="360" y2="92" stroke="#4b534d" stroke-width="2.5" stroke-linecap="round" />
        <line x1="414" y1="118" x2="330" y2="88" stroke="#333834" stroke-width="1.5" />

        <!-- REAR WING ASSEMBLY -->
        <rect x="32" y="32" width="16" height="96" rx="2" fill="#171918" stroke="${rainColor}" stroke-width="1.5" />
        <rect x="26" y="28" width="10" height="104" rx="2" fill="#242825" stroke="#3c423d" stroke-width="1" />
        <line x1="32" y1="80" x2="80" y2="80" stroke="${rainColor}" stroke-width="3" />
        <!-- F1 Rain Light -->
        <rect class="f1-rain-led" x="18" y="74" width="12" height="12" rx="2" fill="${rainColor}" filter="url(#f1RainGlow)" />

        <!-- MAIN CHASSIS MONOCOQUE -->
        <path d="
          M 80 68
          L 140 56
          Q 200 46 265 48
          Q 320 50 360 64
          L 460 76
          Q 485 80 488 80
          Q 485 80 460 84
          L 360 96
          Q 320 110 265 112
          Q 200 114 140 104
          L 80 92
          Z
        " fill="url(#f1ChassisGrad)" stroke="#414842" stroke-width="1.5" />

        <!-- Center Racing Livery Stripe -->
        <path d="
          M 85 79
          L 340 79
          L 482 80
          L 340 81
          L 85 81
          Z
        " fill="url(#f1StripeGrad)" />

        <!-- Sidepod Air Intakes -->
        <path d="M 190 56 L 225 54 L 225 64 L 190 62 Z" fill="#0a0c0b" stroke="${rainColor}" stroke-width="1" />
        <path d="M 190 104 L 225 106 L 225 96 L 190 98 Z" fill="#0a0c0b" stroke="${rainColor}" stroke-width="1" />

        <!-- FRONT WING -->
        <path d="
          M 460 26
          L 476 30
          Q 498 75 498 80
          Q 498 85 476 130
          L 460 134
          Q 484 85 484 80
          Z
        " fill="#1b1e1c" stroke="${rainColor}" stroke-width="1.5" />
        <rect x="456" y="22" width="10" height="22" rx="1.5" fill="${rainColor}" />
        <rect x="456" y="116" width="10" height="22" rx="1.5" fill="${rainColor}" />

        <!-- HALO & COCKPIT -->
        <ellipse cx="290" cy="80" rx="28" ry="14" fill="#080a09" stroke="#5d665f" stroke-width="1.5" />
        <path d="M 314 80 L 275 74 Q 262 80 275 86 Z" fill="${rainColor}" opacity="0.9" />
        <circle cx="272" cy="80" r="7.5" fill="#f5f4f1" stroke="${rainColor}" stroke-width="1.2" />

        <!-- Engine Airbox -->
        <ellipse cx="235" cy="80" rx="10" ry="5" fill="#050606" stroke="#4b534d" stroke-width="1" />

        <!-- Number Badge -->
        <circle cx="435" cy="80" r="8" fill="${rainColor}" />
        <text x="435" y="83.5" font-family="sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">01</text>
      </svg>
    `;
  }

  // Create F1 Car-styled Problem Statement dossier launcher button
  function createF1CarButton(isRevealed) {
    const container = document.createElement("div");
    container.id = "f1PsCarButtonContainer";
    container.className = `f1-ps-container ${isRevealed ? "revealed" : "locked"}`;

    const pdfUrl = "/custom-events/synora-pitstop-01/SYNORA-Problem-Statement.pdf";

    if (isRevealed) {
      // REVEALED STATE: Full active button linking to PDF
      container.innerHTML = `
        <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="f1-car-launch-button is-unlocked just-unlocked" id="f1PsCarButton" title="Launch official SYNORA Problem Statements Dossier (PDF)">
          <div class="f1-ground-effect" aria-hidden="true"></div>
          <div class="f1-car-inner">
            <div class="f1-car-copy">
              <div class="f1-kicker-row">
                <span class="f1-pulse-light live"></span>
                <span class="f1-kicker-text">RACE CONTROL // OFFICIAL DIRECTIVE</span>
                <span class="f1-drs-tag open">DRS OPEN</span>
              </div>
              <div class="f1-main-heading">
                <span>ACCESS PROBLEM STATEMENTS</span>
                <span class="f1-arrow-icon">➔</span>
              </div>
              <div class="f1-sub-row">
                <span class="f1-file-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>SYNORA PROBLEM STATEMENT.PDF</span>
                </span>
                <span class="f1-hint-text">Official challenge dossiers &amp; submission brief</span>
              </div>
            </div>

            <div class="f1-car-silhouette-wrapper" aria-hidden="true">
              ${renderF1CarSvg(true)}
            </div>
          </div>
        </a>
      `;
    } else {
      // LOCKED STATE: Zero PDF access. Completely sealed until timer hits 0.
      container.innerHTML = `
        <div class="f1-car-launch-button is-locked" id="f1PsCarButton" role="button" aria-disabled="true" tabindex="0" title="Locked: Problem Statements sealed until countdown reaches 00:00:00">
          <div class="f1-car-inner">
            <div class="f1-car-copy">
              <div class="f1-kicker-row">
                <span class="f1-pulse-light locked"></span>
                <span class="f1-kicker-text">RACE CONTROL // PIT LANE CLOSED</span>
                <span class="f1-drs-tag locked">🔒 DRS LOCKED</span>
              </div>
              <div class="f1-main-heading locked-heading">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff5252" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>PROBLEM STATEMENTS LOCKED</span>
              </div>
              <div class="f1-sub-row">
                <span class="f1-file-pill locked-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>CLASSIFIED DOSSIER</span>
                </span>
                <span class="f1-hint-text locked-hint">Unlocks automatically when countdown reaches 00:00:00</span>
              </div>
            </div>

            <div class="f1-car-silhouette-wrapper" aria-hidden="true">
              ${renderF1CarSvg(false)}
            </div>
          </div>
        </div>
      `;

      const lockedBtn = container.querySelector("#f1PsCarButton");
      if (lockedBtn) {
        lockedBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          showLockedPsAlert();
        });
        lockedBtn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            showLockedPsAlert();
          }
        });
      }
    }

    return container;
  }

  // Update countdown display every second
  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);

    // Run first update immediately
    updateCountdownTick();

    countdownTimer = setInterval(updateCountdownTick, 1000);
  }

  function updateCountdownTick() {
    const cd = getCountdownData();
    const elDays = document.getElementById("cdDays");
    const elHours = document.getElementById("cdHours");
    const elMins = document.getElementById("cdMins");
    const elSecs = document.getElementById("cdSecs");

    if (elDays) elDays.textContent = cd.days;
    if (elHours) elHours.textContent = cd.hours;
    if (elMins) elMins.textContent = cd.minutes;
    if (elSecs) elSecs.textContent = cd.seconds;

    // When the countdown reaches 00:00:00, trigger live unlock
    if (cd.isExpired) {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      if (scrambleInterval) {
        clearInterval(scrambleInterval);
        scrambleInterval = null;
      }

      // Re-initialize system in revealed state
      initRevelationSystem();
    }
  }

  // Scramble animation for locked track rows
  const SCRAMBLE_CHARS = "01_#$*!?/<>[]XYZABC";
  function startScrambleEffect(rows) {
    if (scrambleInterval) clearInterval(scrambleInterval);

    scrambleInterval = setInterval(() => {
      rows.forEach((row) => {
        const h3 = row.querySelector("h3");
        if (!h3 || !row.classList.contains("is-locked")) return;
        const trackId = row.querySelector(".track-number")?.textContent?.trim() || "01";

        const char1 = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        const char2 = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        const randomHex = Math.floor(Math.random() * 0xfff).toString(16).toUpperCase().padStart(3, "0");

        h3.innerHTML = `
          <span class="scramble-code">[SECTOR ${trackId} // 0x${randomHex}]</span>
          <span style="font-size: 11px; opacity: 0.6; letter-spacing: 1px;">// CLASSIFIED ${char1}${char2}</span>
        `;
      });
    }, 300);
  }

  // Primary initialization function
  function initRevelationSystem() {
    const tracksSection = document.getElementById("tracks");
    if (!tracksSection) return;

    const trackList = tracksSection.querySelector(".track-list");
    if (!trackList) return;

    const isRevealed = getIsRevealed();

    // 1. Insert HUD element
    const hud = createHudElement(isRevealed);
    const tracksRoute = tracksSection.querySelector(".tracks-route");
    if (tracksRoute) {
      tracksRoute.after(hud);
    } else {
      trackList.before(hud);
    }

    // 2. Clear intervals
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (scrambleInterval) {
      clearInterval(scrambleInterval);
      scrambleInterval = null;
    }

    // Remove any opened drawers if present
    document.querySelectorAll(".problem-statement-drawer").forEach((d) => d.remove());

    // 3. Process track rows (ensuring tracks 01 through 05 are supported)
    let allRows = Array.from(trackList.querySelectorAll(".track-row"));
    if (TRACK_DETAILS["05"] && allRows.length === 4) {
      const cloned = allRows[3].cloneNode(true);
      trackList.appendChild(cloned);
      allRows.push(cloned);
    }
    const activeRows = [];

    allRows.forEach((row, idx) => {
      const trackId = String(idx + 1).padStart(2, "0");
      const trackData = TRACK_DETAILS[trackId];

      if (!trackData) {
        // Hide any rows beyond 05
        row.style.display = "none";
        return;
      }

      row.style.display = "";
      activeRows.push(row);

      const numSpan = row.querySelector(".track-number");
      if (numSpan) numSpan.textContent = trackId;

      const h3 = row.querySelector("h3");
      const categorySpan = row.querySelector(".track-category");
      let flagSpan = row.querySelector(".track-flag");

      row.onclick = null;
      row.removeAttribute("title");

      if (!isRevealed) {
        // Locked State
        row.classList.remove("is-revealed", "active-drawer", "just-unlocked");
        row.classList.add("is-locked");

        if (categorySpan) {
          categorySpan.innerHTML = `
            <span class="locked-indicator-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>LOCKED</span>
            </span>
          `;
        }

        row.setAttribute("title", "Problem statement classified until September 17, 2026 at 4:00 PM IST.");
      } else {
        // Revealed State: Clean four titles only
        row.classList.remove("is-locked", "active-drawer");
        row.classList.add("is-revealed", "just-unlocked");

        if (h3) {
          h3.textContent = trackData.name;
          h3.removeAttribute("style");
        }

        if (categorySpan) {
          categorySpan.textContent = trackData.category;
        }

        if (flagSpan) {
          flagSpan.innerHTML = FLAG_ICON_SVG;
        }
      }
    });

    // 4. Mount F1 Car Problem Statement Dossier button directly above .track-perks
    // Strictly ONLY shown once the countdown timer reaches 00:00:00 (isRevealed === true)
    const existingF1Btn = document.getElementById("f1PsCarButtonContainer");
    if (existingF1Btn) existingF1Btn.remove();

    if (isRevealed) {
      const f1Btn = createF1CarButton(true);
      const trackPerks = tracksSection.querySelector(".track-perks");
      if (trackPerks) {
        trackPerks.before(f1Btn);
      } else {
        trackList.after(f1Btn);
      }
    }

    if (!isRevealed) {
      startCountdown();
      startScrambleEffect(activeRows);
    }
  }

  // Observer to wait for React to mount #tracks
  function waitForTracksSection() {
    const check = document.getElementById("tracks");
    if (check && check.querySelector(".track-list")) {
      initRevelationSystem();
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const el = document.getElementById("tracks");
      if (el && el.querySelector(".track-list")) {
        obs.disconnect();
        initRevelationSystem();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForTracksSection);
  } else {
    waitForTracksSection();
  }
})();
