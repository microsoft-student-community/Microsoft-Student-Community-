"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface TicketProps {
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventType?: string;
  posterUrl?: string;
  name?: string;
  email?: string;
  registrationId?: string;
  collegeName?: string;
  qrCodeUrl?: string;
  teamName?: string;
  teamMembers?: number;
  registrationType?: string;

  // Composite object props (for backward compatibility)
  event?: any;
  registration?: any;
  hashPayload?: string;
  qrUrl?: string;
}

export const TicketTemplate = forwardRef<HTMLDivElement, TicketProps>((props, ref) => {
  const eventTitle = props.eventTitle || props.event?.title || "SYNORA Pitstop 01";
  const eventDate = props.eventDate || (props.event?.date_start
    ? new Date(props.event.date_start).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "Thu, 17 Sept, 2026");
  const eventTime = props.eventTime || (props.event?.date_start
    ? new Date(props.event.date_start).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "05:30 AM IST");
  const eventVenue = props.eventVenue || props.event?.location || "SRM University-AP";
  const eventType = props.eventType || props.event?.type || "18H Endurance Hackathon";
  const posterUrl = props.posterUrl || props.event?.image_url || props.event?.banner_url || "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/hackmsc1.jpg";

  const formData = props.registration?.form_data || {};
  const teamData = props.registration?.team_data;

  const name = props.name || formData.fullName || formData.name || "Lead Pilot";
  const email = props.email || formData.email || "msc.community@srmap.edu.in";
  const rawId = props.registrationId || props.hashPayload || props.registration?.id || "PITSTOP01";
  const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase();
  const registrationId = `MSC-PIT-${cleanId || "7X9A2F"}`;
  const collegeName = props.collegeName || formData.collegeName || "SRM University-AP";
  const qrCodeUrl = props.qrCodeUrl || props.qrUrl || props.hashPayload || `https://mscsrmap.xyz/admin/checkin/${rawId}`;
  
  const teamName = props.teamName || teamData?.team_name || teamData?.teamName;
  const rawMemberCount = props.teamMembers ?? (teamData?.members ? teamData.members.length + 1 : undefined);
  const teamMembers = rawMemberCount && rawMemberCount > 0 ? rawMemberCount : (teamName ? 1 : undefined);
  const isTeam = Boolean(teamName);
  const registrationType = props.registrationType || (isTeam ? "Team Entry" : "Individual Entry");

  // Telemetry pit bay slot based on ID
  const pitBayNumber = cleanId.length >= 2 ? cleanId.substring(0, 2) : "01";

  return (
    <div
      ref={ref}
      style={{
        width: "420px",
        maxWidth: "100%",
        backgroundColor: "#080A0F",
        padding: "16px 12px",
        fontFamily: "'JetBrains Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
        color: "#F8FAFC",
      }}
    >
      {/* Outer Credential Pass Card */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#0E1118",
          backgroundImage: `
            radial-gradient(circle at 100% 0%, rgba(225, 6, 0, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(0, 230, 118, 0.06) 0%, transparent 35%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 20px 20px, 20px 20px",
          borderRadius: "22px",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          overflow: "hidden",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Top Mechanical Lanyard Slot (Authentic Physical Pass Cutout) */}
        <div style={{ padding: "14px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#E10600", boxShadow: "0 0 8px #E10600" }}></span>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "#E10600", textTransform: "uppercase" }}>
              SYNORA // PITSTOP 01
            </span>
          </div>

          {/* Lanyard punch hole with metallic ring */}
          <div
            style={{
              width: "42px",
              height: "7px",
              backgroundColor: "#050608",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9)",
            }}
            title="Lanyard Clip Opening"
          />

          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "#94A3B8" }}>
            ROUND 01 <span style={{ color: "#E10600" }}>•</span> 2026
          </div>
        </div>

        {/* FIA Track Kerbing Micro-Stripe (Racing Red & White) */}
        <div
          style={{
            height: "4px",
            width: "100%",
            backgroundImage: "repeating-linear-gradient(135deg, #E10600 0px, #E10600 12px, #FFFFFF 12px, #FFFFFF 24px)",
            opacity: 0.9,
          }}
        />

        {/* Event Identity Header */}
        <div style={{ padding: "18px 20px 14px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          {/* Poster Frame */}
          <div
            style={{
              width: "84px",
              height: "112px",
              borderRadius: "12px",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "#171B24",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 18px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            <img
              src={posterUrl}
              alt="SYNORA Poster"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              crossOrigin="anonymous"
              onError={(e) => {
                // Fallback display if poster fails
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {/* Speed Slash accent on poster */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "#E10600",
              }}
            />
          </div>

          {/* Event Specs & Title */}
          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  backgroundColor: "rgba(225, 6, 0, 0.16)",
                  color: "#FF3326",
                  border: "1px solid rgba(225, 6, 0, 0.35)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                18H ENDURANCE
              </span>
              <span style={{ fontSize: "9px", color: "#64748B", fontWeight: 600 }}>OFFICIAL GRID</span>
            </div>

            <h1
              style={{
                margin: "0 0 2px 0",
                fontSize: "26px",
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
                lineHeight: 1.05,
                fontFamily: "'Rajdhani', 'Chakra Petch', 'JetBrains Mono', sans-serif",
              }}
            >
              {eventTitle}
            </h1>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "1px",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              PITSTOP 01 <span style={{ color: "#E10600" }}>///</span> GRAND PRIX
            </div>

            {/* Circuit & Time readout */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", color: "#CBD5E1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#E10600", fontSize: "10px" }}>🏁</span>
                <span style={{ fontWeight: 600, color: "#F1F5F9" }}>{eventVenue}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#E10600", fontSize: "10px" }}>⏱</span>
                <span style={{ color: "#94A3B8" }}>{eventDate} • {eventTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Impact Credential Tier Ribbon */}
        <div
          style={{
            backgroundColor: "#E10600",
            color: "#FFFFFF",
            padding: "9px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
            boxShadow: "0 4px 12px rgba(225, 6, 0, 0.35)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 900,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                fontFamily: "'Rajdhani', 'Chakra Petch', sans-serif",
              }}
            >
              {isTeam ? "PIT CREW & CONSTRUCTOR PASS" : "PADDOCK CLUB // GENERAL ENTRY"}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "1px", opacity: 0.88, textTransform: "uppercase" }}>
              ALL PIT BAYS • DEV SECTORS • MAIN STAGE AUTHORIZED
            </div>
          </div>
          <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "-1px", opacity: 0.9 }}>
            &gt;&gt;&gt;
          </div>
        </div>

        {/* Pit Wall Telemetry Data Screen */}
        <div style={{ padding: "16px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1.5px", color: "#64748B", textTransform: "uppercase" }}>
              PIT TELEMETRY READOUT
            </span>
            <span
              style={{
                fontSize: "9px",
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor: "rgba(0, 230, 118, 0.12)",
                color: "#00E676",
                border: "1px solid rgba(0, 230, 118, 0.3)",
                padding: "2px 6px",
                borderRadius: "3px",
                fontWeight: 700,
              }}
            >
              ACTIVE // VERIFIED
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              backgroundColor: "rgba(10, 13, 19, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            {/* Team or Attendee */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                {isTeam ? "CONSTRUCTOR / TEAM" : "ATTENDEE"}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {teamName || name}
              </span>
            </div>

            {/* Lead Driver */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                {isTeam ? "LEAD DRIVER" : "ROLE"}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#F1F5F9",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </span>
            </div>

            {/* Entry Specification (Handles member count cleanly with no rogue 0) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                SPECIFICATION
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#E2E8F0" }}>
                {isTeam && teamMembers ? `${teamMembers} Crew Members` : registrationType}
              </span>
            </div>

            {/* Pit Bay Designation */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                PIT BAY / GRID
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#E10600",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                BAY #{pitBayNumber}
              </span>
            </div>

            {/* College / Academy (Spanning Full Width) */}
            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                ACADEMY // AFFILIATION
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8" }}>
                {collegeName}
              </span>
            </div>
          </div>

          {/* Team Members Roster (If Registered) */}
          {isTeam && teamData?.members && teamData.members.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                backgroundColor: "rgba(10, 13, 19, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  color: "#64748B",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>PIT CREW ROSTER ({teamData.members.length + 1} MEMBERS)</span>
                <span style={{ color: "#E10600" }}>RACE READY</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {/* Driver 1 (Leader) */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#F8FAFC" }}>
                  <span style={{ fontWeight: 700 }}>
                    <span style={{ color: "#E10600", marginRight: "6px" }}>P1</span> {name}
                  </span>
                  <span style={{ color: "#64748B", fontSize: "10px" }}>[CHIEF PILOT]</span>
                </div>
                {/* Crew Members */}
                {teamData.members.map((m: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#CBD5E1" }}>
                    <span>
                      <span style={{ color: "#94A3B8", marginRight: "6px" }}>P{idx + 2}</span>
                      {m.fullName || m.name || `Crew Member ${idx + 2}`}
                      {m.role === "Senior Student" ? " (Senior)" : ""}
                    </span>
                    <span style={{ color: "#64748B", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                      {m.regNum || (m.email ? m.email.split("@")[0] : `CREW-${idx + 2}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perforated Tear-off Verification Stub */}
        <div style={{ position: "relative", margin: "4px 0" }}>
          {/* Left Cutout Notch */}
          <div
            style={{
              position: "absolute",
              width: "24px",
              height: "24px",
              backgroundColor: "#080A0F",
              borderRadius: "50%",
              left: "-12px",
              top: "50%",
              transform: "translateY(-50%)",
              borderRight: "1.5px solid rgba(255, 255, 255, 0.12)",
              zIndex: 2,
            }}
          />

          {/* Dashed Perforation Line */}
          <div
            style={{
              borderTop: "2px dashed rgba(255, 255, 255, 0.2)",
              margin: "0 18px",
              position: "relative",
            }}
          />

          {/* Monospace Perforation Label */}
          <div
            style={{
              textAlign: "center",
              fontSize: "8.5px",
              fontWeight: 700,
              color: "#64748B",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              paddingTop: "6px",
            }}
          >
            MARSHAL TEAR-OFF STUB // TELEMETRY SCAN
          </div>

          {/* Right Cutout Notch */}
          <div
            style={{
              position: "absolute",
              width: "24px",
              height: "24px",
              backgroundColor: "#080A0F",
              borderRadius: "50%",
              right: "-12px",
              top: "50%",
              transform: "translateY(-50%)",
              borderLeft: "1.5px solid rgba(255, 255, 255, 0.12)",
              zIndex: 2,
            }}
          />
        </div>

        {/* Scannable Telemetry QR Code Block */}
        <div style={{ padding: "14px 20px 18px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* High-Contrast White Scanning Surface with Corner Crosshair Brackets */}
          <div
            style={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            {/* Top-Left Viewfinder Crosshair */}
            <div
              style={{
                position: "absolute",
                top: "6px",
                left: "6px",
                width: "12px",
                height: "12px",
                borderTop: "3px solid #E10600",
                borderLeft: "3px solid #E10600",
              }}
            />
            {/* Top-Right Viewfinder Crosshair */}
            <div
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "12px",
                height: "12px",
                borderTop: "3px solid #E10600",
                borderRight: "3px solid #E10600",
              }}
            />
            {/* Bottom-Left Viewfinder Crosshair */}
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "6px",
                width: "12px",
                height: "12px",
                borderBottom: "3px solid #E10600",
                borderLeft: "3px solid #E10600",
              }}
            />
            {/* Bottom-Right Viewfinder Crosshair */}
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                right: "6px",
                width: "12px",
                height: "12px",
                borderBottom: "3px solid #E10600",
                borderRight: "3px solid #E10600",
              }}
            />

            <QRCodeSVG value={qrCodeUrl} size={190} level="H" />
          </div>

          {/* Booking / Telemetry Code */}
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px", color: "#64748B", textTransform: "uppercase" }}>
              TELEMETRY CREDENTIAL ID
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
                color: "#FFFFFF",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "1.5px",
              }}
            >
              {registrationId}
            </div>
          </div>

          {/* High-Precision Barcode Graphic Strip */}
          <div
            style={{
              width: "200px",
              height: "22px",
              display: "flex",
              alignItems: "stretch",
              justifyContent: "center",
              gap: "2px",
              marginBottom: "8px",
              opacity: 0.7,
            }}
            aria-hidden="true"
          >
            {[
              2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2,
              1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2
            ].map((width, i) => (
              <span
                key={i}
                style={{
                  width: `${width}px`,
                  backgroundColor: i % 2 === 0 ? "#CBD5E1" : "transparent",
                  display: "inline-block",
                }}
              />
            ))}
          </div>

          <div
            style={{
              fontSize: "9px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#64748B",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            * {cleanId} // VERIFIED MARSHAL PASS *
          </div>

          {/* Marshal Registration Notice */}
          <div
            style={{
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxSizing: "border-box",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#00E676", fontSize: "14px", flexShrink: 0 }}>⚡</span>
            <span style={{ fontSize: "11px", color: "#94A3B8", lineHeight: 1.35 }}>
              Present this credential at Pitstop 01 check-in for wristband accreditation.
            </span>
          </div>

          {/* Pitwall Radio Support */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748B" }}>
            <span>📻 PITWALL RADIO:</span>
            <span style={{ color: "#F1F5F9", fontWeight: 700 }}>{email}</span>
          </div>
        </div>

        {/* Bottom FIA Track Kerbing Micro-Stripe */}
        <div
          style={{
            height: "4px",
            width: "100%",
            backgroundImage: "repeating-linear-gradient(135deg, #E10600 0px, #E10600 12px, #FFFFFF 12px, #FFFFFF 24px)",
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
});

TicketTemplate.displayName = "TicketTemplate";

export default TicketTemplate;

