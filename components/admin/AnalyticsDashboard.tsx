"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { triggerHaptic } from "@/utils/haptic";
import {
  BarChart3,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  RotateCw,
  Sparkles,
} from "lucide-react";

type EventStat = {
  title: string;
  teamsRegistered: number;
  individualsRegistered: number;
  totalMembers: number;
  checkedInMembers: number;
  checkinRate: number;
};

export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalParticipants: 0,
    checkInRate: 0,
  });
  const [eventStats, setEventStats] = useState<EventStat[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [{ count: usersCount }, { count: eventsCount }, { data: regs }] =
        await Promise.all([
          supabase
            .from("member_profiles")
            .select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase
            .from("registrations")
            .select(
              "created_at, checked_in, form_data, team_data, event_id, events(title)",
            ),
        ]);

      const totalRegs = regs?.length || 0;
      let totalParticipantsCount = 0;
      let checkedInCount = 0;
      const eventMap: Record<string, EventStat> = {};

      if (regs) {
        regs.forEach((reg) => {
          const isTeam =
            reg.team_data &&
            typeof reg.team_data === "object" &&
            Array.isArray((reg.team_data as any).members);
          const teamMembers = isTeam
            ? ((reg.team_data as any).members as any[])
            : [];
          const attendeeCount = 1 + teamMembers.length;
          totalParticipantsCount += attendeeCount;

          let isCheckedIn = false;
          if (reg.checked_in) {
            checkedInCount += attendeeCount;
            isCheckedIn = true;
          }

          const eventTitle = (reg.events as any)?.title || "Unknown Event";
          if (!eventMap[eventTitle]) {
            eventMap[eventTitle] = {
              title: eventTitle,
              teamsRegistered: 0,
              individualsRegistered: 0,
              totalMembers: 0,
              checkedInMembers: 0,
              checkinRate: 0,
            };
          }

          if (isTeam) {
            eventMap[eventTitle].teamsRegistered += 1;
          } else {
            eventMap[eventTitle].individualsRegistered += 1;
          }
          eventMap[eventTitle].totalMembers += attendeeCount;
          if (isCheckedIn) {
            eventMap[eventTitle].checkedInMembers += attendeeCount;
          }
        });
      }

      const calculatedEvents = Object.values(eventMap).map((item) => ({
        ...item,
        checkinRate:
          item.totalMembers > 0
            ? Math.round((item.checkedInMembers / item.totalMembers) * 100)
            : 0,
      }));

      const overallRate =
        totalParticipantsCount > 0
          ? Math.round((checkedInCount / totalParticipantsCount) * 100)
          : 0;

      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalRegistrations: totalRegs,
        totalParticipants: totalParticipantsCount,
        checkInRate: overallRate,
      });

      setEventStats(calculatedEvents);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnalytics();
    const channel = supabase
      .channel("analytics_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => fetchAnalytics(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnalytics, supabase]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase">
            {"// TELEMETRY & INSIGHTS"}
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Analytics Dashboard
          </h1>
        </div>

        <button
          onClick={() => {
            triggerHaptic("light");
            fetchAnalytics();
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Accounts</span>
            <Users className="w-4 h-4 text-[#0078d4]" />
          </div>
          <p className="font-syne font-extrabold text-3xl text-white">
            {stats.totalUsers}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">
            Core & Member Profiles
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Events</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-syne font-extrabold text-3xl text-white">
            {stats.totalEvents}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">
            Events in Registry
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registrations</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-syne font-extrabold text-3xl text-white">
            {stats.totalRegistrations}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">
            Form Submissions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Participants</span>
            <UserCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="font-syne font-extrabold text-3xl text-white">
            {stats.totalParticipants}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">
            Individual + Team Members
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Check-in Rate</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-syne font-extrabold text-3xl text-amber-400">
            {stats.checkInRate}%
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">
            Attendance Rate
          </span>
        </div>
      </div>

      {/* Per-Event Breakdown Cards */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-syne font-bold text-base text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#0078d4]" />
          Event Participation & Attendance Telemetry
        </h3>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs animate-pulse">
            Calculating event telemetry metrics...
          </div>
        ) : eventStats.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No registration telemetry recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {eventStats.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-syne font-bold text-sm text-white">
                    {item.title}
                  </h4>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {item.checkedInMembers} / {item.totalMembers} Checked-in (
                    {item.checkinRate}%)
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0078d4] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(item.checkinRate, 100)}%` }}
                  />
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span>Teams: {item.teamsRegistered}</span>
                  <span>Individuals: {item.individualsRegistered}</span>
                  <span>Total Headcount: {item.totalMembers}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
