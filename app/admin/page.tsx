"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import ParticleBackground from "@/components/ParticleBackground";

import Preloader from "@/components/admin/Preloader";
import AdminNavbar, { AdminTab } from "@/components/admin/AdminNavbar";

const OverviewTab = dynamic(() => import("@/components/admin/OverviewTab"));
const EventsTab = dynamic(() => import("@/components/admin/EventsTab"));
const TeamTab = dynamic(() => import("@/components/admin/TeamTab"));
const GalleryTab = dynamic(() => import("@/components/admin/GalleryTab"));
const AnnouncementsTab = dynamic(
  () => import("@/components/admin/AnnouncementsTab"),
);
const BlogsTab = dynamic(() => import("@/components/admin/BlogsTab"));
const UsersTab = dynamic(() => import("@/components/admin/UsersTab"));
const PasswordRequestsTab = dynamic(
  () => import("@/components/admin/PasswordRequestsTab"),
);
const SettingsTab = dynamic(() => import("@/components/admin/SettingsTab"));

const AnalyticsDashboard = dynamic(
  () => import("@/components/admin/AnalyticsDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-6 py-12">
        <div className="h-8 bg-slate-800/50 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-2xl h-24" />
          ))}
        </div>
        <div className="bg-slate-800/40 rounded-2xl h-72" />
      </div>
    ),
  },
);

const QRScanner = dynamic(() => import("@/app/admin/QRScanner"), {
  ssr: false,
});

export default function AdminPage() {
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [userRole, setUserRole] = useState<"admin" | "core_member" | null>(
    null,
  );
  const [userEmail, setUserEmail] = useState<string>("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrEventId, setQrEventId] = useState<string | undefined>(undefined);
  const [isAppReady, setIsAppReady] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [statusMsg, setStatusMsg] = useState<{
    id: string;
    msg: string;
    type: "error" | "success" | "info";
  } | null>(null);

  useEffect(() => {
    checkUserSessionAndRole();
  }, []);

  useEffect(() => {
    if (isAppReady && videoRef.current) {
      videoRef.current.play().catch((e) => function () {});
    }
  }, [isAppReady]);

  useEffect(() => {
    if (!userRole) return;
    if (activeTab === "overview") {
      fetchEvents();
      fetchTeam();
      fetchGallery();
      fetchAnnouncements();
      fetchPendingRequestsCount();
    } else if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "team") {
      fetchTeam();
    } else if (activeTab === "gallery") {
      fetchGallery();
    } else if (activeTab === "announcements") {
      fetchAnnouncements();
    } else if (activeTab === "blogs") {
      fetchBlogs();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "password_reqs") {
      fetchPendingRequestsCount();
    }
  }, [activeTab, userRole]);

  async function checkUserSessionAndRole() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(session.user?.email || "");

      const { data } = await supabase
        .from("member_profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (data && data.role) {
        setUserRole(data.role);
      } else {
        setUserRole("core_member");
      }
    } catch (err) {
      console.error("Auth session check error:", err);
      setUserRole("core_member");
    }
  }

  function showStatus(
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) {
    setStatusMsg({ id, msg, type });
    setTimeout(() => setStatusMsg(null), 4000);
  }

  async function fetchEvents() {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) setEvents(data);
    setLoadingEvents(false);
  }

  async function fetchTeam() {
    setLoadingTeam(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });
    if (!error && data) setTeam(data);
    setLoadingTeam(false);
  }

  async function fetchGallery() {
    setLoadingGallery(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setGallery(data);
    setLoadingGallery(false);
  }

  async function fetchAnnouncements() {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAnnouncements(data);
    setLoadingAnnouncements(false);
  }

  async function fetchBlogs() {
    setLoadingBlogs(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBlogs(data);
    setLoadingBlogs(false);
  }

  async function fetchUsers() {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from("member_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUsers(data);
    setLoadingUsers(false);
  }

  async function fetchPendingRequestsCount() {
    const { data, error } = await supabase
      .from("password_reset_requests")
      .select("id")
      .eq("status", "pending");
    if (!error && data) {
      setPendingRequestsCount(data.length);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const handleOpenQRScanner = (eventId?: string) => {
    setQrEventId(eventId);
    setIsQRScannerOpen(true);
  };

  if (!isAppReady || userRole === null) {
    return (
      <Preloader
        message="MICROSOFT STUDENT COMMUNITY"
        subtext="VERIFYING ADMIN HANDSHAKE..."
        onComplete={() => setIsAppReady(true)}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b0c10] text-slate-100 selection:bg-[#0078d4] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Background Video */}
      <video
        className="background-video opacity-20 pointer-events-none"
        muted
        loop
        playsInline
        id="bgVideo"
        autoPlay
        preload="metadata"
        ref={videoRef}
      >
        <source
          src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/Microsoft_Student_Community_Title_Card.mp4"
          type="video/mp4"
        />
      </video>
      <div className="background-overlay !bg-[#0b0c10]/90 pointer-events-none"></div>
      <ParticleBackground particleColor="rgba(0, 120, 212, alpha)" />

      {/* Top Floating Admin Navbar */}
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        userEmail={userEmail}
        handleLogout={handleLogout}
        pendingRequestsCount={pendingRequestsCount}
        onOpenQRScanner={handleOpenQRScanner}
      />

      {/* Main Workspace Canvas */}
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto min-h-screen">
        {/* Toast Notification Container */}
        {statusMsg && (
          <div className="fixed top-20 right-6 z-[110] animate-in fade-in slide-in-from-top-3 duration-300">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl text-xs font-medium ${
                statusMsg.type === "success"
                  ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                  : statusMsg.type === "error"
                    ? "bg-rose-950/80 border-rose-800 text-rose-300"
                    : "bg-blue-950/80 border-blue-800 text-blue-300"
              }`}
            >
              <i
                className={`fa-solid ${
                  statusMsg.type === "success"
                    ? "fa-circle-check text-sm text-emerald-400"
                    : statusMsg.type === "error"
                      ? "fa-triangle-exclamation text-sm text-rose-400"
                      : "fa-info-circle text-sm text-blue-400"
                }`}
              />
              <span>{statusMsg.msg}</span>
            </div>
          </div>
        )}

        {/* Tab Components */}
        <main className="w-full">
          {activeTab === "overview" && (
            <OverviewTab
              events={events}
              team={team}
              gallery={gallery}
              announcements={announcements}
              setActiveTab={setActiveTab}
              userRole={userRole}
              userEmail={userEmail}
              onOpenQRScanner={handleOpenQRScanner}
            />
          )}

          {activeTab === "events" && (
            <EventsTab
              events={events}
              loadingEvents={loadingEvents}
              fetchEvents={fetchEvents}
              supabase={supabase}
              showStatus={showStatus}
              onOpenQRScanner={handleOpenQRScanner}
            />
          )}

          {activeTab === "team" && (
            <TeamTab
              team={team}
              loadingTeam={loadingTeam}
              fetchTeam={fetchTeam}
              supabase={supabase}
              showStatus={showStatus}
            />
          )}

          {activeTab === "gallery" && (
            <GalleryTab
              gallery={gallery}
              loadingGallery={loadingGallery}
              fetchGallery={fetchGallery}
              supabase={supabase}
              showStatus={showStatus}
            />
          )}

          {activeTab === "announcements" && (
            <AnnouncementsTab
              announcements={announcements}
              loadingAnnouncements={loadingAnnouncements}
              fetchAnnouncements={fetchAnnouncements}
              supabase={supabase}
              showStatus={showStatus}
            />
          )}

          {activeTab === "blogs" && (
            <BlogsTab
              blogs={blogs}
              loadingBlogs={loadingBlogs}
              fetchBlogs={fetchBlogs}
              supabase={supabase}
              showStatus={showStatus}
            />
          )}

          {activeTab === "users" && userRole === "admin" && (
            <UsersTab
              users={users}
              loadingUsers={loadingUsers}
              fetchUsers={fetchUsers}
              supabase={supabase}
              showStatus={showStatus}
              userRole={userRole}
            />
          )}

          {activeTab === "password_reqs" && userRole === "admin" && (
            <PasswordRequestsTab />
          )}

          {activeTab === "analytics" && userRole === "admin" && (
            <AnalyticsDashboard />
          )}

          {activeTab === "settings" && userRole === "admin" && <SettingsTab />}
        </main>
      </div>

      {/* QR Scanner Modal */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl bg-[#0b0c10]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-syne flex items-center gap-2.5">
                <i className="fa-solid fa-qrcode text-[#0078d4]" />
                QR Attendance Check-in
              </h3>
              <button
                onClick={() => setIsQRScannerOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
            <div className="p-6">
              <QRScanner />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
