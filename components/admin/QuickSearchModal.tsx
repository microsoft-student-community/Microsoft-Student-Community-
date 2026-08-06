"use client";

import React, { useState, useEffect } from "react";
import { AdminTab } from "./AdminNavbar";
import {
  Search,
  X,
  Calendar,
  Users,
  ImageIcon,
  Megaphone,
  FileText,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Settings,
  LayoutDashboard,
} from "lucide-react";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: AdminTab) => void;
  userRole: "admin" | "core_member" | null;
}

export default function QuickSearchModal({
  isOpen,
  onClose,
  setActiveTab,
  userRole,
}: QuickSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allItems: {
    id: AdminTab;
    title: string;
    description: string;
    icon: React.ElementType;
    roleRequired?: "admin";
  }[] = [
    {
      id: "overview",
      title: "Overview Command Dashboard",
      description:
        "View real-time telemetry, featured events, and roster metrics",
      icon: LayoutDashboard,
    },
    {
      id: "events",
      title: "Events & Attendance Scanner",
      description: "Manage portal events, QR check-ins, dates & venues",
      icon: Calendar,
    },
    {
      id: "team",
      title: "Core Team Roster Directory",
      description: "Manage leads, domain heads, bios and social links",
      icon: Users,
    },
    {
      id: "gallery",
      title: "Media Asset Gallery",
      description: "Upload and categorize event photos and highlights",
      icon: ImageIcon,
    },
    {
      id: "announcements",
      title: "Broadcast Notices",
      description: "Publish live alert banners and campus notice broadcasts",
      icon: Megaphone,
    },
    {
      id: "blogs",
      title: "Editorial Articles & News",
      description: "Publish blog posts, tech articles, and community stories",
      icon: FileText,
    },
    {
      id: "users",
      title: "Member Accounts & Roles",
      description: "Access control, member profiles, and role management",
      icon: ShieldCheck,
      roleRequired: "admin",
    },
    {
      id: "password_reqs",
      title: "Password Reset Queue",
      description: "Review and approve pending security reset requests",
      icon: ShieldAlert,
      roleRequired: "admin",
    },
    {
      id: "analytics",
      title: "Analytics & Telemetry",
      description: "Portal traffic, page views, and registration metrics",
      icon: BarChart3,
      roleRequired: "admin",
    },
    {
      id: "settings",
      title: "Portal Configuration Settings",
      description: "Manage security, system preferences, and integration keys",
      icon: Settings,
      roleRequired: "admin",
    },
  ];

  const filtered = allItems.filter((item) => {
    if (item.roleRequired === "admin" && userRole !== "admin") return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0e1424] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search workspace modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No matching modules found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-[#0078d4] group-hover:text-white group-hover:bg-[#0078d4] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#a4d8ff] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                    Jump to &rarr;
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Navigation Shortcuts</span>
          <div className="flex items-center gap-2">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                ESC
              </kbd>{" "}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
