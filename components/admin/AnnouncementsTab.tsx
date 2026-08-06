"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptic";
import {
  Megaphone,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
} from "lucide-react";

interface AnnouncementsTabProps {
  announcements: any[];
  loadingAnnouncements: boolean;
  fetchAnnouncements: () => void;
  supabase: any;
  showStatus: (
    id: string,
    msg: string,
    type: "error" | "success" | "info",
  ) => void;
}

export default function AnnouncementsTab({
  announcements,
  loadingAnnouncements,
  fetchAnnouncements,
  supabase,
  showStatus,
}: AnnouncementsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAnnouncements = announcements.filter((a) => {
    const titleMatch =
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const prioMatch =
      priorityFilter === "all" ||
      a.priority?.toLowerCase() === priorityFilter.toLowerCase();
    return titleMatch && prioMatch;
  });

  const openCreateModal = () => {
    triggerHaptic("light");
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    triggerHaptic("light");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const payload = {
        title: formData.get("title"),
        content: formData.get("content"),
        priority: formData.get("priority") || "normal",
        is_active: formData.get("is_active") === "on",
      };

      if (editingItem) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
        showStatus("annc_save", "Broadcast notice updated!", "success");
      } else {
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
        showStatus("annc_save", "Broadcast notice published!", "success");
      }

      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      showStatus(
        "annc_save",
        err.message || "Failed to save announcement",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this notice broadcast?"))
      return;
    try {
      triggerHaptic("medium");
      showStatus("annc_del", "Deleting announcement...", "info");
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) throw error;
      showStatus("annc_del", "Notice deleted!", "success");
      fetchAnnouncements();
    } catch (err: any) {
      showStatus("annc_del", err.message || "Failed to delete", "error");
    }
  }

  async function handleToggleActive(id: string, currentState: boolean) {
    try {
      triggerHaptic("light");
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !currentState })
        .eq("id", id);
      if (!error) fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  }

  const activeCount = announcements.filter((a) => a.is_active !== false).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#a4d8ff] tracking-widest uppercase">
            &#47;&#47; BROADCAST COMMUNICATIONS
          </span>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Campus Notices ({announcements.length})
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-lg shadow-[#0078d4]/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast New Notice</span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search broadcast notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "high", "normal", "low"].map((prio) => (
            <button
              key={prio}
              onClick={() => setPriorityFilter(prio)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
                priorityFilter === prio
                  ? "bg-[#0078d4] text-white"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {prio}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      {loadingAnnouncements ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
          Loading notice broadcasts...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
          No notices matching criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => {
            const isActive = item.is_active !== false;
            const prio = (item.priority || "normal").toLowerCase();

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        prio === "high" || prio === "urgent"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : prio === "normal"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {prio} priority
                    </span>

                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-syne font-bold text-base text-white">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleToggleActive(item.id, isActive)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{" "}
                        Active Broadcast
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />{" "}
                        Paused
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Notice Composer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-syne font-bold text-base text-white">
                {editingItem
                  ? "Edit Broadcast Notice"
                  : "Broadcast Campus Notice"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notice Headline *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingItem?.title || ""}
                  placeholder="e.g. Hackathon Registration Extension"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority Level
                </label>
                <select
                  name="priority"
                  defaultValue={editingItem?.priority || "normal"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                >
                  <option value="high">High / Urgent</option>
                  <option value="normal">Normal / Alert</option>
                  <option value="low">Low / Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notice Content *
                </label>
                <textarea
                  name="content"
                  rows={4}
                  required
                  defaultValue={editingItem?.content || ""}
                  placeholder="Details of campus alert..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingItem?.is_active !== false}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-[#0078d4]"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs text-slate-300 font-medium"
                >
                  Broadcast Immediately Live
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0078d4] hover:bg-[#0060aa] text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Broadcasting..."
                    : editingItem
                      ? "Update Notice"
                      : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
