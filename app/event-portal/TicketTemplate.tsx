"use client";

import { QRCodeSVG } from "qrcode.react";
import { Ticket } from "lucide-react";

interface TicketTemplateProps {
  event: any;
  registration: any;
  hashPayload: string;
  qrUrl: string;
}

export function TicketTemplate({
  event,
  registration,
  hashPayload,
  qrUrl,
}: TicketTemplateProps) {
  const formData = registration?.form_data || {};
  const teamData = registration?.team_data;
  const startDate = event?.date_start
    ? new Date(event.date_start).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "TBA";

  return (
    <div
      style={{
        width: 420,
        minHeight: 560,
        background:
          "linear-gradient(145deg, #0f0f14 0%, #1a1a24 50%, #0f0f14 100%)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Header Band */}
      <div
        style={{
          background: "linear-gradient(135deg, #0078d4 0%, #5b5fc7 100%)",
          padding: "24px 28px 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                opacity: 0.8,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              MSC SRMAP — Event Ticket
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: 260,
              }}
            >
              {event?.title || "Event"}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            <Ticket size={24} color="rgba(255,255,255,0.9)" />
          </div>
        </div>
      </div>

      {/* Ticket Perforation */}
      <div
        style={{
          height: 1,
          background:
            "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px)",
        }}
      />

      {/* Body */}
      <div style={{ padding: "24px 28px" }}>
        {/* Attendee Info */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Attendee
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {formData.fullName || "Participant"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              marginTop: 2,
            }}
          >
            {formData.email || ""}
          </div>
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Date
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{startDate}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Location
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {event?.location || "SRMAP Campus"}
            </div>
          </div>
          {formData.regNum && (
            <div>
              <div
                style={{
                  fontSize: 9,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Reg No.
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {formData.regNum}
              </div>
            </div>
          )}
          {teamData?.team_name && (
            <div>
              <div
                style={{
                  fontSize: 9,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Team
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {teamData.team_name}
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              display: "inline-flex",
              flexDirection: "column" as const,
              alignItems: "center",
              gap: 8,
            }}
          >
            <QRCodeSVG
              value={qrUrl || hashPayload || ""}
              size={140}
              level="M"
            />
            <div
              style={{
                fontSize: 8,
                color: "#666",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                fontWeight: 600,
              }}
            >
              {hashPayload?.substring(0, 8)?.toUpperCase() || "TICKET"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center" as const,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.1em",
            }}
          >
            Present this QR code at the event venue for check-in
          </div>
        </div>
      </div>
    </div>
  );
}
