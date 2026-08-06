"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export default function QRScanner() {
  const supabase = createClient();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<{
    type: "success" | "error" | "warning";
    msg: string;
    attendee?: any;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase
      .from("events")
      .select("id, title")
      .order("date", { ascending: false });
    if (data && data.length > 0) {
      setEvents(data);
      setSelectedEventId(data[0].id);
    }
  }

  async function processQRData(qrData: string) {
    setScanResult(qrData);
    setCheckinStatus(null);

    try {
      let regId = qrData;
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.registrationId) regId = parsed.registrationId;
        if (parsed.id) regId = parsed.id;
      } catch {}

      const { data: reg, error } = await supabase
        .from("registrations")
        .select("*, events(title)")
        .eq("id", regId)
        .single();

      if (error || !reg) {
        setCheckinStatus({
          type: "error",
          msg: "Invalid QR code. Registration record not found.",
        });
        return;
      }

      if (reg.checked_in) {
        setCheckinStatus({
          type: "warning",
          msg: `Already checked in on ${new Date(reg.checked_in_at).toLocaleTimeString()}`,
          attendee: reg,
        });
        return;
      }

      const { error: updateErr } = await supabase
        .from("registrations")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", reg.id);

      if (updateErr) throw updateErr;

      setCheckinStatus({
        type: "success",
        msg: "Attendee checked in successfully!",
        attendee: reg,
      });
    } catch (err: any) {
      setCheckinStatus({
        type: "error",
        msg: err.message || "Failed to process check-in.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 text-xs text-white">
      <div className="flex flex-col gap-2">
        <label className="text-white/70 font-medium">Select Active Event</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0078d4]"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id} className="bg-[#0b0c10]">
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Camera Preview Box */}
      <div className="relative w-full h-64 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center overflow-hidden">
        <div id="reader" className="w-full h-full" />

        {!isScanning && (
          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-qrcode text-4xl text-[#0078d4]" />
            <p className="text-white/60">
              Position QR code inside the frame to scan
            </p>
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <div className="flex flex-col gap-2">
        <label className="text-white/70 font-medium">
          Or enter Registration ID manually
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste Registration ID or QR payload"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                processQRData(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#0078d4]"
          />
        </div>
      </div>

      {/* Result Status Alert */}
      {checkinStatus && (
        <div
          className={`p-4 rounded-2xl border flex flex-col gap-2 backdrop-blur-xl ${
            checkinStatus.type === "success"
              ? "bg-[#52d69b]/20 border-[#52d69b]/40 text-[#52d69b]"
              : checkinStatus.type === "warning"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <i
              className={`fas ${
                checkinStatus.type === "success"
                  ? "fa-circle-check"
                  : checkinStatus.type === "warning"
                    ? "fa-triangle-exclamation"
                    : "fa-circle-xmark"
              }`}
            />
            <span>{checkinStatus.msg}</span>
          </div>

          {checkinStatus.attendee && (
            <div className="text-xs opacity-90 mt-1 pt-2 border-t border-current/20 flex flex-col gap-0.5 font-mono">
              <span>
                Name: {checkinStatus.attendee.form_data?.fullName || "N/A"}
              </span>
              <span>
                Email: {checkinStatus.attendee.form_data?.email || "N/A"}
              </span>
              <span>
                Event: {checkinStatus.attendee.events?.title || "N/A"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
