/**
 * SYNORA PITSTOP 01 — TELEMETRY TRACK REVELATION CONTROLLER
 * Automatically unlocks on September 17, 2026 at 4:00 PM IST (16:00:00).
 * Challenge Tracks: Ai&ML, CyberSec, Full-Stack/Web-dev, Web3/Blockchain
 */

(function () {
  "use strict";

  // Target reveal date: September 17, 2026 at 4:00 PM IST (UTC+05:30)
  const REVEAL_TIMESTAMP = new Date("2026-09-17T16:00:00+05:30").getTime();

  // Official Track Details for the 4 Domains
  const TRACK_DETAILS = {
    "01": {
      name: "Ai&ML",
      category: "INTELLIGENCE",
      tagline: "Generative AI, neural architectures, computer vision & autonomous agents",
      mission: "Engineer state-of-the-art machine learning models, autonomous LLM agents, or computer vision pipelines that solve high-impact institutional, civic, or industrial challenges with real-time inference.",
      scenarios: [
        "Campus AI Knowledge Oracle: Context-aware RAG system indexing university curricula, research publications, and administrative policies with verifiable citations.",
        "Autonomous Vision & Safety Telemetry: Edge-deployable real-time action and anomaly detection system with automated on-device privacy masking.",
        "Predictive Resource Allocation & Analytics: Multi-parameter deep learning pipeline forecasting student learning trajectories or dynamic campus facility loads."
      ],
      stacks: ["PyTorch", "HuggingFace Transformers", "LangChain / LlamaIndex", "FastAPI", "OpenCV / ONNX"],
      actionUrl: "https://forms.easebuzz.in/register/SRMAPIA9oJ/synora-registration"
    },
    "02": {
      name: "CyberSec",
      category: "SECURITY",
      tagline: "Threat intelligence, vulnerability scanning, cryptographic defense & zero-trust protocols",
      mission: "Architect offensive and defensive security tools, zero-trust access frameworks, or automated threat detection platforms safeguarding digital infrastructure against modern exploits.",
      scenarios: [
        "Zero-Trust Identity & Session Fortress: Cryptographically secure authentication gateway with anomaly-driven adaptive MFA and instant token revocation.",
        "Automated DevSecOps Vulnerability Scanner: Real-time static and dynamic code auditing tool detecting secret leaks, injection flaws, and dependency vulnerabilities in CI/CD.",
        "Decentralized HoneyNet & Intrusion Telemetry: Distributed decoy network capturing real-world malicious traffic patterns and generating instant incident mitigation scripts."
      ],
      stacks: ["Python / Go", "Rust", "Wireshark / Scapy", "Snort / Suricata", "OAuth2 / OIDC", "Cryptography (libsodium)"],
      actionUrl: "https://forms.easebuzz.in/register/SRMAPIA9oJ/synora-registration"
    },
    "03": {
      name: "Full-Stack/Web-dev",
      category: "SOFTWARE",
      tagline: "High-concurrency web platforms, real-time collaboration engines & scalable developer systems",
      mission: "Build production-grade, highly responsive web architectures and real-time distributed platforms that solve everyday campus or consumer challenges with superior UI/UX and resilient backends.",
      scenarios: [
        "All-in-One Campus Ecosystem Portal: Unified real-time dashboard integrating student pass approvals, digital mess queuing, peer-to-peer equipment sharing, and verified lost-and-found.",
        "Real-Time Collaborative Builder Canvas: Ultra-low-latency shared workspace supporting collaborative code execution, whiteboard brainstorming, and live audio/video telemetry.",
        "Disaster Relief & Resource Dispatch System: High-availability progressive web app (PWA) operating under low-bandwidth conditions to coordinate emergency supply logistics."
      ],
      stacks: ["Next.js / React", "Node.js / Express", "FastAPI / Python", "PostgreSQL / Supabase", "WebSockets / Redis", "TailwindCSS"],
      actionUrl: "https://forms.easebuzz.in/register/SRMAPIA9oJ/synora-registration"
    },
    "04": {
      name: "Web3/Blockchain",
      category: "WEB3",
      tagline: "Verifiable credentials, smart contract protocols, zero-knowledge proofs & decentralized dApps",
      mission: "Design trustless decentralized applications, smart contract protocols, or cryptographic verification systems that establish immutable transparency and decentralized ownership.",
      scenarios: [
        "Tamper-Proof Academic Credential Protocol: Verifiable degree, certificate, and achievement issuance ledger utilizing Soulbound Tokens (SBT) and on-chain cryptographic proofs.",
        "Transparent Campus Governance & Quadratic Voting: Sybil-resistant on-chain voting architecture for student council decisions, club budgets, and democratic governance.",
        "Zero-Knowledge Identity Verification Gateway: ZK-SNARK authentication allowing users to prove identity, age, or enrollment without disclosing sensitive personal metadata."
      ],
      stacks: ["Solidity", "Hardhat / Foundry", "Ethers.js / Viem", "Polygon / Arbitrum", "IPFS / Arweave", "ZK-SNARKs (Circom)"],
      actionUrl: "https://forms.easebuzz.in/register/SRMAPIA9oJ/synora-registration"
    }
  };

  let countdownTimer = null;
  let scrambleInterval = null;

  // Determine current revelation status
  function getIsRevealed() {
    // Secret admin preview query param if organizers need to test privately
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("synora_admin_preview") === "true") return true;

    // Strict automatic reveal based on target timestamp: 17 Sep 2026 at 4:00 PM IST
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
              Official challenge directives, problem statements, and domain briefs are locked under Race Control encryption. Full telemetry stream unlocks automatically at 04:00 PM on September 17, 2026.
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
              AUTO-REVEAL: 17 SEPTEMBER 2026 // 04:00 PM IST
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
              Sectors 01–04 are decrypted. Select any domain below to inspect official mission directives, suggested problem scenarios, recommended tech stacks, and team submission actions.
            </p>
          </div>
          <div class="hud-clock-stage">
            <div class="hud-clock-label">
              <span style="color: #00e676;">STATUS: ACTIVE SPRINT</span>
              <span style="color: #00e676;">● IN PROGRESS</span>
            </div>
            <div class="hud-clock-digits" style="font-size: 20px; color: #00e676;">
              TRACK DIRECTIVES UNLOCKED
            </div>
            <div class="hud-clock-target">
              ALL 4 LANES OPEN FOR SUBMISSION
            </div>
          </div>
        </div>
      `;
    }

    return hud;
  }

  // Create problem statement drawer element
  function createProblemDrawer(trackId) {
    const data = TRACK_DETAILS[trackId];
    if (!data) return null;

    const drawer = document.createElement("div");
    drawer.className = "problem-statement-drawer";
    drawer.id = `drawer-${trackId}`;

    const scenariosHtml = data.scenarios
      .map((sc) => `<li><span>${sc}</span></li>`)
      .join("");

    const stacksHtml = data.stacks
      .map((st) => `<span class="tech-chip">${st}</span>`)
      .join("");

    drawer.innerHTML = `
      <div class="drawer-header-strip">
        <div class="drawer-kicker">
          <span class="drawer-lane-tag">LANE [${trackId}] // SPECIFICATION DOSSIER</span>
          <span>/</span>
          <span>${data.category}</span>
        </div>
        <span class="drawer-status-chip">● ACTIVE CHALLENGE</span>
      </div>

      <div class="drawer-mission-box">
        <h4 class="drawer-mission-heading">${data.tagline}</h4>
        <p class="drawer-mission-desc">${data.mission}</p>
      </div>

      <div class="drawer-scenarios-box">
        <div class="scenarios-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>SUGGESTED PROBLEM SCENARIOS &amp; CHALLENGE SCOPES</span>
        </div>
        <ul class="scenarios-list">
          ${scenariosHtml}
        </ul>
      </div>

      <div class="drawer-footer-strip">
        <div class="tech-stack-row">
          <span class="tech-stack-label">RECOMMENDED STACKS:</span>
          ${stacksHtml}
        </div>
        <a href="${data.actionUrl}" target="_blank" rel="noopener noreferrer" class="drawer-action-link">
          <span>SELECT THIS LANE</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    `;

    return drawer;
  }

  // Update countdown display every second
  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
      const cd = getCountdownData();
      const elDays = document.getElementById("cdDays");
      const elHours = document.getElementById("cdHours");
      const elMins = document.getElementById("cdMins");
      const elSecs = document.getElementById("cdSecs");

      if (elDays) elDays.textContent = cd.days;
      if (elHours) elHours.textContent = cd.hours;
      if (elMins) elMins.textContent = cd.minutes;
      if (elSecs) elSecs.textContent = cd.seconds;

      // When the clock hits 17th Sep 4:00 PM, trigger unlock automatically
      if (cd.isExpired && !getIsRevealed()) {
        initRevelationSystem();
      }
    }, 1000);
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
    if (countdownTimer) clearInterval(countdownTimer);
    if (scrambleInterval) clearInterval(scrambleInterval);

    // Remove any opened drawers
    document.querySelectorAll(".problem-statement-drawer").forEach((d) => d.remove());

    // 3. Process track rows (ensuring only 01, 02, 03, 04 are shown)
    const allRows = Array.from(trackList.querySelectorAll(".track-row"));
    const activeRows = [];

    allRows.forEach((row, idx) => {
      const trackId = String(idx + 1).padStart(2, "0");
      const trackData = TRACK_DETAILS[trackId];

      if (!trackData) {
        // Hide any rows beyond 04
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

      if (!isRevealed) {
        // Locked State
        row.classList.remove("is-revealed", "active-drawer");
        row.classList.add("is-locked");
        row.onclick = null;

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
        // Revealed State
        row.classList.remove("is-locked");
        row.classList.add("is-revealed");

        if (h3) {
          h3.textContent = trackData.name;
          h3.removeAttribute("style");
        }

        if (categorySpan) {
          categorySpan.textContent = trackData.category;
        }

        if (flagSpan) {
          flagSpan.innerHTML = `
            <div class="track-expand-btn" aria-label="Toggle Details">
              <span>+</span>
            </div>
          `;
        }

        row.setAttribute("title", `Click to view official problem statement for ${trackData.name}`);

        row.onclick = (e) => {
          if (e.target.closest("a")) return;

          const isAlreadyOpen = row.classList.contains("active-drawer");

          document.querySelectorAll(".problem-statement-drawer").forEach((d) => d.remove());
          activeRows.forEach((r) => r.classList.remove("active-drawer"));

          if (!isAlreadyOpen) {
            row.classList.add("active-drawer");
            const drawer = createProblemDrawer(trackId);
            if (drawer) {
              row.after(drawer);
            }
          }
        };
      }
    });

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
