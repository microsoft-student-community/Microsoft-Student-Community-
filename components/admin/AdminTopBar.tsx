"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AdminTab } from "./AdminNavbar";
import { triggerHaptic } from "@/utils/haptic";
import {
  Menu,
  Search,
  Plus,
  QrCode,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronRight,
  ExternalLink,
  Calendar,
  Megaphone,
  UserPlus,
  ImageIcon,
  FileText,
  Command,
} from "lucide-react";

interface AdminTopBarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  userRole: "admin" | "core_member" | null;
  userEmail: string;
  handleLogout: () => void;
  pendingRequestsCount?: number;
  onOpenQRScanner?: (eventId?: string) => void;
  setIsMobileOpen: (open: boolean) => void;
  onOpenQuickSearch: () => void;
}

const tabBreadcrumbs: Record<AdminTab, { category: string; title: string }> = {
  overview: { category: "Core Dashboard", title: "Overview & Telemetry" },
  analytics: { category: "Core Dashboard", title: "Analytics & Traffic" },
  events: { category: "Operations", title: "Events & Attendance" },
  team: { category: "Operations", title: "Core Team Roster" },
  users: { category: "Operations", title: "Member Accounts" },
  announcements: {
    category: "Content & Publishing",
    title: "Broadcast Notices",
  },
  blogs: { category: "Content & Publishing", title: "Articles & News" },
  gallery: { category: "Content & Publishing", title: "Media Gallery" },
  password_reqs: {
    category: "System & Administration",
    title: "Password Reset Queue",
  },
  settings: { category: "System & Administration", title: "Portal Settings" },
};

export default function AdminTopBar({
  activeTab,
  setActiveTab,
  userRole,
  userEmail,
  handleLogout,
  pendingRequestsCount = 0,
  onOpenQRScanner,
  setIsMobileOpen,
  onOpenQuickSearch,
}: AdminTopBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        quickCreateRef.current &&
        !quickCreateRef.current.contains(e.target as Node)
      ) {
        setIsQuickCreateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const breadcrumb = tabBreadcrumbs[activeTab] || {
    category: "Admin",
    title: "Workspace",
  };
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "A";

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
            {breadcrumb.category}
          </span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="font-syne font-bold text-white text-sm truncate">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      {/* Center: Quick Search Trigger Command Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <button
          onClick={onOpenQuickSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search modules, events, users, notices...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Scanner, Notifications, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Search Mobile Icon */}
        <button
          onClick={onOpenQuickSearch}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Quick Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative" ref={quickCreateRef}>
          <button
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-md shadow-[#0078d4]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {isQuickCreateOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Quick Actions
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("events");
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#0078d4]" />
                <span>New Event</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("announcements");
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
              >
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Broadcast Notice</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("team");
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Add Team Member</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("blogs");
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Write Article</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("gallery");
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>Upload Media</span>
              </button>
            </div>
          )}
        </div>

        {/* QR Scanner trigger */}
        {onOpenQRScanner && (
          <button
            onClick={() => {
              triggerHaptic("light");
              onOpenQRScanner();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Open Attendance QR Scanner"
          >
            <QrCode className="w-4 h-4 text-[#0078d4]" />
          </button>
        )}

        {/* Pending Requests Notification Bell */}
        {userRole === "admin" && (
          <button
            onClick={() => {
              setActiveTab("password_reqs");
            }}
            className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Password Reset Requests"
          >
            <Bell className="w-4 h-4" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center animate-bounce">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        )}

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0078d4] to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow">
              {userInitial}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-200 truncate max-w-[100px]">
              {userEmail.split("@")[0]}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Signed in as
                </span>
                <p className="text-xs text-white font-medium truncate">
                  {userEmail}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#0078d4]/10 border border-[#0078d4]/30 text-[10px] font-mono text-[#a4d8ff] uppercase">
                  {userRole || "Core Member"}
                </span>
              </div>
              <div className="px-2">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    Visit Live Site
                  </span>
                </Link>
                {userRole === "admin" && (
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Portal Settings
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
