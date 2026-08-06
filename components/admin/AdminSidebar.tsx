"use client";

import React from "react";
import Link from "next/link";
import { AdminTab } from "./AdminNavbar";
import { triggerHaptic } from "@/utils/haptic";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Image as ImageIcon,
  Megaphone,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  userRole: "admin" | "core_member" | null;
  userEmail: string;
  handleLogout: () => void;
  pendingRequestsCount?: number;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenQRScanner?: (eventId?: string) => void;
}

interface NavSection {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    roles: ("admin" | "core_member")[];
    accent?: string;
  }[];
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  userRole,
  userEmail,
  handleLogout,
  pendingRequestsCount = 0,
  collapsed,
  setCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenQRScanner,
}: AdminSidebarProps) {
  const handleTabChange = (tab: AdminTab) => {
    triggerHaptic("light");
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navSections: NavSection[] = [
    {
      title: "Core Dashboard",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
          roles: ["admin", "core_member"],
        },
        {
          id: "analytics",
          label: "Analytics & Traffic",
          icon: BarChart3,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Operations & Community",
      items: [
        {
          id: "events",
          label: "Events & Attendance",
          icon: Calendar,
          roles: ["admin", "core_member"],
        },
        {
          id: "team",
          label: "Core Team Roster",
          icon: Users,
          roles: ["admin", "core_member"],
        },
        {
          id: "users",
          label: "Member Accounts",
          icon: ShieldCheck,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Content & Publishing",
      items: [
        {
          id: "announcements",
          label: "Broadcast Notices",
          icon: Megaphone,
          roles: ["admin", "core_member"],
        },
        {
          id: "blogs",
          label: "Articles & News",
          icon: FileText,
          roles: ["admin", "core_member"],
        },
        {
          id: "gallery",
          label: "Media Gallery",
          icon: ImageIcon,
          roles: ["admin", "core_member"],
        },
      ],
    },
    {
      title: "System & Administration",
      items: [
        {
          id: "password_reqs",
          label: "Password Queue",
          icon: ShieldAlert,
          badge: pendingRequestsCount,
          roles: ["admin"],
          accent: "text-amber-400",
        },
        {
          id: "settings",
          label: "Portal Settings",
          icon: Settings,
          roles: ["admin"],
        },
      ],
    },
  ];

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "A";

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#0b0f19] border-r border-slate-800/80 text-slate-300 select-none">
      {/* Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0078d4] to-[#004e8c] shadow-lg shadow-[#0078d4]/20 shrink-0">
            <img
              src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
              alt="MSC"
              className="w-5 h-5 object-contain filter drop-shadow"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-syne font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
                MSC{" "}
                <span className="text-[#0078d4] font-normal italic">CRM</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Portal
              </span>
            </div>
          )}
        </div>

        {/* Mobile close or Collapse toggle */}
        <button
          onClick={() => {
            if (isMobileOpen) setIsMobileOpen(false);
            else setCollapsed(!collapsed);
          }}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button (QR Check-in) */}
      {onOpenQRScanner && (
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              triggerHaptic("light");
              onOpenQRScanner();
            }}
            className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#0078d4]/10 hover:bg-[#0078d4]/20 border border-[#0078d4]/30 text-[#a4d8ff] hover:text-white text-xs font-semibold transition-all group shadow-sm ${
              collapsed ? "px-0" : ""
            }`}
            title="Scan Attendance QR"
          >
            <QrCode className="w-4 h-4 text-[#0078d4] group-hover:scale-110 transition-transform" />
            {!collapsed && <span>Scan Attendance QR</span>}
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 no-scrollbar">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(
            (item) => userRole && item.roles.includes(userRole),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase mb-2">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? "bg-[#0078d4] text-white shadow-md shadow-[#0078d4]/25"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-white"
                              : item.accent ||
                                "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!collapsed &&
                        item.badge !== undefined &&
                        item.badge > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black animate-pulse">
                            {item.badge}
                          </span>
                        )}

                      {/* Tooltip badge dot for collapsed mode */}
                      {collapsed &&
                        item.badge !== undefined &&
                        item.badge > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 shrink-0">
        <div
          className={`flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 ${
            collapsed ? "justify-center p-1.5" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0078d4] to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow shrink-0">
              {userInitial}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  {userRole || "Member"}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 h-screen z-50 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {renderContent()}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
