"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { triggerHaptic } from "@/utils/haptic";

export type AdminTab =
  | "overview"
  | "events"
  | "team"
  | "gallery"
  | "announcements"
  | "blogs"
  | "users"
  | "password_reqs"
  | "analytics"
  | "settings";

interface AdminNavbarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  userRole: "admin" | "core_member" | null;
  userEmail: string;
  handleLogout: () => void;
  pendingRequestsCount?: number;
  onOpenQRScanner?: (eventId?: string) => void;
}

export default function AdminNavbar({
  activeTab,
  setActiveTab,
  userRole,
  userEmail,
  handleLogout,
  pendingRequestsCount = 0,
  onOpenQRScanner,
}: AdminNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    triggerHaptic("light");
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const navItems = [
    {
      id: "overview" as AdminTab,
      label: "Overview",
      roles: ["admin", "core_member"],
    },
    {
      id: "events" as AdminTab,
      label: "Events",
      roles: ["admin", "core_member"],
    },
    { id: "team" as AdminTab, label: "Team", roles: ["admin", "core_member"] },
    {
      id: "gallery" as AdminTab,
      label: "Gallery",
      roles: ["admin", "core_member"],
    },
    {
      id: "announcements" as AdminTab,
      label: "Notices",
      roles: ["admin", "core_member"],
    },
    {
      id: "blogs" as AdminTab,
      label: "Articles",
      roles: ["admin", "core_member"],
    },
    { id: "users" as AdminTab, label: "Accounts", roles: ["admin"] },
    {
      id: "password_reqs" as AdminTab,
      label: "Resets",
      badge: pendingRequestsCount,
      roles: ["admin"],
    },
    { id: "analytics" as AdminTab, label: "Analytics", roles: ["admin"] },
    { id: "settings" as AdminTab, label: "Settings", roles: ["admin"] },
  ];

  const filteredNav = navItems.filter(
    (item) => userRole && item.roles.includes(userRole),
  );
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "A";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-[#0b0c10]/90 backdrop-blur-2xl border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
            alt="MSC"
            className="w-6 h-6 object-contain"
          />
          <span className="hidden lg:inline-block font-syne font-bold text-xs tracking-wide text-white">
            MSC <span className="text-[#0078d4] font-normal italic">Admin</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar mask-edges flex-1 justify-center">
          {filteredNav.map((link) => (
            <button
              key={link.id}
              onClick={() => handleTabChange(link.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === link.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{link.label}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {onOpenQRScanner && (
            <button
              onClick={() => {
                triggerHaptic("light");
                onOpenQRScanner();
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0078d4]/10 hover:bg-[#0078d4]/20 border border-[#0078d4]/30 text-[#a4d8ff] text-[11px] font-medium transition-all"
            >
              <span>Scan QR</span>
              <i className="fa-solid fa-qrcode text-[10px]"></i>
            </button>
          )}

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0078d4] to-[#5232a8] flex items-center justify-center font-bold text-white text-[10px]">
                {userInitial}
              </div>
              <span className="hidden lg:inline-block text-[11px] font-medium text-white/90 truncate max-w-[120px] pr-1">
                {userEmail.split("@")[0]}
              </span>
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0b0c10]/95 backdrop-blur-2xl border border-white/15 shadow-2xl py-2 flex flex-col animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">
                    Signed in as
                  </p>
                  <p className="text-xs text-white font-medium truncate">
                    {userEmail}
                  </p>
                </div>
                <div className="px-2">
                  <button
                    onClick={() => {
                      handleTabChange("settings");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-gear text-[10px] w-4" /> Account
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 transition-colors flex items-center gap-2 mt-1"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket text-[10px] w-4" />{" "}
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fa-solid ${isMenuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0b0c10]/95 backdrop-blur-3xl border-b border-white/10 shadow-2xl flex flex-col p-4 gap-2 animate-in slide-in-from-top-4 duration-200">
          {filteredNav.map((link) => (
            <button
              key={link.id}
              onClick={() => handleTabChange(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                activeTab === link.id
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
              {link.badge !== undefined && link.badge > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          {onOpenQRScanner && (
            <button
              onClick={() => {
                triggerHaptic("light");
                onOpenQRScanner();
                setIsMenuOpen(false);
              }}
              className="w-full text-center mt-2 px-4 py-3 rounded-xl bg-[#0078d4]/20 border border-[#0078d4]/40 text-[#a4d8ff] text-xs font-medium"
            >
              Scan Check-in QR
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
